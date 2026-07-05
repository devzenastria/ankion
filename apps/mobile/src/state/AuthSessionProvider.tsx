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
import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AnonymousIdentityReadiness,
  AuthErrorState,
  AuthSessionState,
  AuthUserView,
  OwnerCreationReadiness,
  SessionBoundarySnapshot,
  SessionRecoveryState,
} from "../lib/authSessionBoundary";
import type {
  AuthCallbackBoundaryRequest,
  AuthCallbackBoundaryResult,
} from "../lib/authCallbackBoundary";
import type {
  BackendProfileFoundationResult,
  BackendProfileFoundationStatus,
} from "../lib/backendApiBoundary";
import {
  requestOwnerProfileCreation,
  type OwnerProfileCreationBoundaryResult,
  type OwnerProfileCreationRequest,
} from "../lib/ownerProfileCreationBoundary";
import {
  type AuthSessionReadBoundaryResult,
} from "../lib/authSessionReadBoundary";
import {
  getAuthBoundaryViewState,
  type AuthBoundaryViewState,
} from "../lib/authSessionViewState";
import {
  type UsernameLoginRequest,
  type UsernameSignupRequest,
} from "../lib/usernameAuthBoundary";
import {
  readOwnAuthSession,
  requestOwnAuthLogin,
  requestOwnAuthLogout,
  requestOwnAuthSignup,
  type OwnAuthMemorySession,
  type OwnAuthSessionReadDto,
  type OwnAuthUsernameResult,
} from "../lib/ownAuthClient";

const ownAuthRefreshTokenStorageKey = "ankion.own_auth.refresh_token.v1";

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
  message: "Profil durumu henüz kontrol edilmedi.",
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

function createBackendProfileFoundationSessionMissingResult(): BackendProfileFoundationResult {
  return {
    kind: "backend_profile_foundation_result",
    status: "session_missing",
    isConfigured: true,
    isSessionRequired: true,
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
    profileFoundation: null,
  };
}

function createBackendProfileFoundationResultFromOwnSession(
  ownSession: OwnAuthMemorySession,
): BackendProfileFoundationResult {
  return {
    kind: "backend_profile_foundation_result",
    status: "success",
    isConfigured: true,
    isSessionRequired: false,
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
    profileFoundation: {
      anonymousIdentityReady: ownSession.session.anonymousIdentityReady,
      onboardingComplete: ownSession.session.onboardingComplete,
      profileReady: ownSession.session.profileReady,
    },
  };
}

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
  isBackendAuthority: true;
  isProductUnlockEnabled: false;
  isListenerEnabled: false;
}>;

export type AuthSessionProviderValue = Readonly<{
  snapshot: SessionBoundarySnapshot;
  viewState: AuthBoundaryViewState;
  backendProfileFoundation: BackendProfileFoundationReadState;
  isInitialSessionReadPending: boolean;
  phaseGate: "auth_provider_skeleton";
  isRuntimeAuthEnabled: boolean;
  isAuthCallbackBoundaryEnabled: false;
  isOwnerProfileCreationBoundaryEnabled: true;
  isRuntimeAuthReadBoundaryAvailable: true;
  isRuntimeAuthListenerEnabled: false;
  completeAuthCallbackFromUrl: (
    request: AuthCallbackBoundaryRequest,
  ) => Promise<AuthCallbackBoundaryResult>;
  readSessionBoundary: () => Promise<AuthSessionReadBoundaryResult>;
  requestUsernameSignup: (
    input: UsernameSignupRequest,
  ) => Promise<OwnAuthUsernameResult>;
  requestUsernameLogin: (
    input: UsernameLoginRequest,
  ) => Promise<OwnAuthUsernameResult>;
  requestOwnerProfileCreation: (
    input: OwnerProfileCreationRequest,
  ) => Promise<OwnerProfileCreationBoundaryResult>;
  readBackendProfileFoundation: () => Promise<BackendProfileFoundationResult>;
  refreshBackendProfileFoundation: () => Promise<BackendProfileFoundationReadState>;
  requestSignOut: () => Promise<AuthSignOutBoundaryResult>;
}>;

const AuthSessionContext = createContext<AuthSessionProviderValue | null>(null);

async function readBackendProfileFoundationBoundary(
  ownSession: OwnAuthMemorySession | null,
): Promise<BackendProfileFoundationResult> {
  if (ownSession === null) {
    return createBackendProfileFoundationSessionMissingResult();
  }

  return createBackendProfileFoundationResultFromOwnSession(ownSession);
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
  profileReady = false,
  anonymousIdentityReady = false,
  onboardingComplete = false,
): string {
  switch (status) {
    case "configured_false":
      return "Backend API adresi yapılandırılmadı.";
    case "session_missing":
      return "Oturum yok. Önce giriş yap.";
    case "success": {
      if (onboardingComplete) {
        return "Profil kurulumu güncel.";
      }

      if (profileReady && !anonymousIdentityReady) {
        return "Profil bilgisi hazır, anonim kimlik eksik.";
      }

      if (!profileReady && anonymousIdentityReady) {
        return "Anonim kimlik hazır, profil bilgisi eksik.";
      }

      return "Profil temeli henüz oluşturulmadı.";
    }
    case "auth_required":
    case "auth_invalid":
      return "Oturum backend tarafından doğrulanamadı.";
    case "backend_configuration_required":
      return "Backend yapılandırması tamamlanmadı.";
    case "read_failed":
      return "Profil durumu güvenli şekilde okunamadı.";
    case "network_failed":
      return "Backend bağlantısı kurulamadı. Tekrar deneyebilirsin.";
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
  const onboardingComplete =
    result.profileFoundation?.onboardingComplete ??
    (profileReady && anonymousIdentityReady);

  return {
    status: result.status,
    profileReady,
    anonymousIdentityReady,
    onboardingComplete,
    message: getBackendProfileFoundationMessage(
      result.status,
      profileReady,
      anonymousIdentityReady,
      onboardingComplete,
    ),
    canRetry: getBackendProfileFoundationCanRetry(result.status),
    isBackendAuthority: false,
    isProductUnlockEnabled: false,
  };
}

function createBackendProfileFoundationCompleteState(): BackendProfileFoundationReadState {
  return {
    status: "success",
    profileReady: true,
    anonymousIdentityReady: true,
    onboardingComplete: true,
    message: getBackendProfileFoundationMessage("success", true, true, true),
    canRetry: false,
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
    isBackendAuthority: true,
    isProductUnlockEnabled: false,
    isListenerEnabled: false,
  };
}

function createOwnAuthUserView(ownSession: OwnAuthMemorySession): AuthUserView {
  return {
    id: ownSession.account.id,
    displayName: ownSession.account.username,
    email: null,
    phone: null,
    providerLabel: "ankion_api",
    isServerDerived: true,
    isDisplayOnly: true,
  };
}

function createOwnAuthAnonymousIdentity(
  ownSession: OwnAuthMemorySession,
): AnonymousIdentityReadiness {
  return {
    status: ownSession.session.anonymousIdentityReady ? "ready" : "not_created",
    serverConfirmedAnonymousIdentityId: ownSession.session.anonymousIdentityId,
    isServerConfirmed: true,
    localCacheTrusted: false,
  };
}

function createOwnAuthOwnerCreation(
  ownSession: OwnAuthMemorySession,
): OwnerCreationReadiness {
  const isComplete = ownSession.session.onboardingComplete;

  return {
    status: isComplete ? "complete" : "eligible",
    error: null,
    canRequest: !isComplete,
    isRequestEligibilityOnly: true,
  };
}

function createOwnAuthSnapshot(
  ownSession: OwnAuthMemorySession,
): SessionBoundarySnapshot {
  const session: AuthSessionState = {
    status: "authenticated",
    user: createOwnAuthUserView(ownSession),
    error: null,
    recovery: inertRecoveryState,
    isServerConfirmed: true,
    isLocalOnly: false,
  };

  return {
    session,
    anonymousIdentity: createOwnAuthAnonymousIdentity(ownSession),
    ownerCreation: createOwnAuthOwnerCreation(ownSession),
    recovery: inertRecoveryState,
    errors: [],
  };
}

function createOwnAuthUnauthenticatedSnapshot(): SessionBoundarySnapshot {
  return {
    session: {
      status: "unauthenticated",
      user: null,
      error: null,
      recovery: inertRecoveryState,
      isServerConfirmed: true,
      isLocalOnly: false,
    },
    anonymousIdentity: inertAnonymousIdentity,
    ownerCreation: inertOwnerCreation,
    recovery: inertRecoveryState,
    errors: [],
  };
}

function createReadFailedSnapshot(message: string | null): SessionBoundarySnapshot {
  const recovery: SessionRecoveryState = {
    status: "server_recheck_required",
    reason: "own_auth_session_read_failed",
    requiresServerRecheck: true,
  };
  const error: AuthErrorState = {
    code: "SESSION_REFRESH_FAILED",
    message,
    recoveryStatus: recovery.status,
  };

  return {
    session: {
      status: "refresh_failed",
      user: null,
      error,
      recovery,
      isServerConfirmed: false,
      isLocalOnly: false,
    },
    anonymousIdentity: inertAnonymousIdentity,
    ownerCreation: inertOwnerCreation,
    recovery,
    errors: [error],
  };
}

async function readPersistedOwnAuthRefreshToken(): Promise<string | null> {
  try {
    const storedValue = await AsyncStorage.getItem(ownAuthRefreshTokenStorageKey);
    const refreshToken =
      typeof storedValue === "string" ? storedValue.trim() : "";

    return refreshToken.length > 0 ? refreshToken : null;
  } catch {
    return null;
  }
}

async function persistOwnAuthRefreshToken(refreshToken: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ownAuthRefreshTokenStorageKey, refreshToken);
  } catch {
    // Runtime auth remains usable in-memory even if device storage is unavailable.
  }
}

async function clearPersistedOwnAuthRefreshToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ownAuthRefreshTokenStorageKey);
  } catch {
    // Best-effort cleanup; server-side logout still invalidates the session.
  }
}

function createOwnAuthMemorySessionFromRead(
  input: {
    account: OwnAuthMemorySession["account"];
    session: OwnAuthSessionReadDto;
  },
  refreshToken: string,
): OwnAuthMemorySession {
  return {
    account: input.account,
    session: {
      ...input.session,
      accessToken: "",
      refreshToken,
    },
  };
}

function createOwnAuthSessionReadResult(input: {
  status: AuthSessionReadBoundaryResult["status"];
  snapshot: SessionBoundarySnapshot;
  sessionPresent: boolean;
  isServerConfirmed: boolean;
}): AuthSessionReadBoundaryResult {
  return {
    kind: "auth_session_read_boundary_result",
    phaseGate: "auth_session_read_boundary",
    status: input.status,
    snapshot: input.snapshot,
    clientAvailable: true,
    sessionPresent: input.sessionPresent,
    isBackendAuthority: true,
    isServerConfirmed: input.isServerConfirmed,
    isMutationEnabled: false,
    isListenerEnabled: false,
  };
}

function isSnapshotProfileFoundationComplete(
  snapshot: SessionBoundarySnapshot,
): boolean {
  return snapshot.ownerCreation.status === "complete";
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
  const ownAuthMemorySessionRef = useRef<OwnAuthMemorySession | null>(null);
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
        setBackendProfileFoundation((currentState) => {
          if (
            currentState.onboardingComplete ||
            isSnapshotProfileFoundationComplete(nextSnapshot)
          ) {
            return currentState.onboardingComplete
              ? currentState
              : createBackendProfileFoundationCompleteState();
          }

          return loadingBackendProfileFoundationState;
        });
      }

      try {
        const result = await readBackendProfileFoundationBoundary(
          ownAuthMemorySessionRef.current,
        );
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
      const currentSession = ownAuthMemorySessionRef.current;

      if (currentSession === null) {
        const persistedRefreshToken = await readPersistedOwnAuthRefreshToken();

        if (persistedRefreshToken !== null) {
          const persistedSessionResult = await readOwnAuthSession(
            persistedRefreshToken,
          );

          if (persistedSessionResult.status === "success") {
            const nextSession = createOwnAuthMemorySessionFromRead(
              persistedSessionResult.session,
              persistedRefreshToken,
            );
            const snapshot = createOwnAuthSnapshot(nextSession);
            const result = createOwnAuthSessionReadResult({
              status: "authenticated_client_observed",
              snapshot,
              sessionPresent: true,
              isServerConfirmed: true,
            });

            ownAuthMemorySessionRef.current = nextSession;

            if (isMountedRef.current) {
              setSnapshot(result.snapshot);
              void refreshBackendProfileFoundationForSnapshot(result.snapshot);
            }

            return result;
          }

          if (persistedSessionResult.status === "invalid_session") {
            await clearPersistedOwnAuthRefreshToken();
          } else {
            const snapshot = createReadFailedSnapshot(
              persistedSessionResult.safeMessage,
            );
            const result = createOwnAuthSessionReadResult({
              status: "read_failed",
              snapshot,
              sessionPresent: false,
              isServerConfirmed: false,
            });

            if (isMountedRef.current) {
              setSnapshot(result.snapshot);
              void refreshBackendProfileFoundationForSnapshot(result.snapshot);
            }

            return result;
          }
        }

        const snapshot = createOwnAuthUnauthenticatedSnapshot();
        const result = createOwnAuthSessionReadResult({
          status: "unauthenticated",
          snapshot,
          sessionPresent: false,
          isServerConfirmed: true,
        });

        if (isMountedRef.current) {
          setSnapshot(result.snapshot);
          void refreshBackendProfileFoundationForSnapshot(result.snapshot);
        }

        return result;
      }

      const ownAuthSessionResult = await readOwnAuthSession(
        currentSession.session.refreshToken,
      );

      if (ownAuthSessionResult.status === "success") {
        const nextSession: OwnAuthMemorySession = {
          account: ownAuthSessionResult.session.account,
          session: {
            ...ownAuthSessionResult.session.session,
            accessToken: currentSession.session.accessToken,
            refreshToken: currentSession.session.refreshToken,
          },
        };
        const snapshot = createOwnAuthSnapshot(nextSession);
        const result = createOwnAuthSessionReadResult({
          status: "authenticated_client_observed",
          snapshot,
          sessionPresent: true,
          isServerConfirmed: true,
        });

        ownAuthMemorySessionRef.current = nextSession;

        if (isMountedRef.current) {
          setSnapshot(result.snapshot);
          void refreshBackendProfileFoundationForSnapshot(result.snapshot);
        }

        return result;
      }

      if (ownAuthSessionResult.status === "invalid_session") {
        const snapshot = createOwnAuthUnauthenticatedSnapshot();
        const result = createOwnAuthSessionReadResult({
          status: "unauthenticated",
          snapshot,
          sessionPresent: false,
          isServerConfirmed: true,
        });

        ownAuthMemorySessionRef.current = null;
        await clearPersistedOwnAuthRefreshToken();

        if (isMountedRef.current) {
          setSnapshot(result.snapshot);
          void refreshBackendProfileFoundationForSnapshot(result.snapshot);
        }

        return result;
      }

      const snapshot = createReadFailedSnapshot(ownAuthSessionResult.safeMessage);
      const result = createOwnAuthSessionReadResult({
        status: "read_failed",
        snapshot,
        sessionPresent: false,
        isServerConfirmed: false,
      });

      if (isMountedRef.current) {
        setSnapshot(result.snapshot);
        void refreshBackendProfileFoundationForSnapshot(result.snapshot);
      }

      return result;
    }, []);

  const completeAuthCallbackWithSnapshot = useCallback(
    async (
      request: AuthCallbackBoundaryRequest,
    ): Promise<AuthCallbackBoundaryResult> => {
      const hasCallbackData =
        (request.callbackUrl !== null && request.callbackUrl.trim().length > 0) ||
        (request.routeParams !== null &&
          request.routeParams !== undefined &&
          Object.keys(request.routeParams).length > 0);

      return {
        kind: "auth_callback_boundary_result",
        phaseGate: "auth_callback_deep_link_boundary",
        status: hasCallbackData ? "callback_failed" : "missing_url",
        isBackendAuthority: false,
        isServerConfirmed: false,
        isListenerEnabled: false,
        isOwnerCreationEnabled: false,
        isProfileCreationEnabled: false,
        isProductUnlockEnabled: false,
        isSessionEstablished: false,
        isPersistentSessionEnabled: false,
        hasCallbackData,
        hasAccessToken: false,
        hasRefreshToken: false,
        hasCode: false,
        hasErrorParam: false,
        safeMessage: "Own auth mobil oturum bağlantısı kullanmaz.",
      };
    },
    [],
  );

  const refreshSnapshotAfterUsernameAuth = useCallback(
    async (result: OwnAuthUsernameResult): Promise<OwnAuthUsernameResult> => {
      if (result.isSessionEstablished && result.ownAuthSession !== null) {
        const snapshot = createOwnAuthSnapshot(result.ownAuthSession);

        ownAuthMemorySessionRef.current = result.ownAuthSession;
        await persistOwnAuthRefreshToken(
          result.ownAuthSession.session.refreshToken,
        );

        if (isMountedRef.current) {
          setSnapshot(snapshot);
          setBackendProfileFoundation(
            createBackendProfileFoundationState(
              createBackendProfileFoundationResultFromOwnSession(
                result.ownAuthSession,
              ),
            ),
          );
        }
      }

      return result;
    },
    [refreshBackendProfileFoundationForSnapshot],
  );

  const requestUsernameSignupWithSnapshot = useCallback(
    async (input: UsernameSignupRequest): Promise<OwnAuthUsernameResult> => {
      const result = await requestOwnAuthSignup(input);

      return refreshSnapshotAfterUsernameAuth(result);
    },
    [refreshSnapshotAfterUsernameAuth],
  );

  const requestUsernameLoginWithSnapshot = useCallback(
    async (input: UsernameLoginRequest): Promise<OwnAuthUsernameResult> => {
      const result = await requestOwnAuthLogin(input);

      return refreshSnapshotAfterUsernameAuth(result);
    },
    [refreshSnapshotAfterUsernameAuth],
  );

  const requestOwnerProfileCreationWithSnapshot = useCallback(
    async (
      input: OwnerProfileCreationRequest,
    ): Promise<OwnerProfileCreationBoundaryResult> => {
      const result = await requestOwnerProfileCreation({
        ...input,
        refreshToken: ownAuthMemorySessionRef.current?.session.refreshToken ?? null,
      });

      if (result.isServerConfirmed) {
        await readSessionBoundaryWithSnapshot();
      }

      return result;
    },
    [readSessionBoundaryWithSnapshot],
  );

  const requestSignOutWithSnapshot =
    useCallback(async (): Promise<AuthSignOutBoundaryResult> => {
      const currentSession = ownAuthMemorySessionRef.current;

      try {
        if (currentSession !== null) {
          await requestOwnAuthLogout(currentSession.session.refreshToken);
        }

        ownAuthMemorySessionRef.current = null;
        await clearPersistedOwnAuthRefreshToken();
        const snapshot = createOwnAuthUnauthenticatedSnapshot();

        if (isMountedRef.current) {
          setSnapshot(snapshot);
          setBackendProfileFoundation(createBackendProfileFoundationSessionMissingState());
        }

        return createAuthSignOutResult(
          "signed_out",
          "Çıkış yapıldı.",
          true,
        );
      } catch {
        ownAuthMemorySessionRef.current = null;
        await clearPersistedOwnAuthRefreshToken();
        const snapshot = createOwnAuthUnauthenticatedSnapshot();

        if (isMountedRef.current) {
          setSnapshot(snapshot);
          setBackendProfileFoundation(createBackendProfileFoundationSessionMissingState());
        }

        return createAuthSignOutResult(
          "signed_out",
          "Çıkış yapıldı.",
          true,
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

    void readSessionBoundaryWithSnapshot()
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
  }, [readSessionBoundaryWithSnapshot, refreshBackendProfileFoundationForSnapshot]);

  const readBackendProfileFoundationWithMemory =
    useCallback(async (): Promise<BackendProfileFoundationResult> => {
      return readBackendProfileFoundationBoundary(
        ownAuthMemorySessionRef.current,
      );
    }, []);

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
      isRuntimeAuthEnabled: true,
      isAuthCallbackBoundaryEnabled: false,
      isOwnerProfileCreationBoundaryEnabled: true,
      isRuntimeAuthReadBoundaryAvailable: true,
      isRuntimeAuthListenerEnabled: false,
      completeAuthCallbackFromUrl: completeAuthCallbackWithSnapshot,
      readSessionBoundary: readSessionBoundaryWithSnapshot,
      requestUsernameSignup: requestUsernameSignupWithSnapshot,
      requestUsernameLogin: requestUsernameLoginWithSnapshot,
      requestOwnerProfileCreation: requestOwnerProfileCreationWithSnapshot,
      readBackendProfileFoundation: readBackendProfileFoundationWithMemory,
      refreshBackendProfileFoundation,
      requestSignOut: requestSignOutWithSnapshot,
    };
  }, [
    backendProfileFoundation,
    completeAuthCallbackWithSnapshot,
    isInitialSessionReadPending,
    readBackendProfileFoundationWithMemory,
    refreshBackendProfileFoundation,
    readSessionBoundaryWithSnapshot,
    requestSignOutWithSnapshot,
    requestOwnerProfileCreationWithSnapshot,
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
