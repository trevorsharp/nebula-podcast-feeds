import nebulaService from './nebulaService';

const getVideoUrl = async (videoId: string) => {
  const authToken = await nebulaService.getAuthToken();

  if (!authToken) {
    return undefined;
  }

  return `https://content.api.nebula.app/video_episodes/${videoId}/manifest.m3u8?token=${authToken}`;
};

export default { getVideoUrl };
