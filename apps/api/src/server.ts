import fastify from 'fastify';

import { registerHealthRoute } from './routes/health';

export type BuildServerOptions = {
  logger?: boolean;
};

export async function buildServer(options: BuildServerOptions = {}) {
  const server = fastify({
    logger: options.logger ?? true,
  });

  await registerHealthRoute(server);

  return server;
}
