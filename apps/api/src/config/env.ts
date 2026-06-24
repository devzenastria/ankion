const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3001;

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

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
  };
}
