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
  requestEmailAuthEntry,
  type AuthEntryBoundaryResult,
} from "../lib/authEntryBoundary";
import {
  readAuthSessionBoundary,
  type AuthSessionReadBoundaryResult,
} from "../lib/authSessionReadBoundary";
import {
  getAuthBoundaryViewState,
  type AuthBoundaryViewState,
} from "../lib/authSessionViewState";

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
  isAuthEntryBoundaryEnabled: true;
  isRuntimeAuthReadBoundaryAvailable: true;
  isRuntimeAuthListenerEnabled: false;
  readSessionBoundary: () => Promise<AuthSessionReadBoundaryResult>;
  requestEmailAuthEntry: (email: string) => Promise<AuthEntryBoundaryResult>;
}>;

const AuthSessionContext = createContext<AuthSessionProviderValue | null>(null);

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
      isAuthEntryBoundaryEnabled: true,
      isRuntimeAuthReadBoundaryAvailable: true,
      isRuntimeAuthListenerEnabled: false,
      readSessionBoundary: readAuthSessionBoundary,
      requestEmailAuthEntry: (email) => requestEmailAuthEntry({ email }),
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
