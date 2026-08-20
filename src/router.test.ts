import { afterEach, describe, expect, test } from 'bun:test';
import env from './env';
import router from './router';
import feedService from './services/feedService';
import queueService from './services/queueService';
import videoService from './services/videoService';

const originalDownloadVideos = env.DOWNLOAD_VIDEOS;
const originalGeneratePodcastFeed = feedService.generatePodcastFeed;
const originalGetVideoUrl = videoService.getVideoUrl;
const originalAddVideoToDownloadQueue = queueService.addVideoToDownloadQueue;

afterEach(() => {
  env.DOWNLOAD_VIDEOS = originalDownloadVideos;
  feedService.generatePodcastFeed = originalGeneratePodcastFeed;
  videoService.getVideoUrl = originalGetVideoUrl;
  queueService.addVideoToDownloadQueue = originalAddVideoToDownloadQueue;
});

test('uses forwarded HTTPS URLs when generating feeds', async () => {
  let receivedBaseUrl: string | undefined;
  feedService.generatePodcastFeed = async (baseUrl) => {
    receivedBaseUrl = baseUrl;
    return '<rss />';
  };

  const response = await router.request('/test-channel', {
    headers: {
      host: 'podcasts.example.com',
      'x-forwarded-proto': 'https',
    },
  });

  expect(response.status).toBe(200);
  expect(receivedBaseUrl).toBe('https://podcasts.example.com');
});

describe('video routes', () => {
  test('redirects both streaming enclosure routes to HLS when downloads are disabled', async () => {
    env.DOWNLOAD_VIDEOS = false;
    videoService.getVideoUrl = async () => 'https://content.example.com/manifest.m3u8?token=secret';

    for (const path of ['/videos/video-1', '/videos/video-1.m3u8']) {
      const response = await router.request(path);
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        'https://content.example.com/manifest.m3u8?token=secret',
      );
    }
  });

  test('returns the downloaded MP4 when available', async () => {
    env.DOWNLOAD_VIDEOS = true;
    videoService.getVideoUrl = async () => '/content/video-1.mp4';

    const response = await router.request('/videos/video-1');

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/content/video-1.mp4');
  });

  test('queues an unavailable MP4 without falling back to HLS', async () => {
    env.DOWNLOAD_VIDEOS = true;
    videoService.getVideoUrl = async () => undefined;
    const queuedVideoIds: string[] = [];
    queueService.addVideoToDownloadQueue = async (videoId) => {
      queuedVideoIds.push(videoId);
    };

    const response = await router.request('/videos/video-1');

    expect(response.status).toBe(503);
    expect(response.headers.get('retry-after')).toBe('60');
    expect(queuedVideoIds).toEqual(['video-1']);
  });

  test('rejects HLS enclosure requests in download mode', async () => {
    env.DOWNLOAD_VIDEOS = true;
    const queuedVideoIds: string[] = [];
    queueService.addVideoToDownloadQueue = async (videoId) => {
      queuedVideoIds.push(videoId);
    };

    const response = await router.request('/videos/video-1.m3u8');

    expect(response.status).toBe(404);
    expect(queuedVideoIds).toEqual([]);
  });
});
