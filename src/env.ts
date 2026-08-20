const NEBULA_AUTH_TOKEN = process.env.NEBULA_AUTH_TOKEN;
const DOWNLOAD_VIDEOS = process.env.DOWNLOAD_VIDEOS === 'true';
const CONTENT_FOLDER_PATH = './content';

export default {
  NEBULA_AUTH_TOKEN,
  DOWNLOAD_VIDEOS,
  CONTENT_FOLDER_PATH,
};
