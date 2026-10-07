import { withCache } from 'podcast-feeds';
import { z } from 'zod';

if (!process.env.NEBULA_AUTH_TOKEN) {
  throw new Error('NEBULA_AUTH_TOKEN environment variable is required');
}

const getAuthToken = withCache({ cacheKey: 'nebula-auth-token', timeToLive: 23 * 60 * 60 }, () =>
  fetch('https://users.api.nebula.app/api/v1/authorization/', {
    method: 'POST',
    headers: {
      authorization: `Token ${process.env.NEBULA_AUTH_TOKEN}`,
      accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => z.object({ token: z.string().min(1) }).parse(data).token)
    .catch((error) => {
      console.error(error);
      return undefined;
    }),
);

export const searchForChannel = async (searchText: string) => {
  const channelResponseValidator = z.object({
    results: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          images: z.object({
            avatar: z.object({
              src: z.string(),
            }),
          }),
          share_url: z.string(),
        }),
      )
      .min(1),
  });

  return await fetch(`https://content.api.nebula.app/video_channels/search/?q=${encodeURIComponent(searchText)}`)
    .then((response) => response.json())
    .then((data) => channelResponseValidator.parse(data).results)
    .then(
      (channels) =>
        channels.find(
          ({ share_url }) => share_url.split('/').filter(Boolean).pop()?.toLowerCase() === searchText.toLowerCase(),
        ) ??
        channels.find(({ title }) => title.toLowerCase() === searchText.toLowerCase()) ??
        channels[0],
    )
    .catch((error) => {
      console.error(error);
      return undefined;
    });
};

export const fetchVideosForChannel = async (channelId: string) => {
  const videoResponseValidator = z.object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        duration: z.number(),
        published_at: z.coerce.date(),
        share_url: z.string(),
      }),
    ),
  });

  return await fetch(
    `https://content.api.nebula.app/video_channels/${channelId}/video_episodes/?ordering=-published_at`,
  )
    .then((response) => response.json())
    .then((data) => videoResponseValidator.parse(data).results)
    .catch((error) => {
      console.error(error);
      return [];
    });
};

export const getStreamingUrl = async (contentId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) return undefined;

  return `https://content.api.nebula.app/video_episodes/${contentId}/manifest.m3u8?token=${authToken}`;
};
