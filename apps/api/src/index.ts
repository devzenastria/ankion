import { readApiEnv } from './config/env';
import { buildServer } from './server';

async function main() {
  const env = readApiEnv();
  const server = await buildServer({ logger: true });

  await server.listen({
    host: env.host,
    port: env.port,
  });

  server.log.info({ host: env.host, port: env.port }, 'ankion api listening');
}

main().catch(function handleStartupError() {
  console.error('ANKION_API_START_FAILED');
  process.exit(1);
});
