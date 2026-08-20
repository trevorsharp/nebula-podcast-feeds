import { Podcast } from 'podcast';
import env from '../env';
import nebulaService from './nebulaService';
import queueService from './queueService';

const getFeedData = async (feedId: string) => await nebulaService.getChannel(feedId);

const generatePodcastFeed = async (baseUrl: string, feedId: string) => {
  const feedData = await getFeedData(feedId);

  if (!feedData) {
    return undefined;
  }

  if (env.DOWNLOAD_VIDEOS) {
    const [firstVideo] = feedData.videos;
    if (firstVideo) await queueService.addVideoToDownloadQueue(firstVideo.id);
  }

  const rssFeed = new Podcast({
    title: feedData.name,
    description: feedData.description,
    author: feedData.name,
    feedUrl: `${baseUrl}/${feedId}`,
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
        url: `${baseUrl}/videos/${video.id}`,
        type: 'video/mp4',
      },
      customElements: env.DOWNLOAD_VIDEOS
        ? []
        : [
            {
              'podcast:alternateEnclosure': [
                { _attr: { type: 'application/x-mpegURL', length: 0 } },
                { 'podcast:source': { _attr: { uri: `${baseUrl}/videos/${video.id}.m3u8` } } },
              ],
            },
          ],
      url: video.link,
      itunesDuration: video.duration,
    }),
  );

  return rssFeed.buildXml();
};

export default { getFeedData, generatePodcastFeed };
