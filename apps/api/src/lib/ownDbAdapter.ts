export type OwnDbQueryValue =
  | string
  | number
  | boolean
  | Date
  | Buffer
  | null;

export type OwnDbQueryParameters = readonly OwnDbQueryValue[];

export type OwnDbQuery = Readonly<{
  text: string;
  parameters?: OwnDbQueryParameters;
}>;

export type OwnDbQueryResult<TRow extends Record<string, unknown>> = Readonly<{
  rows: readonly TRow[];
  rowCount: number;
}>;

export type OwnDbHealthStatus = 'healthy' | 'unhealthy' | 'unavailable';

export type OwnDbHealthCheckResult = Readonly<{
  status: OwnDbHealthStatus;
  latencyMs?: number;
  safeMessage: string;
}>;

export type OwnDbErrorCode =
  | 'connection_unavailable'
  | 'query_failed'
  | 'constraint_violation'
  | 'unique_violation'
  | 'foreign_key_violation'
  | 'transaction_failed'
  | 'unknown';

export type OwnDbError = Readonly<{
  code: OwnDbErrorCode;
  safeMessage: string;
}>;

export type OwnDbQueryExecutor = Readonly<{
  query<TRow extends Record<string, unknown>>(
    query: OwnDbQuery,
  ): Promise<OwnDbQueryResult<TRow>>;
}>;

export type OwnDbTransaction = OwnDbQueryExecutor;

export type OwnDbConnection = OwnDbQueryExecutor &
  Readonly<{
    transaction<TResult>(
      operation: (transaction: OwnDbTransaction) => Promise<TResult>,
    ): Promise<TResult>;
  }>;

export type OwnDbAdapter = OwnDbConnection &
  Readonly<{
    healthCheck(): Promise<OwnDbHealthCheckResult>;
    withTransaction<TResult>(
      operation: (transaction: OwnDbTransaction) => Promise<TResult>,
    ): Promise<TResult>;
  }>;
