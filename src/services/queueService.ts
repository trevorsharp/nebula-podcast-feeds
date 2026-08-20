import env from '../env';
import AsyncQueue from '../utils/AsyncQueue';
import videoService from './videoService';

const downloadQueue = new AsyncQueue(2);

const addVideoToDownloadQueue = async (
  videoId: string,
  options?: { addToFrontOfQueue?: boolean },
) => {
  if (!env.DOWNLOAD_VIDEOS || !videoService.isValidVideoId(videoId)) return;
  if (await videoService.isVideoDownloaded(videoId)) return;

  downloadQueue.push(
    {
      id: videoId,
      execute: () => videoService.downloadVideo(videoId),
    },
    options,
  );
};

export default { addVideoToDownloadQueue };
