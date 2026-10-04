import { rename, rm } from 'node:fs/promises';

import { $ } from 'bun';
import type { ContentManager } from 'podcast-feeds';

import * as nebulaService from './nebula-service';

export const downloadVideo = async (contentId: string, contentManager: ContentManager) => {
  const sourceUrl = await nebulaService.getStreamingUrl(contentId);

  const filePath = contentManager.getContentFilePath(contentId);
  const temporaryFilePath = filePath.replace(/(\.[^.]+)$/, '.part$1');
  const ffmpegOptions = { raw: '-y -hide_banner -loglevel error -c copy -movflags +faststart' };

  console.log(`Starting video download (${contentId})`);

  try {
    await rm(temporaryFilePath, { force: true });

    await $`ffmpeg -i ${sourceUrl} ${ffmpegOptions} ${temporaryFilePath}`;

    await rename(temporaryFilePath, filePath);

    console.log(`Finished video download (${contentId})`);
  } catch (error) {
    const shellError = error as { info?: { stderr?: unknown } };

    console.error(`Failed to download video (${contentId}): ${shellError.info?.stderr ?? error}`);
  } finally {
    await rm(temporaryFilePath, { force: true });
  }
};
