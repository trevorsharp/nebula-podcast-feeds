import { z } from 'zod';
import { channelSchema } from '../types/channel';
import { episodesSchema } from '../types/episode';
import { withCache } from './cacheService';

const getAuthToken = withCache('nebula-auth-token', 23 * 60 * 60, async () => {
  // const loginResponse = await fetch('https://nebula.tv/auth/login/', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     email: process.env.NEBULA_EMAIL,
  //     password: process.env.NEBULA_PASSWORD,
  //   }),
  //   headers: {
  //     'content-type': 'application/json',
  //     accept: 'application/json',
  //   },
  // });

  // if (loginResponse.status !== 200) {
  //   throw `Failed to login to Nebula - ${loginResponse.statusText}`;
  // }

  // const authToken = await loginResponse
  //   .json()
  //   .then((responseBody) => z.object({ key: z.string() }).parse(responseBody).key);

  const authToken = process.env.NEBULA_AUTH_TOKEN;

  const authResponse = await fetch('https://users.api.nebula.app/api/v1/authorization/', {
    method: 'POST',
    headers: {
      authorization: `Token ${authToken}`,
      accept: 'application/json',
    },
  });

  if (authResponse.status !== 200) {
    throw `Failed to get auth token for Nebula - ${authResponse.statusText}`;
  }

  return await authResponse.json().then((responseBody) => z.object({ token: z.string() }).parse(responseBody).token);
});

const searchForChannel = withCache('nebula-channel-search-', 7 * 24 * 60 * 60, async (searchText: string) => {
  const response = await fetch(
    `https://content.api.nebula.app/video_channels/search/?q=${encodeURIComponent(searchText)}`
  );

  if (response.status !== 200) {
    throw `Failed to search for channel - ${response.statusText}`;
  }

  return await response.json().then((responseBody) => channelSchema.parse(responseBody));
});

const getEpisodes = withCache('nebula-episodes-', 15 * 60, async (channelId: string) => {
  const response = await fetch(
    `https://content.api.nebula.app/video_channels/${channelId}/video_episodes/?ordering=-published_at`
  );

  if (response.status !== 200) {
    throw `Failed to fetch episodes - ${response.statusText}`;
  }

  return await response.json().then((responseBody) => episodesSchema.parse(responseBody));
});

const getVideoUrl = async (videoId: string) => {
  const authToken = await getAuthToken();

  return `https://content.api.nebula.app/video_episodes/${videoId}/manifest.m3u8?token=${authToken}`;
};

export { searchForChannel, getEpisodes, getVideoUrl };
