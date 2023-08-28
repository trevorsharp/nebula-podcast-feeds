import dotenv from 'dotenv';
import Fastify from 'fastify';
import { getEpisodes, getVideoUrl, searchForChannel } from './services/nebulaService';
import { buildFeed } from './services/feedService';

dotenv.config();

const fastify = Fastify();

fastify.get('/', async (_, reply) => {
  reply.code(200);
  return 'Nebula Podcast Feeds Is Up And Running';
});

fastify.get<{ Params: { feedId: string } }>('/:feedId', async (request, reply) => {
  const channel = await searchForChannel(request.params.feedId);
  if (!channel) {
    reply.code(404);
    return 'Channel Not Found';
  }

  const episodes = await getEpisodes(channel.id);

  reply.code(200);
  return buildFeed(request.hostname, channel, episodes);
});

fastify.get<{ Params: { videoId: string } }>('/videos/:videoId', async (request, reply) => {
  const videoUrl = await getVideoUrl(request.params.videoId);

  reply.redirect(302, videoUrl);
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
