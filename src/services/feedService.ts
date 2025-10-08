import { Podcast } from 'podcast';
import nebulaService from './nebulaService';

const getFeedData = async (feedId: string) => await nebulaService.getChannel(feedId);

const generatePodcastFeed = async (host: string, feedId: string) => {
  const feedData = await getFeedData(feedId);

  if (!feedData) {
    return undefined;
  }

  const rssFeed = new Podcast({
    title: feedData.name,
    description: feedData.description,
    author: feedData.name,
    feedUrl: `http://${host}/${feedId}`,
    siteUrl: feedData.link,
    imageUrl: feedData.imageUrl,
  });

  feedData.videos.forEach((video) =>
    rssFeed.addItem({
      title: video.title,
      itunesTitle: video.title,
      description: `${video.description}\n\n${video.link}`,
      date: new Date(video.date),
      enclosure: {
        url: `http://${host}/videos/${video.id}`,
        type: 'video/mp4',
      },
      url: video.link,
      itunesDuration: video.duration,
    }),
  );

  return rssFeed.buildXml();
};

export default { getFeedData, generatePodcastFeed };
