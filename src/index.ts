import { Hono } from 'hono';
import { getEpisodes, getVideoUrl, searchForChannel } from './services/nebulaService';
import { buildFeed } from './services/feedService';

const app = new Hono();

app.get('/', (c) => c.text('Nebula Podcast Feeds Is Up And Running'));

app.get('/:feedId', async (c) => {
  const feedId = c.req.param('feedId');
  const hostname = c.req.headers.get('host') ?? '';

  const channel = await searchForChannel(feedId);
  if (!channel) return c.text('Channel Not Found', 404);

  const episodes = await getEpisodes(channel.id);

  return c.text(buildFeed(hostname, channel, episodes));
});

app.get('/videos/:videoId', async (c) => {
  const videoUrl = await getVideoUrl(c.req.param('videoId'));

  return c.redirect(videoUrl, 302);
});

export default {
  fetch: app.fetch,
  port: 3000,
};
