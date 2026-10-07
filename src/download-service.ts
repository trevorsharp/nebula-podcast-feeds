import { rename } from 'node:fs/promises';

import { $ } from 'bun';
import type { ContentManager } from 'podcast-feeds';

import * as nebulaService from './nebula-service';

export const downloadVideo = async (contentId: string, contentManager: ContentManager) => {
  const filePath = contentManager.getContentFilePath(contentId);
  if (!filePath) return;

  const sourceUrl = await nebulaService.getStreamingUrl(contentId);
  if (!sourceUrl) return;

  const temporaryFilePath = filePath.replace(/(\.[^.]+)$/, '.temp$1');

  console.log(`Starting video download (${contentId})`);

  const removeTemporaryFiles = () => $`rm -f ${temporaryFilePath}*`.nothrow().quiet();
  await removeTemporaryFiles();

  await $`ffmpeg \
      -i ${sourceUrl} \
      -y \
      -hide_banner \
      -loglevel error \
      -c copy \
      -movflags +faststart \
      ${temporaryFilePath}
    `
    .then(() => rename(temporaryFilePath, filePath))
    .then(() => console.log(`Finished video download (${contentId})`))
    .catch((error) => console.error(`Failed to download video (${contentId}) - ${error.info?.stderr ?? error}`))
    .finally(removeTemporaryFiles);
};
