import router from './router';
import startupService from './services/startupService';

await startupService.startApplication();

Bun.serve({
  port: 3000,
  fetch: router.fetch,
});

console.log('Nebula podcast feeds is up and running');
