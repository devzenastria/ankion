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
import {
  requestUsernameLogin,
  requestUsernameSignup,
  type UsernameAuthResult,
  type UsernameLoginRequest,
  type UsernameSignupRequest,
} from "../lib/usernameAuthBoundary";

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

export type AuthSignOutBoundaryStatus =
  | "signed_out"
  | "client_unavailable"
  | "sign_out_failed"
  | "session_still_present"
  | "session_read_failed";

export type AuthSignOutBoundaryResult = Readonly<{
  kind: "auth_sign_out_boundary_result";
  status: AuthSignOutBoundaryStatus;
  safeMessage: string;
  isSessionCleared: boolean;
  isBackendAuthority: false;
  isProductUnlockEnabled: false;
  isListenerEnabled: false;
}>;

export type AuthSessionProviderValue = Readonly<{
  snapshot: SessionBoundarySnapshot;
  viewState: AuthBoundaryViewState;
  backendProfileFoundation: BackendProfileFoundationReadState;
  isInitialSessionReadPending: boolean;
  phaseGate: "auth_provider_skeleton";
  isRuntimeAuthEnabled: false;
  isAuthCallbackBoundaryEnabled: true;
  isOwnerProfileCreationBoundaryEnabled: true;
  isRuntimeAuthReadBoundaryAvailable: true;
  isRuntimeAuthListenerEnabled: false;
  completeAuthCallbackFromUrl: (
    request: AuthCallbackBoundaryRequest,
  ) => Promise<AuthCallbackBoundaryResult>;
  readSessionBoundary: () => Promise<AuthSessionReadBoundaryResult>;
  requestUsernameSignup: (
    input: UsernameSignupRequest,
  ) => Promise<UsernameAuthResult>;
  requestUsernameLogin: (
    input: UsernameLoginRequest,
  ) => Promise<UsernameAuthResult>;
  requestOwnerProfileCreation: (
    input: OwnerProfileCreationRequest,
  ) => Promise<OwnerProfileCreationBoundaryResult>;
  readBackendProfileFoundation: () => Promise<BackendProfileFoundationResult>;
  refreshBackendProfileFoundation: () => Promise<BackendProfileFoundationReadState>;
  requestSignOut: () => Promise<AuthSignOutBoundaryResult>;
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

function createAuthSignOutResult(
  status: AuthSignOutBoundaryStatus,
  safeMessage: string,
  isSessionCleared: boolean,
): AuthSignOutBoundaryResult {
  return {
    kind: "auth_sign_out_boundary_result",
    status,
    safeMessage,
    isSessionCleared,
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
    isListenerEnabled: false,
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
  const [isInitialSessionReadPending, setIsInitialSessionReadPending] =
    useState(true);
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

  const refreshSnapshotAfterUsernameAuth = useCallback(
    async (result: UsernameAuthResult): Promise<UsernameAuthResult> => {
      if (result.isSessionEstablished) {
        const sessionResult = await readAuthSessionBoundary();

        if (isMountedRef.current) {
          setSnapshot(sessionResult.snapshot);
          void refreshBackendProfileFoundationForSnapshot(sessionResult.snapshot);
        }
      }

      return result;
    },
    [refreshBackendProfileFoundationForSnapshot],
  );

  const requestUsernameSignupWithSnapshot = useCallback(
    async (input: UsernameSignupRequest): Promise<UsernameAuthResult> => {
      const result = await requestUsernameSignup(input);

      return refreshSnapshotAfterUsernameAuth(result);
    },
    [refreshSnapshotAfterUsernameAuth],
  );

  const requestUsernameLoginWithSnapshot = useCallback(
    async (input: UsernameLoginRequest): Promise<UsernameAuthResult> => {
      const result = await requestUsernameLogin(input);

      return refreshSnapshotAfterUsernameAuth(result);
    },
    [refreshSnapshotAfterUsernameAuth],
  );

  const requestSignOutWithSnapshot =
    useCallback(async (): Promise<AuthSignOutBoundaryResult> => {
      const boundary = getRuntimeSupabaseBoundary();

      if (!boundary.clientAvailable || boundary.client === null) {
        return createAuthSignOutResult(
          "client_unavailable",
          "\u00c7\u0131k\u0131\u015f yap\u0131lamad\u0131. Oturum istemcisi haz\u0131r de\u011fil.",
          false,
        );
      }

      try {
        const { error } = await boundary.client.auth.signOut();

        if (error !== null) {
          return createAuthSignOutResult(
            "sign_out_failed",
            "\u00c7\u0131k\u0131\u015f yap\u0131lamad\u0131. Tekrar dene.",
            false,
          );
        }

        const sessionResult = await readAuthSessionBoundary();

        if (isMountedRef.current) {
          setSnapshot(sessionResult.snapshot);
          void refreshBackendProfileFoundationForSnapshot(sessionResult.snapshot);
        }

        if (
          sessionResult.status === "unauthenticated" &&
          !sessionResult.sessionPresent
        ) {
          return createAuthSignOutResult(
            "signed_out",
            "\u00c7\u0131k\u0131\u015f yap\u0131ld\u0131.",
            true,
          );
        }

        if (sessionResult.status === "read_failed") {
          return createAuthSignOutResult(
            "session_read_failed",
            "\u00c7\u0131k\u0131\u015f durumu do\u011frulanamad\u0131. Tekrar dene.",
            false,
          );
        }

        return createAuthSignOutResult(
          "session_still_present",
          "Oturum hala a\u00e7\u0131k g\u00f6r\u00fcn\u00fcyor. Tekrar dene.",
          false,
        );
      } catch {
        return createAuthSignOutResult(
          "sign_out_failed",
          "\u00c7\u0131k\u0131\u015f yap\u0131lamad\u0131. Tekrar dene.",
          false,
        );
      }
    }, [refreshBackendProfileFoundationForSnapshot]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      backendProfileReadIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    void readAuthSessionBoundary()
      .then((result) => {
        if (!isCancelled && isMountedRef.current) {
          setSnapshot(result.snapshot);
          void refreshBackendProfileFoundationForSnapshot(result.snapshot);
        }
      })
      .finally(() => {
        if (!isCancelled && isMountedRef.current) {
          setIsInitialSessionReadPending(false);
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
      isInitialSessionReadPending,
      phaseGate: "auth_provider_skeleton",
      isRuntimeAuthEnabled: false,
      isAuthCallbackBoundaryEnabled: true,
      isOwnerProfileCreationBoundaryEnabled: true,
      isRuntimeAuthReadBoundaryAvailable: true,
      isRuntimeAuthListenerEnabled: false,
      completeAuthCallbackFromUrl: completeAuthCallbackWithSnapshot,
      readSessionBoundary: readSessionBoundaryWithSnapshot,
      requestUsernameSignup: requestUsernameSignupWithSnapshot,
      requestUsernameLogin: requestUsernameLoginWithSnapshot,
      requestOwnerProfileCreation,
      readBackendProfileFoundation: readBackendProfileFoundationBoundary,
      refreshBackendProfileFoundation,
      requestSignOut: requestSignOutWithSnapshot,
    };
  }, [
    backendProfileFoundation,
    completeAuthCallbackWithSnapshot,
    isInitialSessionReadPending,
    refreshBackendProfileFoundation,
    readSessionBoundaryWithSnapshot,
    requestSignOutWithSnapshot,
    requestUsernameLoginWithSnapshot,
    requestUsernameSignupWithSnapshot,
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
