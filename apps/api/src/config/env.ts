const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3001;

export type ApiEnv = {
  host: string;
  port: number;
};

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
