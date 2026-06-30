import type {
  OwnAccountLifecycleState,
  OwnAuthSessionDto,
} from './ownAuthContract';
import type { OwnPasswordHash } from './ownPasswordHashing';
import type { OwnRefreshTokenHash } from './ownSessionTokens';

export type OwnAccountId = string;
export type OwnAnonymousIdentityId = string;
export type OwnPasswordCredentialId = string;
export type OwnRecoveryContactId = string;
export type OwnRefreshSessionId = string;

export type OwnAccountRecord = Readonly<{
  id: OwnAccountId;
  lifecycleState: OwnAccountLifecycleState;
  disabledReasonCode: string | null;
  deletionRequestedAt: string | null;
  disabledRetainedAt: string | null;
  anonymizedAt: string | null;
  purgedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}>;

export type OwnCreateAccountInput = Readonly<{
  lifecycleState?: Extract<OwnAccountLifecycleState, 'active'>;
}>;

export type OwnUpdateAccountLifecycleInput = Readonly<{
  accountId: OwnAccountId;
  lifecycleState: OwnAccountLifecycleState;
  disabledReasonCode?: string | null;
}>;

export type OwnPasswordCredentialStatus = 'active' | 'revoked';

export type OwnPasswordCredentialRecord = Readonly<{
  id: OwnPasswordCredentialId;
  accountId: OwnAccountId;
  usernameDisplay: string;
  usernameNormalized: string;
  passwordHash: OwnPasswordHash;
  credentialStatus: OwnPasswordCredentialStatus;
  passwordChangedAt: string;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
}>;

export type OwnCreatePasswordCredentialInput = Readonly<{
  accountId: OwnAccountId;
  usernameDisplay: string;
  usernameNormalized: string;
  passwordHash: OwnPasswordHash;
}>;

export type OwnAccountWithPasswordCredentialRecord = Readonly<{
  account: OwnAccountRecord;
  passwordCredential: OwnPasswordCredentialRecord;
}>;

export type OwnRefreshSessionStatus =
  | 'active'
  | 'rotated'
  | 'revoked'
  | 'expired';

export type OwnRefreshSessionRecord = Readonly<{
  id: OwnRefreshSessionId;
  accountId: OwnAccountId;
  refreshTokenHash: OwnRefreshTokenHash;
  sessionStatus: OwnRefreshSessionStatus;
  issuedAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  rotatedFromSessionId: OwnRefreshSessionId | null;
  revokedAt: string | null;
  revokedReasonCode: string | null;
  reuseSuspectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type OwnCreateRefreshSessionInput = Readonly<{
  accountId: OwnAccountId;
  refreshTokenHash: OwnRefreshTokenHash;
  expiresAt: string;
  rotatedFromSessionId?: OwnRefreshSessionId | null;
}>;

export type OwnRotateRefreshSessionInput = Readonly<{
  previousSessionId: OwnRefreshSessionId;
  nextRefreshTokenHash: OwnRefreshTokenHash;
  nextExpiresAt: string;
}>;

export type OwnRevokeRefreshSessionInput = Readonly<{
  sessionId: OwnRefreshSessionId;
  reasonCode: string;
}>;

export type OwnRecoveryContactKind = 'email';
export type OwnRecoveryContactStatus = 'unverified' | 'verified' | 'revoked';

export type OwnRecoveryContactRecord = Readonly<{
  id: OwnRecoveryContactId;
  accountId: OwnAccountId;
  contactKind: OwnRecoveryContactKind;
  contactValueHash: string;
  contactValueNormalized: string;
  contactStatus: OwnRecoveryContactStatus;
  verifiedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type OwnUpsertRecoveryContactInput = Readonly<{
  accountId: OwnAccountId;
  contactKind: OwnRecoveryContactKind;
  contactValueHash: string;
  contactValueNormalized: string;
}>;

export type OwnProfileReadinessRecord = Readonly<{
  accountId: OwnAccountId;
  anonymousIdentityId: OwnAnonymousIdentityId | null;
  profileReady: OwnAuthSessionDto['profileReady'];
  anonymousIdentityReady: OwnAuthSessionDto['anonymousIdentityReady'];
  onboardingComplete: OwnAuthSessionDto['onboardingComplete'];
}>;

export type OwnCreateIdentityProfileFoundationInput = Readonly<{
  accountId: OwnAccountId;
  publicHandle: string;
  displayLabel: string;
  visualSeed: string;
}>;

export type OwnCreateIdentityProfileFoundationResult = Readonly<{
  accountId: OwnAccountId;
  anonymousIdentityId: OwnAnonymousIdentityId;
  profileReady: false;
  anonymousIdentityReady: true;
  onboardingComplete: false;
}>;

export type OwnAuthRepositoryTransaction<TRepository> = Readonly<{
  withTransaction<TResult>(
    operation: (repository: TRepository) => Promise<TResult>,
  ): Promise<TResult>;
}>;

export type OwnAccountRepository = Readonly<{
  createAccount(input: OwnCreateAccountInput): Promise<OwnAccountRecord>;
  readAccountById(accountId: OwnAccountId): Promise<OwnAccountRecord | null>;
  readAccountByNormalizedUsername(
    usernameNormalized: string,
  ): Promise<OwnAccountWithPasswordCredentialRecord | null>;
  updateAccountLifecycleState(
    input: OwnUpdateAccountLifecycleInput,
  ): Promise<OwnAccountRecord>;
  markAccountDeletionRequested(accountId: OwnAccountId): Promise<OwnAccountRecord>;
}>;

export type OwnPasswordCredentialRepository = Readonly<{
  createPasswordCredential(
    input: OwnCreatePasswordCredentialInput,
  ): Promise<OwnPasswordCredentialRecord>;
  readPasswordCredentialByAccountId(
    accountId: OwnAccountId,
  ): Promise<OwnPasswordCredentialRecord | null>;
  rotatePasswordHash(
    credentialId: OwnPasswordCredentialId,
    nextPasswordHash: OwnPasswordHash,
  ): Promise<OwnPasswordCredentialRecord>;
  revokePasswordCredential(
    credentialId: OwnPasswordCredentialId,
  ): Promise<OwnPasswordCredentialRecord>;
}>;

export type OwnRefreshSessionRepository = Readonly<{
  createRefreshSession(
    input: OwnCreateRefreshSessionInput,
  ): Promise<OwnRefreshSessionRecord>;
  readRefreshSessionById(
    sessionId: OwnRefreshSessionId,
  ): Promise<OwnRefreshSessionRecord | null>;
  rotateRefreshSession(
    input: OwnRotateRefreshSessionInput,
  ): Promise<OwnRefreshSessionRecord>;
  revokeRefreshSession(
    input: OwnRevokeRefreshSessionInput,
  ): Promise<OwnRefreshSessionRecord>;
  revokeAllRefreshSessionsForAccount(
    accountId: OwnAccountId,
    reasonCode: string,
  ): Promise<number>;
  markRefreshTokenReuseSuspected(
    sessionId: OwnRefreshSessionId,
  ): Promise<OwnRefreshSessionRecord>;
}>;

export type OwnRecoveryContactRepository = Readonly<{
  upsertRecoveryContact(
    input: OwnUpsertRecoveryContactInput,
  ): Promise<OwnRecoveryContactRecord>;
  readRecoveryContactByAccountId(
    accountId: OwnAccountId,
  ): Promise<OwnRecoveryContactRecord | null>;
  markRecoveryContactVerified(
    recoveryContactId: OwnRecoveryContactId,
  ): Promise<OwnRecoveryContactRecord>;
  markRecoveryContactRevoked(
    recoveryContactId: OwnRecoveryContactId,
  ): Promise<OwnRecoveryContactRecord>;
}>;

export type OwnIdentityProfileReadinessRepository = Readonly<{
  createInitialIdentityProfileFoundation(
    input: OwnCreateIdentityProfileFoundationInput,
  ): Promise<OwnCreateIdentityProfileFoundationResult>;
  readProfileReadinessForSessionDto(
    accountId: OwnAccountId,
  ): Promise<OwnProfileReadinessRecord>;
}>;

export interface OwnAuthRepository
  extends OwnAccountRepository,
    OwnPasswordCredentialRepository,
    OwnRefreshSessionRepository,
    OwnRecoveryContactRepository,
    OwnIdentityProfileReadinessRepository,
    OwnAuthRepositoryTransaction<OwnAuthRepository> {}
