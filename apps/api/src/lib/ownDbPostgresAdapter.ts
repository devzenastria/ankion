import { Pool } from 'pg';
import type { PoolClient, PoolConfig } from 'pg';

import type { OwnDatabaseSslMode } from '../config/ownDbEnv';
import type {
  OwnDbAdapter,
  OwnDbError,
  OwnDbErrorCode,
  OwnDbHealthCheckResult,
  OwnDbQuery,
  OwnDbQueryResult,
  OwnDbTransaction,
} from './ownDbAdapter';

export type OwnDbPostgresAdapterConfig = Readonly<{
  databaseUrl: string;
  sslMode: OwnDatabaseSslMode;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  maxPoolSize?: number;
}>;

export class OwnDbPostgresError extends Error implements OwnDbError {
  readonly code: OwnDbErrorCode;
  readonly safeMessage: string;

  constructor(code: OwnDbErrorCode) {
    const safeMessage = getSafeDbErrorMessage(code);

    super(safeMessage);

    this.code = code;
    this.name = 'OwnDbPostgresError';
    this.safeMessage = safeMessage;
  }
}

function getSafeDbErrorMessage(code: OwnDbErrorCode): string {
  switch (code) {
    case 'connection_unavailable':
      return 'Database connection is unavailable.';
    case 'constraint_violation':
      return 'Database constraint validation failed.';
    case 'foreign_key_violation':
      return 'Database relationship validation failed.';
    case 'query_failed':
      return 'Database query failed.';
    case 'transaction_failed':
      return 'Database transaction failed.';
    case 'unique_violation':
      return 'Database uniqueness validation failed.';
    case 'unknown':
      return 'Database operation failed.';
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;

  return typeof code === 'string' ? code : undefined;
}

function isConnectionUnavailableCode(code: string | undefined): boolean {
  return (
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN'
  );
}

function mapDbErrorCode(
  error: unknown,
  fallbackCode: OwnDbErrorCode,
): OwnDbErrorCode {
  const code = getErrorCode(error);

  if (isConnectionUnavailableCode(code)) {
    return 'connection_unavailable';
  }

  if (code === '23505') {
    return 'unique_violation';
  }

  if (code === '23503') {
    return 'foreign_key_violation';
  }

  if (code === '23502' || code === '23514' || code?.startsWith('23')) {
    return 'constraint_violation';
  }

  return fallbackCode;
}

function createSafeDbError(
  error: unknown,
  fallbackCode: OwnDbErrorCode,
): OwnDbPostgresError {
  return new OwnDbPostgresError(mapDbErrorCode(error, fallbackCode));
}

function isOwnDbPostgresError(error: unknown): error is OwnDbPostgresError {
  return error instanceof OwnDbPostgresError;
}

function getPoolSslConfig(
  sslMode: OwnDatabaseSslMode,
): PoolConfig['ssl'] | undefined {
  if (sslMode === 'disable') {
    return false;
  }

  if (sslMode === 'require') {
    return {
      rejectUnauthorized: true,
    };
  }

  return undefined;
}

function createPool(config: OwnDbPostgresAdapterConfig): Pool {
  return new Pool({
    connectionString: config.databaseUrl,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    idleTimeoutMillis: config.idleTimeoutMillis,
    max: config.maxPoolSize,
    ssl: getPoolSslConfig(config.sslMode),
  });
}

async function runQuery<TRow extends Record<string, unknown>>(
  queryExecutor: Pick<Pool, 'query'> | Pick<PoolClient, 'query'>,
  query: OwnDbQuery,
  fallbackCode: OwnDbErrorCode,
): Promise<OwnDbQueryResult<TRow>> {
  try {
    const result = await queryExecutor.query(
      query.text,
      query.parameters === undefined ? [] : [...query.parameters],
    );

    return {
      rowCount: result.rowCount ?? result.rows.length,
      rows: result.rows as TRow[],
    };
  } catch (error) {
    throw createSafeDbError(error, fallbackCode);
  }
}

export function createOwnDbPostgresAdapter(
  config: OwnDbPostgresAdapterConfig,
): OwnDbAdapter {
  const pool = createPool(config);

  return {
    async healthCheck(): Promise<OwnDbHealthCheckResult> {
      const startedAt = Date.now();

      try {
        const result = await runQuery<{ ok: number }>(
          pool,
          {
            text: 'select 1 as ok',
          },
          'query_failed',
        );

        const healthy = result.rows[0]?.ok === 1;

        return {
          latencyMs: Date.now() - startedAt,
          safeMessage: healthy
            ? 'Own database is reachable.'
            : 'Own database health check failed.',
          status: healthy ? 'healthy' : 'unhealthy',
        };
      } catch (error) {
        const safeError = isOwnDbPostgresError(error)
          ? error
          : createSafeDbError(error, 'unknown');

        return {
          latencyMs: Date.now() - startedAt,
          safeMessage: safeError.safeMessage,
          status:
            safeError.code === 'connection_unavailable'
              ? 'unavailable'
              : 'unhealthy',
        };
      }
    },

    query<TRow extends Record<string, unknown>>(
      query: OwnDbQuery,
    ): Promise<OwnDbQueryResult<TRow>> {
      return runQuery(pool, query, 'query_failed');
    },

    transaction<TResult>(
      operation: (transaction: OwnDbTransaction) => Promise<TResult>,
    ): Promise<TResult> {
      return this.withTransaction(operation);
    },

    async withTransaction<TResult>(
      operation: (transaction: OwnDbTransaction) => Promise<TResult>,
    ): Promise<TResult> {
      let client: PoolClient;

      try {
        client = await pool.connect();
      } catch (error) {
        throw createSafeDbError(error, 'connection_unavailable');
      }

      let transactionStarted = false;

      try {
        await client.query('BEGIN');
        transactionStarted = true;

        const transaction: OwnDbTransaction = {
          query<TRow extends Record<string, unknown>>(
            query: OwnDbQuery,
          ): Promise<OwnDbQueryResult<TRow>> {
            return runQuery(client, query, 'query_failed');
          },
        };

        const result = await operation(transaction);

        await client.query('COMMIT');

        return result;
      } catch (error) {
        if (transactionStarted) {
          try {
            await client.query('ROLLBACK');
          } catch (rollbackError) {
            throw createSafeDbError(rollbackError, 'transaction_failed');
          }
        }

        if (isOwnDbPostgresError(error)) {
          throw error;
        }

        throw createSafeDbError(error, 'transaction_failed');
      } finally {
        client.release();
      }
    },
  };
}
