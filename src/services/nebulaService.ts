import { z } from 'zod';
import { Channel, channelSchema } from '../types/channel';
import { Episode, episodesSchema } from '../types/episode';
import { get as getCache, set as setCache } from './cacheService';

const getAuthToken = async () => {
  const cacheKey = 'nebula-auth-token';
  const cacheResult = getCache<string>(cacheKey);

  if (cacheResult) return cacheResult;

  const loginResponse = await fetch('https://nebula.tv/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      email: process.env.NEBULA_EMAIL,
      password: process.env.NEBULA_PASSWORD,
    }),
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
  });

  if (loginResponse.status !== 200) {
    throw `Failed to login to Nebula - ${loginResponse.statusText}`;
  }

  const authKey = await loginResponse
    .json()
    .then((responseBody) => z.object({ key: z.string() }).parse(responseBody).key);

  const authResponse = await fetch('https://users.api.nebula.app/api/v1/authorization/', {
    method: 'POST',
    headers: {
      authorization: `Token ${authKey}`,
      accept: 'application/json',
    },
  });

  if (authResponse.status !== 200) {
    throw `Failed to get auth token for Nebula - ${authResponse.statusText}`;
  }

  const authToken = await authResponse
    .json()
    .then((responseBody) => z.object({ token: z.string() }).parse(responseBody).token);

  setCache<string>(cacheKey, authToken, 23 * 60 * 60);

  return authToken;
};

const searchForChannel = async (searchText: string) => {
  const cacheKey = `channel-search-${searchText}`;
  const cacheResult = getCache<Channel>(cacheKey);

  if (cacheResult) return cacheResult;

  const response = await fetch(
    `https://content.api.nebula.app/video_channels/search/?q=${encodeURIComponent(searchText)}`
  );

  if (response.status !== 200) {
    throw `Failed to search for channel - ${response.statusText}`;
  }

  const channel = await response.json().then((responseBody) => channelSchema.parse(responseBody));

  if (channel) setCache<Channel>(cacheKey, channel, 7 * 24 * 60 * 60);

  return channel;
};

const getEpisodes = async (channelId: string) => {
  const cacheKey = `episodes-${channelId}`;
  const cacheResult = getCache<Episode[]>(cacheKey);

  if (cacheResult) return cacheResult;

  const response = await fetch(
    `https://content.api.nebula.app/video_channels/${channelId}/video_episodes/?ordering=-published_at`
  );

  if (response.status !== 200) {
    throw `Failed to fetch episodes - ${response.statusText}`;
  }

  const episodes = await response.json().then((responseBody) => episodesSchema.parse(responseBody));

  setCache<Episode[]>(cacheKey, episodes, 15 * 60);

  return episodes;
};

const getVideoUrl = async (videoId: string) => {
  const authToken = await getAuthToken();

  return `https://content.api.nebula.app/video_episodes/${videoId}/manifest.m3u8?token=${authToken}`;
};

export { searchForChannel, getEpisodes, getVideoUrl };
