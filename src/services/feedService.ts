import { Podcast } from 'podcast';
import { Channel } from '../types/channel';
import { Episode } from '../types/episode';

const buildFeed = (hostname: string, channel: Channel, episodes: Episode[]) => {
  const feed = new Podcast({
    title: channel.title,
    description: channel.description,
    imageUrl: channel.coverUrl,
    author: channel.title,
  });

  episodes.forEach((episode) =>
    feed.addItem({
      title: episode.title,
      description: `${episode.description}\n\n${episode.nebulaUrl}`,
      url: episode.nebulaUrl,
      date: episode.publishedOn,
      enclosure: {
        url: `http://${hostname}/videos/${episode.id}`,
        type: 'video/mp4',
      },
      itunesDuration: episode.duration,
    })
  );

  return feed.buildXml();
};

export { buildFeed };
