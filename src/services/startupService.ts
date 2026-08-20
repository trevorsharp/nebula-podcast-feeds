import { readdir, rm } from 'node:fs/promises';
import env from '../env';

const startApplication = async () => {
  if (!env.NEBULA_AUTH_TOKEN) {
    throw new Error('NEBULA_AUTH_TOKEN environment variable is not set');
  }

  if (!env.DOWNLOAD_VIDEOS) return;

  let contentFiles: string[];
  try {
    contentFiles = await readdir(env.CONTENT_FOLDER_PATH);
  } catch {
    throw new Error(
      'Content folder does not exist. Please mount a volume at the path "/app/content".',
    );
  }

  await Promise.all(
    contentFiles
      .filter((fileName) => fileName.endsWith('.part.mp4'))
      .map((fileName) => rm(`${env.CONTENT_FOLDER_PATH}/${fileName}`, { force: true })),
  );
};

export default { startApplication };
