import type { FastifyInstance } from 'fastify';

import { readOwnDbEnv } from '../config/ownDbEnv';
import { sendPublicError } from '../lib/httpErrors';
import type { OwnDbAdapter } from '../lib/ownDbAdapter';
import { readOwnAuthRouteGate } from '../lib/ownAuthRouteGate';
import { createOwnDbPostgresAdapter } from '../lib/ownDbPostgresAdapter';

type HealthResponse = {
  ok: true;
  service: 'ankion-api';
};

type ReadyResponse = {
  ok: true;
  service: 'ankion-api';
  ready: true;
};

type ReadyOwnDbAdapterCache = {
  key: string;
  adapter: OwnDbAdapter;
};

let readyOwnDbAdapterCache: ReadyOwnDbAdapterCache | null = null;

function getReadyOwnDbAdapterFromEnv(): OwnDbAdapter | null {
  const ownDbEnv = readOwnDbEnv();

  if (!ownDbEnv.configured) {
    return null;
  }

  const cacheKey = `${ownDbEnv.databaseUrl}\n${ownDbEnv.sslMode}`;

  if (readyOwnDbAdapterCache?.key === cacheKey) {
    return readyOwnDbAdapterCache.adapter;
  }

  const adapter = createOwnDbPostgresAdapter({
    connectionTimeoutMillis: 3_000,
    databaseUrl: ownDbEnv.databaseUrl,
    maxPoolSize: 2,
    sslMode: ownDbEnv.sslMode,
  });

  readyOwnDbAdapterCache = {
    adapter,
    key: cacheKey,
  };

  return adapter;
}

async function isOwnBackendReady(): Promise<boolean> {
  const ownAuthGate = readOwnAuthRouteGate();

  if (!ownAuthGate.enabled) {
    return true;
  }

  const ownDbAdapter = getReadyOwnDbAdapterFromEnv();

  if (ownDbAdapter === null) {
    return false;
  }

  const health = await ownDbAdapter.healthCheck();

  return health.status === 'healthy';
}

export async function registerHealthRoute(server: FastifyInstance) {
  server.get('/health', async function healthHandler() {
    const response: HealthResponse = {
      ok: true,
      service: 'ankion-api',
    };

    return response;
  });

  server.get('/ready', async function readyHandler(_, reply) {
    if (!(await isOwnBackendReady())) {
      return sendPublicError(reply, 503, 'BACKEND_CONFIGURATION_REQUIRED');
    }

    const response: ReadyResponse = {
      ok: true,
      service: 'ankion-api',
      ready: true,
    };

    return response;
  });
}
