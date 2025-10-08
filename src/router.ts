import { Hono } from 'hono';
import feedService from './services/feedService';
import videoService from './services/videoService';

const router = new Hono();
router.get('/', (context) => context.text('Nebula podcast feeds is up and running'));

router.get('/:feedId', async (context) => {
  const { host } = new URL(context.req.url);
  const { feedId } = context.req.param();

  const podcastFeed = await feedService.generatePodcastFeed(host, feedId);

  if (!podcastFeed) {
    return context.text('Server Error - Could not generate podcast feed', 500);
  }

  return context.text(podcastFeed, 200, { 'Content-Type': 'application/rss+xml' });
});

router.get('/videos/:videoId', async (context) => {
  const { videoId } = context.req.param();

  const videoUrl = await videoService.getVideoUrl(videoId);

  if (!videoUrl) {
    return context.text('Server Error - Could not get video url', 500);
  }

  return context.redirect(videoUrl, 302);
});

export default router;
