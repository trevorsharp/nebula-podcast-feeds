import { Hono } from 'hono';
import env from './env';
import feedService from './services/feedService';
import queueService from './services/queueService';
import videoService from './services/videoService';

const router = new Hono();
router.get('/', (context) => context.text('Nebula podcast feeds is up and running'));

router.get('/:feedId', async (context) => {
  const { feedId } = context.req.param();
  const host = context.req.header('host') ?? '';
  const isHttps = context.req.header('x-forwarded-proto') === 'https';
  const baseUrl = `${isHttps ? 'https' : 'http'}://${host}`;

  const podcastFeed = await feedService.generatePodcastFeed(baseUrl, feedId);

  if (!podcastFeed) {
    return context.text('Server Error - Could not generate podcast feed', 500);
  }

  return context.text(podcastFeed, 200, { 'Content-Type': 'application/rss+xml' });
});

router.get('/videos/:videoId', async (context) => {
  const videoIdParam = context.req.param('videoId');
  const isHls = /\.m3u8$/i.test(videoIdParam);
  const videoId = videoIdParam.replace(/\.m3u8$/i, '');

  if (!videoService.isValidVideoId(videoId)) {
    return context.text('Invalid video id', 400);
  }

  if (env.DOWNLOAD_VIDEOS && isHls) {
    return context.text('HLS is not available when video downloads are enabled', 404);
  }

  const videoUrl = await videoService.getVideoUrl(videoId);

  if (!videoUrl) {
    if (env.DOWNLOAD_VIDEOS) {
      await queueService.addVideoToDownloadQueue(videoId, { addToFrontOfQueue: true });
      return context.text('Video is not available yet', 503, { 'Retry-After': '60' });
    }

    return context.text('Server Error - Could not get video url', 500);
  }

  return context.redirect(videoUrl, 302);
});

export default router;
