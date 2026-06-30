export const ownAuthSurfaces = [
  'username_signup',
  'username_login',
  'token_refresh',
  'logout',
  'session_read',
  'recovery_request',
  'recovery_reset',
  'account_delete_request',
] as const;

export type OwnAuthSurface = (typeof ownAuthSurfaces)[number];

export const ownAuthResultStatuses = [
  'success',
  'validation_failed',
  'auth_failed',
  'rate_limited',
  'session_invalid',
  'session_expired',
  'account_disabled',
  'recovery_unavailable',
  'unavailable',
] as const;

export type OwnAuthResultStatus = (typeof ownAuthResultStatuses)[number];

export const ownAccountLifecycleStates = [
  'active',
  'disabled',
  'deletion_requested',
  'disabled_retained',
  'anonymized',
  'purged',
] as const;

export type OwnAccountLifecycleState =
  (typeof ownAccountLifecycleStates)[number];

export type OwnBackendAuthorityMetadata = Readonly<{
  isBackendAuthority: true;
  isSupabaseRuntime: false;
  productAuthority: 'ankion_api';
}>;

export const ownBackendAuthority: OwnBackendAuthorityMetadata = {
  isBackendAuthority: true,
  isSupabaseRuntime: false,
  productAuthority: 'ankion_api',
};

export type OwnAuthSessionDto = Readonly<{
  accountId: string;
  anonymousIdentityId: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: 'Bearer';
  sessionId: string;
  profileReady: boolean;
  anonymousIdentityReady: boolean;
  onboardingComplete: boolean;
}>;

export type OwnAuthSuccessResult = Readonly<{
  ok: true;
  surface: OwnAuthSurface;
  status: 'success';
  authority: OwnBackendAuthorityMetadata;
  session: OwnAuthSessionDto;
}>;

export type OwnAuthFailureResult = Readonly<{
  ok: false;
  surface: OwnAuthSurface;
  status: Exclude<OwnAuthResultStatus, 'success'>;
  authority: OwnBackendAuthorityMetadata;
  code: string;
  safeMessage: string;
}>;

export type OwnAuthResult = OwnAuthSuccessResult | OwnAuthFailureResult;
