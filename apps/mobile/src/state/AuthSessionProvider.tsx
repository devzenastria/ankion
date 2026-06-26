import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

import type {
  AnonymousIdentityReadiness,
  AuthSessionState,
  OwnerCreationReadiness,
  SessionBoundarySnapshot,
  SessionRecoveryState,
} from "../lib/authSessionBoundary";
import {
  completeAuthCallbackFromUrl,
  type AuthCallbackBoundaryRequest,
  type AuthCallbackBoundaryResult,
} from "../lib/authCallbackBoundary";
import {
  requestEmailAuthEntry,
  type AuthEntryBoundaryResult,
} from "../lib/authEntryBoundary";
import { getBackendApiPublicEnv } from "../lib/apiEnv";
import {
  getBackendProfileFoundation,
  type BackendProfileFoundationResult,
} from "../lib/backendApiBoundary";
import {
  requestOwnerProfileCreation,
  type OwnerProfileCreationBoundaryResult,
  type OwnerProfileCreationRequest,
} from "../lib/ownerProfileCreationBoundary";
import {
  readAuthSessionBoundary,
  type AuthSessionReadBoundaryResult,
} from "../lib/authSessionReadBoundary";
import {
  getAuthBoundaryViewState,
  type AuthBoundaryViewState,
} from "../lib/authSessionViewState";
import { getRuntimeSupabaseBoundary } from "../lib/supabaseBoundary";

const inertRecoveryState: SessionRecoveryState = {
  status: "none",
  reason: null,
  requiresServerRecheck: false,
};

const inertSessionState: AuthSessionState = {
  status: "unknown",
  user: null,
  error: null,
  recovery: inertRecoveryState,
  isServerConfirmed: false,
  isLocalOnly: false,
};

const inertAnonymousIdentity: AnonymousIdentityReadiness = {
  status: "unknown",
  serverConfirmedAnonymousIdentityId: null,
  isServerConfirmed: false,
  localCacheTrusted: false,
};

const inertOwnerCreation: OwnerCreationReadiness = {
  status: "not_authenticated",
  error: null,
  canRequest: false,
  isRequestEligibilityOnly: true,
};

export const inertSessionBoundarySnapshot: SessionBoundarySnapshot = {
  session: inertSessionState,
  anonymousIdentity: inertAnonymousIdentity,
  ownerCreation: inertOwnerCreation,
  recovery: inertRecoveryState,
  errors: [],
};

export type AuthSessionProviderValue = Readonly<{
  snapshot: SessionBoundarySnapshot;
  viewState: AuthBoundaryViewState;
  phaseGate: "auth_provider_skeleton";
  isRuntimeAuthEnabled: false;
  isAuthCallbackBoundaryEnabled: true;
  isAuthEntryBoundaryEnabled: true;
  isOwnerProfileCreationBoundaryEnabled: true;
  isRuntimeAuthReadBoundaryAvailable: true;
  isRuntimeAuthListenerEnabled: false;
  completeAuthCallbackFromUrl: (
    request: AuthCallbackBoundaryRequest,
  ) => Promise<AuthCallbackBoundaryResult>;
  readSessionBoundary: () => Promise<AuthSessionReadBoundaryResult>;
  requestEmailAuthEntry: (email: string) => Promise<AuthEntryBoundaryResult>;
  requestOwnerProfileCreation: (
    input: OwnerProfileCreationRequest,
  ) => Promise<OwnerProfileCreationBoundaryResult>;
  readBackendProfileFoundation: () => Promise<BackendProfileFoundationResult>;
}>;

const AuthSessionContext = createContext<AuthSessionProviderValue | null>(null);

async function readBackendProfileFoundationBoundary(): Promise<BackendProfileFoundationResult> {
  const apiEnv = getBackendApiPublicEnv();

  if (!apiEnv.isConfigured) {
    return getBackendProfileFoundation({
      apiBaseUrl: apiEnv.apiBaseUrl,
      accessToken: null,
    });
  }

  const boundary = getRuntimeSupabaseBoundary();

  if (!boundary.clientAvailable || boundary.client === null) {
    return getBackendProfileFoundation({
      apiBaseUrl: apiEnv.apiBaseUrl,
      accessToken: null,
    });
  }

  try {
    const { data, error } = await boundary.client.auth.getSession();
    const accessToken =
      error === null && data.session !== null
        ? data.session.access_token
        : null;

    return getBackendProfileFoundation({
      apiBaseUrl: apiEnv.apiBaseUrl,
      accessToken,
    });
  } catch {
    return getBackendProfileFoundation({
      apiBaseUrl: apiEnv.apiBaseUrl,
      accessToken: null,
    });
  }
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const value = useMemo<AuthSessionProviderValue>(() => {
    const snapshot = inertSessionBoundarySnapshot;

    return {
      snapshot,
      viewState: getAuthBoundaryViewState({
        session: snapshot.session,
        anonymousIdentity: snapshot.anonymousIdentity,
        ownerCreation: snapshot.ownerCreation,
        recovery: snapshot.recovery,
        authError: null,
      }),
      phaseGate: "auth_provider_skeleton",
      isRuntimeAuthEnabled: false,
      isAuthCallbackBoundaryEnabled: true,
      isAuthEntryBoundaryEnabled: true,
      isOwnerProfileCreationBoundaryEnabled: true,
      isRuntimeAuthReadBoundaryAvailable: true,
      isRuntimeAuthListenerEnabled: false,
      completeAuthCallbackFromUrl,
      readSessionBoundary: readAuthSessionBoundary,
      requestEmailAuthEntry: (email) => requestEmailAuthEntry({ email }),
      requestOwnerProfileCreation,
      readBackendProfileFoundation: readBackendProfileFoundationBoundary,
    };
  }, []);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSessionBoundary(): AuthSessionProviderValue {
  const value = useContext(AuthSessionContext);

  if (value === null) {
    throw new Error(
      "useAuthSessionBoundary must be used inside AuthSessionProvider.",
    );
  }

  return value;
}

export function useOptionalAuthSessionBoundary(): AuthSessionProviderValue | null {
  return useContext(AuthSessionContext);
}
