import { afterEach, describe, expect, test } from 'bun:test';
import env from '../env';
import feedService from './feedService';
import nebulaService from './nebulaService';
import queueService from './queueService';

const originalDownloadVideos = env.DOWNLOAD_VIDEOS;
const originalGetChannel = nebulaService.getChannel;
const originalAddVideoToDownloadQueue = queueService.addVideoToDownloadQueue;

const feedData = {
  id: 'channel-1',
  name: 'Test Channel',
  description: 'Channel description',
  imageUrl: 'https://example.com/image.jpg',
  link: 'https://nebula.tv/test-channel',
  videos: [
    {
      id: 'video-1',
      title: 'Test Video',
      description: 'Video description',
      duration: 600,
      date: '2026-08-20T12:00:00.000Z',
      link: 'https://nebula.tv/videos/test-video',
    },
  ],
};

afterEach(() => {
  env.DOWNLOAD_VIDEOS = originalDownloadVideos;
  nebulaService.getChannel = originalGetChannel;
  queueService.addVideoToDownloadQueue = originalAddVideoToDownloadQueue;
});

describe('generatePodcastFeed', () => {
  test('advertises HLS as an alternate enclosure in streaming mode', async () => {
    env.DOWNLOAD_VIDEOS = false;
    nebulaService.getChannel = async () => feedData;

    const feed = await feedService.generatePodcastFeed(
      'https://podcasts.example.com',
      'test-channel',
    );

    expect(feed).toContain('url="https://podcasts.example.com/videos/video-1"');
    expect(feed).toContain('type="video/mp4"');
    expect(feed).toContain('<podcast:alternateEnclosure type="application/x-mpegURL" length="0">');
    expect(feed).toContain('uri="https://podcasts.example.com/videos/video-1.m3u8"');
  });

  test('requires the downloaded MP4 and queues the newest video in download mode', async () => {
    env.DOWNLOAD_VIDEOS = true;
    nebulaService.getChannel = async () => feedData;
    const queuedVideoIds: string[] = [];
    queueService.addVideoToDownloadQueue = async (videoId) => {
      queuedVideoIds.push(videoId);
    };

    const feed = await feedService.generatePodcastFeed(
      'https://podcasts.example.com',
      'test-channel',
    );

    expect(feed).not.toContain('podcast:alternateEnclosure');
    expect(queuedVideoIds).toEqual(['video-1']);
  });
});
