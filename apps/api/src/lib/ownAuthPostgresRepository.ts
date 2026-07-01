import {
  ownAccountLifecycleStates,
  type OwnAccountLifecycleState,
} from './ownAuthContract';
import type {
  OwnAccountRecord,
  OwnAccountWithPasswordCredentialRecord,
  OwnAnonymousIdentityId,
  OwnAuthRepository,
  OwnCreateAccountInput,
  OwnCreateIdentityProfileFoundationInput,
  OwnCreateIdentityProfileFoundationResult,
  OwnCreatePasswordCredentialInput,
  OwnCreateRefreshSessionInput,
  OwnPasswordCredentialId,
  OwnPasswordCredentialRecord,
  OwnPasswordCredentialStatus,
  OwnProfileReadinessRecord,
  OwnRecoveryContactId,
  OwnRecoveryContactKind,
  OwnRecoveryContactRecord,
  OwnRecoveryContactStatus,
  OwnRefreshSessionId,
  OwnRefreshSessionRecord,
  OwnRefreshSessionStatus,
  OwnRevokeRefreshSessionInput,
  OwnRotateRefreshSessionInput,
  OwnUpdateAccountLifecycleInput,
  OwnUpsertRecoveryContactInput,
} from './ownAuthRepository';
import type { OwnDbAdapter, OwnDbQueryExecutor } from './ownDbAdapter';

type TimestampValue = string | Date;

type AccountRow = Record<string, unknown> & {
  id: string;
  account_status: OwnAccountLifecycleState;
  disabled_reason_code: string | null;
  deletion_requested_at: TimestampValue | null;
  disabled_retained_at: TimestampValue | null;
  anonymized_at: TimestampValue | null;
  purged_at: TimestampValue | null;
  created_at: TimestampValue;
  updated_at: TimestampValue;
  deleted_at: TimestampValue | null;
};

type PasswordCredentialRow = Record<string, unknown> & {
  id: string;
  account_id: string;
  username_display: string;
  username_normalized: string;
  password_hash: string;
  credential_status: OwnPasswordCredentialStatus;
  password_changed_at: TimestampValue;
  created_at: TimestampValue;
  updated_at: TimestampValue;
  revoked_at: TimestampValue | null;
};

type AccountPasswordCredentialRow = Record<string, unknown> & {
  account_id: string;
  account_status: OwnAccountLifecycleState;
  account_disabled_reason_code: string | null;
  account_deletion_requested_at: TimestampValue | null;
  account_disabled_retained_at: TimestampValue | null;
  account_anonymized_at: TimestampValue | null;
  account_purged_at: TimestampValue | null;
  account_created_at: TimestampValue;
  account_updated_at: TimestampValue;
  account_deleted_at: TimestampValue | null;
  credential_id: string;
  credential_account_id: string;
  username_display: string;
  username_normalized: string;
  password_hash: string;
  credential_status: OwnPasswordCredentialStatus;
  password_changed_at: TimestampValue;
  credential_created_at: TimestampValue;
  credential_updated_at: TimestampValue;
  credential_revoked_at: TimestampValue | null;
};

type RefreshSessionRow = Record<string, unknown> & {
  id: string;
  account_id: string;
  refresh_token_hash: string;
  session_status: OwnRefreshSessionStatus;
  issued_at: TimestampValue;
  last_used_at: TimestampValue | null;
  expires_at: TimestampValue;
  rotated_from_session_id: string | null;
  revoked_at: TimestampValue | null;
  revoked_reason_code: string | null;
  reuse_suspected_at: TimestampValue | null;
  created_at: TimestampValue;
  updated_at: TimestampValue;
};

type RecoveryContactRow = Record<string, unknown> & {
  id: string;
  account_id: string;
  contact_kind: OwnRecoveryContactKind;
  contact_value_hash: string;
  contact_value_normalized: string;
  contact_status: OwnRecoveryContactStatus;
  verified_at: TimestampValue | null;
  revoked_at: TimestampValue | null;
  created_at: TimestampValue;
  updated_at: TimestampValue;
};

type IdentityProfileFoundationRow = Record<string, unknown> & {
  account_id: string;
  anonymous_identity_id: string;
};

type ProfileReadinessRow = Record<string, unknown> & {
  account_id: string;
  anonymous_identity_id: string | null;
  profile_ready: boolean;
  anonymous_identity_ready: boolean;
  onboarding_complete: boolean;
};

export type OwnAuthPostgresRepositoryErrorCode =
  | 'invalid_repository_row'
  | 'record_not_found';

export class OwnAuthPostgresRepositoryError extends Error {
  readonly code: OwnAuthPostgresRepositoryErrorCode;
  readonly safeMessage: string;

  constructor(code: OwnAuthPostgresRepositoryErrorCode) {
    const safeMessage =
      code === 'record_not_found'
        ? 'Requested auth record was not found.'
        : 'Auth repository returned an invalid record.';

    super(safeMessage);

    this.code = code;
    this.name = 'OwnAuthPostgresRepositoryError';
    this.safeMessage = safeMessage;
  }
}

const accountColumns = `
  id,
  account_status,
  disabled_reason_code,
  deletion_requested_at,
  disabled_retained_at,
  anonymized_at,
  purged_at,
  created_at,
  updated_at,
  deleted_at
`;

const passwordCredentialColumns = `
  id,
  account_id,
  username_display,
  username_normalized,
  password_hash,
  credential_status,
  password_changed_at,
  created_at,
  updated_at,
  revoked_at
`;

const refreshSessionColumns = `
  id,
  account_id,
  refresh_token_hash,
  session_status,
  issued_at,
  last_used_at,
  expires_at,
  rotated_from_session_id,
  revoked_at,
  revoked_reason_code,
  case
    when revoked_reason_code = 'token_reuse_suspected' then revoked_at
    else null
  end as reuse_suspected_at,
  created_at,
  updated_at
`;

const recoveryContactColumns = `
  id,
  account_id,
  contact_kind,
  contact_value_hash,
  contact_value_normalized,
  contact_status,
  verified_at,
  revoked_at,
  created_at,
  updated_at
`;

const passwordCredentialStatuses = ['active', 'revoked'] as const;
const refreshSessionStatuses = ['active', 'rotated', 'revoked', 'expired'] as const;
const recoveryContactKinds = ['email'] as const;
const recoveryContactStatuses = ['unverified', 'verified', 'revoked'] as const;

function isAllowedString<TAllowed extends readonly string[]>(
  value: unknown,
  allowed: TAllowed,
): value is TAllowed[number] {
  return typeof value === 'string' && allowed.includes(value);
}

function readString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new OwnAuthPostgresRepositoryError('invalid_repository_row');
  }

  return value;
}

function readNullableString(value: unknown): string | null {
  return value === null ? null : readString(value);
}

function readTimestamp(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return readString(value);
}

function readNullableTimestamp(value: unknown): string | null {
  return value === null ? null : readTimestamp(value);
}

function readBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new OwnAuthPostgresRepositoryError('invalid_repository_row');
  }

  return value;
}

function readAccountLifecycleState(value: unknown): OwnAccountLifecycleState {
  if (!isAllowedString(value, ownAccountLifecycleStates)) {
    throw new OwnAuthPostgresRepositoryError('invalid_repository_row');
  }

  return value;
}

function readPasswordCredentialStatus(
  value: unknown,
): OwnPasswordCredentialStatus {
  if (!isAllowedString(value, passwordCredentialStatuses)) {
    throw new OwnAuthPostgresRepositoryError('invalid_repository_row');
  }

  return value;
}

function readRefreshSessionStatus(value: unknown): OwnRefreshSessionStatus {
  if (!isAllowedString(value, refreshSessionStatuses)) {
    throw new OwnAuthPostgresRepositoryError('invalid_repository_row');
  }

  return value;
}

function readRecoveryContactKind(value: unknown): OwnRecoveryContactKind {
  if (!isAllowedString(value, recoveryContactKinds)) {
    throw new OwnAuthPostgresRepositoryError('invalid_repository_row');
  }

  return value;
}

function readRecoveryContactStatus(value: unknown): OwnRecoveryContactStatus {
  if (!isAllowedString(value, recoveryContactStatuses)) {
    throw new OwnAuthPostgresRepositoryError('invalid_repository_row');
  }

  return value;
}

function requireRow<TRow>(row: TRow | undefined): TRow {
  if (row === undefined) {
    throw new OwnAuthPostgresRepositoryError('record_not_found');
  }

  return row;
}

function mapAccountRow(row: AccountRow): OwnAccountRecord {
  return {
    anonymizedAt: readNullableTimestamp(row.anonymized_at),
    createdAt: readTimestamp(row.created_at),
    deletedAt: readNullableTimestamp(row.deleted_at),
    deletionRequestedAt: readNullableTimestamp(row.deletion_requested_at),
    disabledReasonCode: readNullableString(row.disabled_reason_code),
    disabledRetainedAt: readNullableTimestamp(row.disabled_retained_at),
    id: readString(row.id),
    lifecycleState: readAccountLifecycleState(row.account_status),
    purgedAt: readNullableTimestamp(row.purged_at),
    updatedAt: readTimestamp(row.updated_at),
  };
}

function mapPasswordCredentialRow(
  row: PasswordCredentialRow,
): OwnPasswordCredentialRecord {
  return {
    accountId: readString(row.account_id),
    createdAt: readTimestamp(row.created_at),
    credentialStatus: readPasswordCredentialStatus(row.credential_status),
    id: readString(row.id),
    passwordChangedAt: readTimestamp(row.password_changed_at),
    passwordHash: readString(row.password_hash),
    revokedAt: readNullableTimestamp(row.revoked_at),
    updatedAt: readTimestamp(row.updated_at),
    usernameDisplay: readString(row.username_display),
    usernameNormalized: readString(row.username_normalized),
  };
}

function mapAccountPasswordCredentialRow(
  row: AccountPasswordCredentialRow,
): OwnAccountWithPasswordCredentialRecord {
  return {
    account: mapAccountRow({
      account_status: row.account_status,
      anonymized_at: row.account_anonymized_at,
      created_at: row.account_created_at,
      deleted_at: row.account_deleted_at,
      deletion_requested_at: row.account_deletion_requested_at,
      disabled_reason_code: row.account_disabled_reason_code,
      disabled_retained_at: row.account_disabled_retained_at,
      id: row.account_id,
      purged_at: row.account_purged_at,
      updated_at: row.account_updated_at,
    }),
    passwordCredential: mapPasswordCredentialRow({
      account_id: row.credential_account_id,
      created_at: row.credential_created_at,
      credential_status: row.credential_status,
      id: row.credential_id,
      password_changed_at: row.password_changed_at,
      password_hash: row.password_hash,
      revoked_at: row.credential_revoked_at,
      updated_at: row.credential_updated_at,
      username_display: row.username_display,
      username_normalized: row.username_normalized,
    }),
  };
}

function mapRefreshSessionRow(row: RefreshSessionRow): OwnRefreshSessionRecord {
  return {
    accountId: readString(row.account_id),
    createdAt: readTimestamp(row.created_at),
    expiresAt: readTimestamp(row.expires_at),
    id: readString(row.id),
    issuedAt: readTimestamp(row.issued_at),
    lastUsedAt: readNullableTimestamp(row.last_used_at),
    refreshTokenHash: readString(row.refresh_token_hash),
    reuseSuspectedAt: readNullableTimestamp(row.reuse_suspected_at),
    revokedAt: readNullableTimestamp(row.revoked_at),
    revokedReasonCode: readNullableString(row.revoked_reason_code),
    rotatedFromSessionId: readNullableString(row.rotated_from_session_id),
    sessionStatus: readRefreshSessionStatus(row.session_status),
    updatedAt: readTimestamp(row.updated_at),
  };
}

function mapRecoveryContactRow(row: RecoveryContactRow): OwnRecoveryContactRecord {
  return {
    accountId: readString(row.account_id),
    contactKind: readRecoveryContactKind(row.contact_kind),
    contactStatus: readRecoveryContactStatus(row.contact_status),
    contactValueHash: readString(row.contact_value_hash),
    contactValueNormalized: readString(row.contact_value_normalized),
    createdAt: readTimestamp(row.created_at),
    id: readString(row.id),
    revokedAt: readNullableTimestamp(row.revoked_at),
    updatedAt: readTimestamp(row.updated_at),
    verifiedAt: readNullableTimestamp(row.verified_at),
  };
}

function mapIdentityProfileFoundationRow(
  row: IdentityProfileFoundationRow,
): OwnCreateIdentityProfileFoundationResult {
  return {
    accountId: readString(row.account_id),
    anonymousIdentityId: readString(
      row.anonymous_identity_id,
    ) as OwnAnonymousIdentityId,
    anonymousIdentityReady: true,
    onboardingComplete: false,
    profileReady: false,
  };
}

function mapProfileReadinessRow(
  row: ProfileReadinessRow,
): OwnProfileReadinessRecord {
  return {
    accountId: readString(row.account_id),
    anonymousIdentityId: readNullableString(row.anonymous_identity_id),
    anonymousIdentityReady: readBoolean(row.anonymous_identity_ready),
    onboardingComplete: readBoolean(row.onboarding_complete),
    profileReady: readBoolean(row.profile_ready),
  };
}

function createRepository(
  executor: OwnDbQueryExecutor,
  db: OwnDbAdapter,
): OwnAuthRepository {
  return {
    async createAccount(
      input: OwnCreateAccountInput,
    ): Promise<OwnAccountRecord> {
      const lifecycleState = input.lifecycleState ?? 'active';
      const result = await executor.query<AccountRow>({
        parameters: [lifecycleState],
        text: `
          insert into auth_accounts (account_status)
          values ($1)
          returning ${accountColumns}
        `,
      });

      return mapAccountRow(requireRow(result.rows[0]));
    },

    async readAccountById(accountId: string): Promise<OwnAccountRecord | null> {
      const result = await executor.query<AccountRow>({
        parameters: [accountId],
        text: `
          select ${accountColumns}
          from auth_accounts
          where id = $1
          limit 1
        `,
      });

      const row = result.rows[0];

      return row === undefined ? null : mapAccountRow(row);
    },

    async readAccountByNormalizedUsername(
      usernameNormalized: string,
    ): Promise<OwnAccountWithPasswordCredentialRecord | null> {
      const result = await executor.query<AccountPasswordCredentialRow>({
        parameters: [usernameNormalized],
        text: `
          select
            account.id as account_id,
            account.account_status,
            account.disabled_reason_code as account_disabled_reason_code,
            account.deletion_requested_at as account_deletion_requested_at,
            account.disabled_retained_at as account_disabled_retained_at,
            account.anonymized_at as account_anonymized_at,
            account.purged_at as account_purged_at,
            account.created_at as account_created_at,
            account.updated_at as account_updated_at,
            account.deleted_at as account_deleted_at,
            credential.id as credential_id,
            credential.account_id as credential_account_id,
            credential.username_display,
            credential.username_normalized,
            credential.password_hash,
            credential.credential_status,
            credential.password_changed_at,
            credential.created_at as credential_created_at,
            credential.updated_at as credential_updated_at,
            credential.revoked_at as credential_revoked_at
          from auth_password_credentials credential
          inner join auth_accounts account on account.id = credential.account_id
          where credential.username_normalized = $1
            and credential.credential_status = 'active'
          limit 1
        `,
      });

      const row = result.rows[0];

      return row === undefined ? null : mapAccountPasswordCredentialRow(row);
    },

    async updateAccountLifecycleState(
      input: OwnUpdateAccountLifecycleInput,
    ): Promise<OwnAccountRecord> {
      const result = await executor.query<AccountRow>({
        parameters: [
          input.accountId,
          input.lifecycleState,
          input.disabledReasonCode ?? null,
        ],
        text: `
          update auth_accounts
          set
            account_status = $2,
            disabled_reason_code = $3,
            deletion_requested_at = case
              when $2 = 'deletion_requested' then coalesce(deletion_requested_at, now())
              else deletion_requested_at
            end,
            disabled_retained_at = case
              when $2 = 'disabled_retained' then coalesce(disabled_retained_at, now())
              else disabled_retained_at
            end,
            anonymized_at = case
              when $2 = 'anonymized' then coalesce(anonymized_at, now())
              else anonymized_at
            end,
            purged_at = case
              when $2 = 'purged' then coalesce(purged_at, now())
              else purged_at
            end,
            deleted_at = case
              when $2 in ('disabled_retained', 'anonymized', 'purged') then coalesce(deleted_at, now())
              else deleted_at
            end,
            updated_at = now()
          where id = $1
          returning ${accountColumns}
        `,
      });

      return mapAccountRow(requireRow(result.rows[0]));
    },

    async markAccountDeletionRequested(
      accountId: string,
    ): Promise<OwnAccountRecord> {
      const result = await executor.query<AccountRow>({
        parameters: [accountId],
        text: `
          update auth_accounts
          set
            account_status = 'deletion_requested',
            deletion_requested_at = coalesce(deletion_requested_at, now()),
            updated_at = now()
          where id = $1
          returning ${accountColumns}
        `,
      });

      return mapAccountRow(requireRow(result.rows[0]));
    },

    async createPasswordCredential(
      input: OwnCreatePasswordCredentialInput,
    ): Promise<OwnPasswordCredentialRecord> {
      const result = await executor.query<PasswordCredentialRow>({
        parameters: [
          input.accountId,
          input.usernameDisplay,
          input.usernameNormalized,
          input.passwordHash,
        ],
        text: `
          insert into auth_password_credentials (
            account_id,
            username_display,
            username_normalized,
            password_hash
          )
          values ($1, $2, $3, $4)
          returning ${passwordCredentialColumns}
        `,
      });

      return mapPasswordCredentialRow(requireRow(result.rows[0]));
    },

    async readPasswordCredentialByAccountId(
      accountId: string,
    ): Promise<OwnPasswordCredentialRecord | null> {
      const result = await executor.query<PasswordCredentialRow>({
        parameters: [accountId],
        text: `
          select ${passwordCredentialColumns}
          from auth_password_credentials
          where account_id = $1
            and credential_status = 'active'
          order by created_at desc
          limit 1
        `,
      });

      const row = result.rows[0];

      return row === undefined ? null : mapPasswordCredentialRow(row);
    },

    async rotatePasswordHash(
      credentialId: OwnPasswordCredentialId,
      nextPasswordHash: string,
    ): Promise<OwnPasswordCredentialRecord> {
      const result = await executor.query<PasswordCredentialRow>({
        parameters: [credentialId, nextPasswordHash],
        text: `
          update auth_password_credentials
          set
            password_hash = $2,
            password_changed_at = now(),
            updated_at = now()
          where id = $1
          returning ${passwordCredentialColumns}
        `,
      });

      return mapPasswordCredentialRow(requireRow(result.rows[0]));
    },

    async revokePasswordCredential(
      credentialId: OwnPasswordCredentialId,
    ): Promise<OwnPasswordCredentialRecord> {
      const result = await executor.query<PasswordCredentialRow>({
        parameters: [credentialId],
        text: `
          update auth_password_credentials
          set
            credential_status = 'revoked',
            revoked_at = coalesce(revoked_at, now()),
            updated_at = now()
          where id = $1
          returning ${passwordCredentialColumns}
        `,
      });

      return mapPasswordCredentialRow(requireRow(result.rows[0]));
    },

    async createRefreshSession(
      input: OwnCreateRefreshSessionInput,
    ): Promise<OwnRefreshSessionRecord> {
      const result = await executor.query<RefreshSessionRow>({
        parameters: [
          input.accountId,
          input.refreshTokenHash,
          input.expiresAt,
          input.rotatedFromSessionId ?? null,
        ],
        text: `
          insert into auth_refresh_sessions (
            account_id,
            refresh_token_hash,
            expires_at,
            rotated_from_session_id
          )
          values ($1, $2, $3, $4)
          returning ${refreshSessionColumns}
        `,
      });

      return mapRefreshSessionRow(requireRow(result.rows[0]));
    },

    async readRefreshSessionById(
      sessionId: OwnRefreshSessionId,
    ): Promise<OwnRefreshSessionRecord | null> {
      const result = await executor.query<RefreshSessionRow>({
        parameters: [sessionId],
        text: `
          select ${refreshSessionColumns}
          from auth_refresh_sessions
          where id = $1
          limit 1
        `,
      });

      const row = result.rows[0];

      return row === undefined ? null : mapRefreshSessionRow(row);
    },

    async readRefreshSessionByTokenHash(
      refreshTokenHash: string,
    ): Promise<OwnRefreshSessionRecord | null> {
      const result = await executor.query<RefreshSessionRow>({
        parameters: [refreshTokenHash],
        text: `
          select ${refreshSessionColumns}
          from auth_refresh_sessions
          where refresh_token_hash = $1
          limit 1
        `,
      });

      const row = result.rows[0];

      return row === undefined ? null : mapRefreshSessionRow(row);
    },

    async rotateRefreshSession(
      input: OwnRotateRefreshSessionInput,
    ): Promise<OwnRefreshSessionRecord> {
      const result = await executor.query<RefreshSessionRow>({
        parameters: [
          input.previousSessionId,
          input.nextRefreshTokenHash,
          input.nextExpiresAt,
        ],
        text: `
          with previous_session as (
            update auth_refresh_sessions
            set
              session_status = 'rotated',
              last_used_at = now(),
              updated_at = now()
            where id = $1
            returning account_id
          )
          insert into auth_refresh_sessions (
            account_id,
            refresh_token_hash,
            expires_at,
            rotated_from_session_id
          )
          select account_id, $2, $3, $1
          from previous_session
          returning ${refreshSessionColumns}
        `,
      });

      return mapRefreshSessionRow(requireRow(result.rows[0]));
    },

    async revokeRefreshSession(
      input: OwnRevokeRefreshSessionInput,
    ): Promise<OwnRefreshSessionRecord> {
      const result = await executor.query<RefreshSessionRow>({
        parameters: [input.sessionId, input.reasonCode],
        text: `
          update auth_refresh_sessions
          set
            session_status = 'revoked',
            revoked_at = coalesce(revoked_at, now()),
            revoked_reason_code = $2,
            updated_at = now()
          where id = $1
          returning ${refreshSessionColumns}
        `,
      });

      return mapRefreshSessionRow(requireRow(result.rows[0]));
    },

    async revokeAllRefreshSessionsForAccount(
      accountId: string,
      reasonCode: string,
    ): Promise<number> {
      const result = await executor.query<Record<string, unknown>>({
        parameters: [accountId, reasonCode],
        text: `
          update auth_refresh_sessions
          set
            session_status = 'revoked',
            revoked_at = coalesce(revoked_at, now()),
            revoked_reason_code = $2,
            updated_at = now()
          where account_id = $1
            and session_status <> 'revoked'
        `,
      });

      return result.rowCount;
    },

    async markRefreshTokenReuseSuspected(
      sessionId: OwnRefreshSessionId,
    ): Promise<OwnRefreshSessionRecord> {
      const result = await executor.query<RefreshSessionRow>({
        parameters: [sessionId],
        text: `
          update auth_refresh_sessions
          set
            session_status = 'revoked',
            revoked_at = coalesce(revoked_at, now()),
            revoked_reason_code = 'token_reuse_suspected',
            updated_at = now()
          where id = $1
          returning ${refreshSessionColumns}
        `,
      });

      return mapRefreshSessionRow(requireRow(result.rows[0]));
    },

    async upsertRecoveryContact(
      input: OwnUpsertRecoveryContactInput,
    ): Promise<OwnRecoveryContactRecord> {
      const result = await executor.query<RecoveryContactRow>({
        parameters: [
          input.accountId,
          input.contactKind,
          input.contactValueHash,
          input.contactValueNormalized,
        ],
        text: `
          insert into recovery_contacts (
            account_id,
            contact_kind,
            contact_value_hash,
            contact_value_normalized
          )
          values ($1, $2, $3, $4)
          on conflict (account_id, contact_kind)
          where contact_status <> 'revoked'
          do update set
            contact_value_hash = excluded.contact_value_hash,
            contact_value_normalized = excluded.contact_value_normalized,
            contact_status = 'unverified',
            verified_at = null,
            revoked_at = null,
            updated_at = now()
          returning ${recoveryContactColumns}
        `,
      });

      return mapRecoveryContactRow(requireRow(result.rows[0]));
    },

    async readRecoveryContactByAccountId(
      accountId: string,
    ): Promise<OwnRecoveryContactRecord | null> {
      const result = await executor.query<RecoveryContactRow>({
        parameters: [accountId],
        text: `
          select ${recoveryContactColumns}
          from recovery_contacts
          where account_id = $1
            and contact_status <> 'revoked'
          order by created_at desc
          limit 1
        `,
      });

      const row = result.rows[0];

      return row === undefined ? null : mapRecoveryContactRow(row);
    },

    async markRecoveryContactVerified(
      recoveryContactId: OwnRecoveryContactId,
    ): Promise<OwnRecoveryContactRecord> {
      const result = await executor.query<RecoveryContactRow>({
        parameters: [recoveryContactId],
        text: `
          update recovery_contacts
          set
            contact_status = 'verified',
            verified_at = coalesce(verified_at, now()),
            revoked_at = null,
            updated_at = now()
          where id = $1
          returning ${recoveryContactColumns}
        `,
      });

      return mapRecoveryContactRow(requireRow(result.rows[0]));
    },

    async markRecoveryContactRevoked(
      recoveryContactId: OwnRecoveryContactId,
    ): Promise<OwnRecoveryContactRecord> {
      const result = await executor.query<RecoveryContactRow>({
        parameters: [recoveryContactId],
        text: `
          update recovery_contacts
          set
            contact_status = 'revoked',
            revoked_at = coalesce(revoked_at, now()),
            updated_at = now()
          where id = $1
          returning ${recoveryContactColumns}
        `,
      });

      return mapRecoveryContactRow(requireRow(result.rows[0]));
    },

    async createInitialIdentityProfileFoundation(
      input: OwnCreateIdentityProfileFoundationInput,
    ): Promise<OwnCreateIdentityProfileFoundationResult> {
      const result = await executor.query<IdentityProfileFoundationRow>({
        parameters: [
          input.accountId,
          input.publicHandle,
          input.displayLabel,
          input.visualSeed,
        ],
        text: `
          with identity as (
            insert into anonymous_identities (
              account_id,
              public_handle,
              display_label,
              visual_seed
            )
            values ($1, $2, $3, $4)
            returning id, account_id
          ),
          profile as (
            insert into profiles_private (account_id)
            select account_id
            from identity
            returning account_id
          )
          select
            identity.account_id,
            identity.id as anonymous_identity_id
          from identity
          inner join profile on profile.account_id = identity.account_id
        `,
      });

      return mapIdentityProfileFoundationRow(requireRow(result.rows[0]));
    },

    async readProfileReadinessForSessionDto(
      accountId: string,
    ): Promise<OwnProfileReadinessRecord> {
      const result = await executor.query<ProfileReadinessRow>({
        parameters: [accountId],
        text: `
          select
            account.id as account_id,
            identity.id as anonymous_identity_id,
            coalesce(profile.profile_status = 'active', false) as profile_ready,
            coalesce(identity.identity_status = 'active', false) as anonymous_identity_ready,
            coalesce(
              profile.profile_status = 'active'
              and identity.identity_status = 'active',
              false
            ) as onboarding_complete
          from auth_accounts account
          left join lateral (
            select id, identity_status
            from anonymous_identities
            where account_id = account.id
              and deleted_at is null
              and identity_status in ('active', 'inactive', 'suspended')
            order by created_at asc
            limit 1
          ) identity on true
          left join lateral (
            select profile_status
            from profiles_private
            where account_id = account.id
              and deleted_at is null
              and profile_status <> 'deleted'
            order by created_at asc
            limit 1
          ) profile on true
          where account.id = $1
          limit 1
        `,
      });

      return mapProfileReadinessRow(requireRow(result.rows[0]));
    },

    withTransaction<TResult>(
      operation: (repository: OwnAuthRepository) => Promise<TResult>,
    ): Promise<TResult> {
      return db.withTransaction((transaction) =>
        operation(createRepository(transaction, db)),
      );
    },
  };
}

export function createOwnAuthPostgresRepository(
  db: OwnDbAdapter,
): OwnAuthRepository {
  return createRepository(db, db);
}
