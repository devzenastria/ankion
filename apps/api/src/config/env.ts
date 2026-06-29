const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3001;
const PRODUCTION_ENV = 'production';
const productionSupabaseUrlMessage =
  'SUPABASE_URL must point to a hosted HTTPS Supabase project in production.';

export type ApiEnv = {
  host: string;
  port: number;
};

export type SupabaseServerEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

export class BackendConfigurationError extends Error {
  constructor() {
    super('BACKEND_CONFIGURATION_REQUIRED');
    this.name = 'BackendConfigurationError';
  }
}

function isProductionRuntime(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === PRODUCTION_ENV;
}

function isLocalSupabaseHost(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  return (
    normalizedHostname === 'localhost' ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === '0.0.0.0' ||
    normalizedHostname === 'host.docker.internal'
  );
}

export function assertProductionSupabaseUrl(
  rawSupabaseUrl: string,
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!isProductionRuntime(env)) {
    return;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawSupabaseUrl);
  } catch {
    throw new Error(productionSupabaseUrlMessage);
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new Error(productionSupabaseUrlMessage);
  }

  if (isLocalSupabaseHost(parsedUrl.hostname)) {
    throw new Error(productionSupabaseUrlMessage);
  }

  if (parsedUrl.port === '54321') {
    throw new Error(productionSupabaseUrlMessage);
  }
}

function parsePort(rawPort: string | undefined): number {
  if (rawPort === undefined) {
    return DEFAULT_PORT;
  }

  if (rawPort.trim() === '') {
    return DEFAULT_PORT;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort)) {
    throw new Error('API_PORT_INVALID');
  }

  if (parsedPort < 1) {
    throw new Error('API_PORT_INVALID');
  }

  if (parsedPort > 65535) {
    throw new Error('API_PORT_INVALID');
  }

  return parsedPort;
}

export function readApiEnv(env: NodeJS.ProcessEnv = process.env): ApiEnv {
  const rawHost = env.HOST?.trim();
  let host = DEFAULT_HOST;

  if (rawHost !== undefined) {
    if (rawHost.length > 0) {
      host = rawHost;
    }
  }

  return {
    host,
    port: parsePort(env.PORT),
  };
}

export function readSupabaseServerEnv(
  env: NodeJS.ProcessEnv = process.env,
): SupabaseServerEnv {
  const supabaseUrl = env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (
    supabaseUrl === undefined ||
    supabaseUrl.length === 0 ||
    supabaseServiceRoleKey === undefined ||
    supabaseServiceRoleKey.length === 0
  ) {
    throw new BackendConfigurationError();
  }

  assertProductionSupabaseUrl(supabaseUrl, env);

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
  };
}

export function isSupabaseServerEnvReady(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const supabaseUrl = env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (
    supabaseUrl === undefined ||
    supabaseUrl.length === 0 ||
    supabaseServiceRoleKey === undefined ||
    supabaseServiceRoleKey.length === 0
  ) {
    return false;
  }

  try {
    assertProductionSupabaseUrl(supabaseUrl, env);
  } catch {
    return false;
  }

  return true;
}
