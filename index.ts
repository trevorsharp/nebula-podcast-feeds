import {
  createContentManager,
  createContentServer,
  createDownloadManager,
  createFeedDataProvider,
  createFeedGenerator,
  createStreamingProvider,
  createWebServer,
} from 'podcast-feeds';

import * as downloadService from './src/download-service';
import * as nebulaService from './src/nebula-service';

const downloadsEnabled = process.env.DOWNLOAD_VIDEOS === 'true';

const contentManager = await createContentManager({
  configuration: {
    getContentFileName: (contentId: string) => `${contentId}.mp4`,
  },
});

if (downloadsEnabled) {
  createDownloadManager({
    configuration: { downloadLatestNumberOfItems: 2 },
    contentManager,
    downloadContent: downloadService.downloadVideo,
  });
}

const streamingProvider = downloadsEnabled
  ? undefined
  : createStreamingProvider({
      fetchStreamingUrl: nebulaService.getStreamingUrl,
    });

const feedDataProvider = createFeedDataProvider({
  configuration: {
    cacheFeedDataTimeToLive: 7 * 24 * 60 * 60,
    cacheFeedContentTimeToLive: 15 * 60,
  },
  fetchFeedData: (feedId, options) =>
    nebulaService.searchForChannel(feedId).then((channel) =>
      channel
        ? {
            feedId: channel.id,
            title: channel.title,
            description: channel.description,
            feedUrl: `${options.baseUrl}/${encodeURIComponent(channel.id)}`,
            sourceUrl: channel.share_url,
            imageUrl: channel.images.avatar.src,
          }
        : undefined,
    ),
  fetchFeedContent: (feedData, options) =>
    nebulaService.fetchVideosForChannel(feedData.feedId).then((videos) =>
      videos.map((video) => ({
        contentId: video.id,
        title: video.title,
        description: `${video.description}\n\n${video.share_url}`,
        date: new Date(video.published_at),
        duration: video.duration,
        contentUrl: `${options.baseUrl}/videos/${encodeURIComponent(video.id)}`,
        contentType: downloadsEnabled ? 'MP4' : 'HLS',
        sourceUrl: video.share_url,
      })),
    ),
});

const contentServer = createContentServer({
  configuration: {
    getContentServerUrl: ({ fileName }) => `/content/${fileName}`,
  },
  contentManager,
  streamingProvider,
});

const webServer = createWebServer({
  configuration: {
    feedApiRoute: '/:feedId',
    contentApiRoute: '/videos/:contentId',
  },
  feedGenerator: createFeedGenerator({ feedDataProvider }),
  contentServer,
});

Bun.serve({
  port: 3001,
  fetch: webServer.fetch,
});

console.log('Nebula Podcast Feeds is up and running');
