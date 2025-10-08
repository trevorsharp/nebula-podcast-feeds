import { z } from 'zod';
import { withCache } from './cacheService';
import channelValidator from '../types/channelValidator';
import logZodError from '../utils/logZodError';
import videoValidator from '../types/videoValidator';

const getAuthToken = withCache('nebula-auth-token', 23 * 60 * 60, async () => {
  const authToken = process.env.NEBULA_AUTH_TOKEN;

  const authResponseValidator = z.object({
    token: z.string().min(1),
  });

  const authResponse = await fetch('https://users.api.nebula.app/api/v1/authorization/', {
    method: 'POST',
    headers: {
      authorization: `Token ${authToken}`,
      accept: 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Received response with status ${response.status}`);
      return response.json();
    })
    .then((data) => authResponseValidator.parse(data).token)
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  return authResponse;
});

const getChannel = async (searchText: string) => {
  const channel = await searchChannel(searchText);

  if (!channel) {
    return undefined;
  }

  const videos = await getVideos(channel.id);

  return { ...channel, videos };
};

const searchChannel = withCache(
  'nebula-channel-search-',
  7 * 24 * 60 * 60,
  async (searchText: string) => {
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

    const channel = await fetch(
      `https://content.api.nebula.app/video_channels/search/?q=${encodeURIComponent(searchText)}`,
    )
      .then((response) => {
        if (!response.ok) throw new Error(`Received response with status ${response.status}`);
        return response.json();
      })
      .then((data) => channelResponseValidator.parse(data).results[0])
      .catch((error) => {
        console.error(error);
        return undefined;
      });
      
    if (!channel) {
      return undefined;
    }

    const { data, error } = channelValidator.safeParse({
      id: channel.id,
      name: channel.title,
      description: channel.description,
      imageUrl: channel.images.avatar.src,
      link: channel.share_url,
    });

    if (error) {
      logZodError(error);
      return undefined;
    }

    return data;
  },
);

const getVideos = withCache('nebula-videos-', 15 * 60, async (channelId: string) => {
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

  const videos = await fetch(
    `https://content.api.nebula.app/video_channels/${channelId}/video_episodes/?ordering=-published_at`,
  )
    .then((response) => {
      if (!response.ok) throw new Error(`Received response with status ${response.status}`);
      return response.json();
    })
    .then((data) => videoResponseValidator.parse(data).results)
    .catch((error) => {
      console.error(error);
      return [];
    });

  const { data, error } = z.array(videoValidator).safeParse(
    videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      duration: video.duration,
      date: new Date(video.published_at).toISOString(),
      link: video.share_url,
    })),
  );

  if (error) {
    logZodError(error);
    return [];
  }

  return data;
});

export default { getAuthToken, getChannel };
