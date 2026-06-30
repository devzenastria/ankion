export const ownDatabaseSslModes = ['disable', 'prefer', 'require'] as const;

export type OwnDatabaseSslMode = (typeof ownDatabaseSslModes)[number];

export type OwnDbEnvKey = 'OWN_DATABASE_URL' | 'OWN_DATABASE_SSL_MODE';

export type OwnDbEnvReadResult =
  | Readonly<{
      configured: true;
      databaseUrl: string;
      sslMode: OwnDatabaseSslMode;
    }>
  | Readonly<{
      configured: false;
      missingKeys: readonly OwnDbEnvKey[];
      invalidKeys: readonly OwnDbEnvKey[];
    }>;

const ownDatabaseUrlKey = 'OWN_DATABASE_URL';
const ownDatabaseSslModeKey = 'OWN_DATABASE_SSL_MODE';
const defaultOwnDatabaseSslMode: OwnDatabaseSslMode = 'prefer';

function readTrimmedEnvValue(
  env: NodeJS.ProcessEnv,
  key: OwnDbEnvKey,
): string | null {
  const value = env[key]?.trim();

  return value === undefined || value.length === 0 ? null : value;
}

function parseOwnDatabaseSslMode(
  rawSslMode: string | null,
): OwnDatabaseSslMode | null {
  if (rawSslMode === null) {
    return defaultOwnDatabaseSslMode;
  }

  const normalizedSslMode = rawSslMode.toLowerCase();

  return ownDatabaseSslModes.includes(
    normalizedSslMode as OwnDatabaseSslMode,
  )
    ? (normalizedSslMode as OwnDatabaseSslMode)
    : null;
}

export function readOwnDbEnv(
  env: NodeJS.ProcessEnv = process.env,
): OwnDbEnvReadResult {
  const databaseUrl = readTrimmedEnvValue(env, ownDatabaseUrlKey);
  const rawSslMode = readTrimmedEnvValue(env, ownDatabaseSslModeKey);
  const sslMode = parseOwnDatabaseSslMode(rawSslMode);

  const missingKeys: OwnDbEnvKey[] = [];
  const invalidKeys: OwnDbEnvKey[] = [];

  if (databaseUrl === null) {
    missingKeys.push(ownDatabaseUrlKey);
  }

  if (sslMode === null) {
    invalidKeys.push(ownDatabaseSslModeKey);
  }

  if (
    databaseUrl === null ||
    sslMode === null ||
    missingKeys.length > 0 ||
    invalidKeys.length > 0
  ) {
    return {
      configured: false,
      invalidKeys,
      missingKeys,
    };
  }

  return {
    configured: true,
    databaseUrl,
    sslMode,
  };
}
