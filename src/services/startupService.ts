import env from '../env';

const startApplication = async () => {
  if (!env.NEBULA_AUTH_TOKEN) {
    throw new Error('NEBULA_AUTH_TOKEN environment variable is not set');
  }
};

export default { startApplication };
