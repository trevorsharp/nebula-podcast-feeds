import { $ } from 'bun';
import { rename, rm } from 'node:fs/promises';
import env from '../env';
import nebulaService from './nebulaService';

const isValidVideoId = (videoId: string) => /^[a-zA-Z0-9_:-]+$/.test(videoId);
const getVideoFileName = (videoId: string) => `${videoId}.mp4`;
const getVideoFilePath = (videoId: string) =>
  `${env.CONTENT_FOLDER_PATH}/${getVideoFileName(videoId)}`;
const isVideoDownloaded = (videoId: string) => Bun.file(getVideoFilePath(videoId)).exists();

const getVideoUrl = async (videoId: string) => {
  if (env.DOWNLOAD_VIDEOS) {
    return (await isVideoDownloaded(videoId)) ? `/content/${getVideoFileName(videoId)}` : undefined;
  }

  return await getHlsVideoUrl(videoId);
};

const getHlsVideoUrl = async (videoId: string) => {
  const authToken = await nebulaService.getAuthToken();

  if (!authToken) {
    return undefined;
  }

  return `https://content.api.nebula.app/video_episodes/${videoId}/manifest.m3u8?token=${authToken}`;
};

const downloadVideo = async (videoId: string) => {
  if (!isValidVideoId(videoId)) return;

  const videoUrl = await getHlsVideoUrl(videoId);
  if (!videoUrl) return;

  const videoFilePath = getVideoFilePath(videoId);
  const stagedVideoFilePath = `${env.CONTENT_FOLDER_PATH}/${videoId}.part.mp4`;
  const ffmpegOptions = {
    raw: '-y -hide_banner -loglevel error -map 0:v:0 -map 0:a:0 -c copy -movflags +faststart',
  };

  console.log(`Starting video download (${videoId})`);

  try {
    await $`ffmpeg -i ${videoUrl} ${ffmpegOptions} ${stagedVideoFilePath}`;
    await rename(stagedVideoFilePath, videoFilePath);
    console.log(`Finished downloading video (${videoId})`);
  } catch (error) {
    const shellError = error as { info?: { stderr?: unknown } };
    console.error(`Failed to download video (${videoId}): ${shellError.info?.stderr ?? error}`);
  } finally {
    await rm(stagedVideoFilePath, { force: true });
  }
};

export default {
  downloadVideo,
  getVideoUrl,
  isValidVideoId,
  isVideoDownloaded,
};
