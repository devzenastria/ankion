import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  type BackendProfileFoundationStatus,
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

export type BackendProfileFoundationReadStatus =
  | "idle"
  | "loading"
  | BackendProfileFoundationStatus;

export type BackendProfileFoundationReadState = Readonly<{
  status: BackendProfileFoundationReadStatus;
  profileReady: boolean;
  anonymousIdentityReady: boolean;
  onboardingComplete: boolean;
  message: string;
  canRetry: boolean;
  isBackendAuthority: false;
  isProductUnlockEnabled: false;
}>;

const idleBackendProfileFoundationState: BackendProfileFoundationReadState = {
  status: "idle",
  profileReady: false,
  anonymousIdentityReady: false,
  onboardingComplete: false,
  message: "Profil durumu henuz kontrol edilmedi.",
  canRetry: false,
  isBackendAuthority: false,
  isProductUnlockEnabled: false,
};

const loadingBackendProfileFoundationState: BackendProfileFoundationReadState = {
  status: "loading",
  profileReady: false,
  anonymousIdentityReady: false,
  onboardingComplete: false,
  message: "Profil kurulumu kontrol ediliyor.",
  canRetry: false,
  isBackendAuthority: false,
  isProductUnlockEnabled: false,
};

export type AuthSessionProviderValue = Readonly<{
  snapshot: SessionBoundarySnapshot;
  viewState: AuthBoundaryViewState;
  backendProfileFoundation: BackendProfileFoundationReadState;
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
  refreshBackendProfileFoundation: () => Promise<BackendProfileFoundationReadState>;
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

function canReadBackendProfileFoundation(
  nextSnapshot: SessionBoundarySnapshot,
): boolean {
  return (
    nextSnapshot.session.status === "authenticated" &&
    nextSnapshot.session.isServerConfirmed &&
    !nextSnapshot.session.isLocalOnly &&
    nextSnapshot.session.user !== null
  );
}

function getBackendProfileFoundationMessage(
  status: BackendProfileFoundationStatus,
): string {
  switch (status) {
    case "configured_false":
      return "Backend API adresi yapilandirilmadi.";
    case "session_missing":
      return "Oturum yok. Once giris yap.";
    case "success":
      return "Profil kurulumu guncel.";
    case "auth_required":
    case "auth_invalid":
      return "Oturum backend tarafindan dogrulanamadi.";
    case "backend_configuration_required":
      return "Backend yapilandirmasi tamamlanmadi.";
    case "read_failed":
      return "Profil durumu guvenli sekilde okunamadi.";
    case "network_failed":
      return "Backend baglantisi kurulamadi. Tekrar deneyebilirsin.";
    case "unknown_failed":
      return "Profil durumu kontrol edilemedi. Tekrar deneyebilirsin.";
  }
}

function getBackendProfileFoundationCanRetry(
  status: BackendProfileFoundationStatus,
): boolean {
  return status !== "configured_false" && status !== "session_missing";
}

function createBackendProfileFoundationState(
  result: BackendProfileFoundationResult,
): BackendProfileFoundationReadState {
  const profileReady = result.profileFoundation?.profileReady ?? false;
  const anonymousIdentityReady =
    result.profileFoundation?.anonymousIdentityReady ?? false;

  return {
    status: result.status,
    profileReady,
    anonymousIdentityReady,
    onboardingComplete: anonymousIdentityReady,
    message: getBackendProfileFoundationMessage(result.status),
    canRetry: getBackendProfileFoundationCanRetry(result.status),
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
  };
}

function createBackendProfileFoundationSessionMissingState(): BackendProfileFoundationReadState {
  return {
    status: "session_missing",
    profileReady: false,
    anonymousIdentityReady: false,
    onboardingComplete: false,
    message: getBackendProfileFoundationMessage("session_missing"),
    canRetry: false,
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
  };
}

function createBackendProfileFoundationUnknownFailedState(): BackendProfileFoundationReadState {
  return {
    status: "unknown_failed",
    profileReady: false,
    anonymousIdentityReady: false,
    onboardingComplete: false,
    message: getBackendProfileFoundationMessage("unknown_failed"),
    canRetry: true,
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
  };
}

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<SessionBoundarySnapshot>(
    inertSessionBoundarySnapshot,
  );
  const [backendProfileFoundation, setBackendProfileFoundation] =
    useState<BackendProfileFoundationReadState>(
      idleBackendProfileFoundationState,
    );
  const isMountedRef = useRef(true);
  const backendProfileReadIdRef = useRef(0);

  const refreshBackendProfileFoundationForSnapshot = useCallback(
    async (
      nextSnapshot: SessionBoundarySnapshot,
    ): Promise<BackendProfileFoundationReadState> => {
      const readId = backendProfileReadIdRef.current + 1;
      backendProfileReadIdRef.current = readId;

      if (!canReadBackendProfileFoundation(nextSnapshot)) {
        const nextState = createBackendProfileFoundationSessionMissingState();

        if (isMountedRef.current) {
          setBackendProfileFoundation(nextState);
        }

        return nextState;
      }

      if (isMountedRef.current) {
        setBackendProfileFoundation(loadingBackendProfileFoundationState);
      }

      try {
        const result = await readBackendProfileFoundationBoundary();
        const nextState = createBackendProfileFoundationState(result);

        if (
          isMountedRef.current &&
          backendProfileReadIdRef.current === readId
        ) {
          setBackendProfileFoundation(nextState);
        }

        return nextState;
      } catch {
        const nextState = createBackendProfileFoundationUnknownFailedState();

        if (
          isMountedRef.current &&
          backendProfileReadIdRef.current === readId
        ) {
          setBackendProfileFoundation(nextState);
        }

        return nextState;
      }
    },
    [],
  );

  const refreshBackendProfileFoundation =
    useCallback(async (): Promise<BackendProfileFoundationReadState> => {
      return refreshBackendProfileFoundationForSnapshot(snapshot);
    }, [refreshBackendProfileFoundationForSnapshot, snapshot]);

  const readSessionBoundaryWithSnapshot =
    useCallback(async (): Promise<AuthSessionReadBoundaryResult> => {
      const result = await readAuthSessionBoundary();

      setSnapshot(result.snapshot);
      void refreshBackendProfileFoundationForSnapshot(result.snapshot);

      return result;
    }, [refreshBackendProfileFoundationForSnapshot]);

  const completeAuthCallbackWithSnapshot = useCallback(
    async (
      request: AuthCallbackBoundaryRequest,
    ): Promise<AuthCallbackBoundaryResult> => {
      const result = await completeAuthCallbackFromUrl(request);

      if (result.isSessionEstablished) {
        const sessionResult = await readAuthSessionBoundary();

        setSnapshot(sessionResult.snapshot);
        void refreshBackendProfileFoundationForSnapshot(sessionResult.snapshot);
      }

      return result;
    },
    [refreshBackendProfileFoundationForSnapshot],
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      backendProfileReadIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    void readAuthSessionBoundary().then((result) => {
      if (!isCancelled && isMountedRef.current) {
        setSnapshot(result.snapshot);
        void refreshBackendProfileFoundationForSnapshot(result.snapshot);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [refreshBackendProfileFoundationForSnapshot]);

  const value = useMemo<AuthSessionProviderValue>(() => {
    return {
      snapshot,
      viewState: getAuthBoundaryViewState({
        session: snapshot.session,
        anonymousIdentity: snapshot.anonymousIdentity,
        ownerCreation: snapshot.ownerCreation,
        recovery: snapshot.recovery,
        authError: null,
      }),
      backendProfileFoundation,
      phaseGate: "auth_provider_skeleton",
      isRuntimeAuthEnabled: false,
      isAuthCallbackBoundaryEnabled: true,
      isAuthEntryBoundaryEnabled: true,
      isOwnerProfileCreationBoundaryEnabled: true,
      isRuntimeAuthReadBoundaryAvailable: true,
      isRuntimeAuthListenerEnabled: false,
      completeAuthCallbackFromUrl: completeAuthCallbackWithSnapshot,
      readSessionBoundary: readSessionBoundaryWithSnapshot,
      requestEmailAuthEntry: (email) => requestEmailAuthEntry({ email }),
      requestOwnerProfileCreation,
      readBackendProfileFoundation: readBackendProfileFoundationBoundary,
      refreshBackendProfileFoundation,
    };
  }, [
    backendProfileFoundation,
    completeAuthCallbackWithSnapshot,
    refreshBackendProfileFoundation,
    readSessionBoundaryWithSnapshot,
    snapshot,
  ]);

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
