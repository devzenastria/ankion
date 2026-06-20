import { getRuntimeSupabaseBoundary } from "./supabaseBoundary";

export type AuthCallbackBoundaryRequest = Readonly<{
  callbackUrl: string | null;
}>;

export type AuthCallbackBoundaryStatus =
  | "missing_url"
  | "missing_tokens"
  | "client_unavailable"
  | "session_set_client_observed"
  | "callback_failed";

export type AuthCallbackBoundaryResult = Readonly<{
  kind: "auth_callback_boundary_result";
  phaseGate: "auth_callback_deep_link_boundary";
  status: AuthCallbackBoundaryStatus;
  isBackendAuthority: false;
  isServerConfirmed: false;
  isListenerEnabled: false;
  isOwnerCreationEnabled: false;
  isProfileCreationEnabled: false;
  isProductUnlockEnabled: false;
  isSessionEstablished: boolean;
  isPersistentSessionEnabled: false;
  safeMessage: string;
}>;

type CallbackTokens = Readonly<{
  accessToken: string | null;
  refreshToken: string | null;
}>;

function createResult(
  status: AuthCallbackBoundaryStatus,
  isSessionEstablished: boolean,
  safeMessage: string,
): AuthCallbackBoundaryResult {
  return {
    kind: "auth_callback_boundary_result",
    phaseGate: "auth_callback_deep_link_boundary",
    status,
    isBackendAuthority: false,
    isServerConfirmed: false,
    isListenerEnabled: false,
    isOwnerCreationEnabled: false,
    isProfileCreationEnabled: false,
    isProductUnlockEnabled: false,
    isSessionEstablished,
    isPersistentSessionEnabled: false,
    safeMessage,
  };
}

function appendUrlPartSearchParams(
  target: URLSearchParams,
  urlPart: string,
): void {
  const normalizedUrlPart = urlPart.startsWith("?")
    ? urlPart.slice(1)
    : urlPart;
  const sourceParams = new URLSearchParams(normalizedUrlPart);

  sourceParams.forEach((value, key) => {
    target.set(key, value);
  });
}

function getCallbackParams(callbackUrl: string): URLSearchParams {
  const params = new URLSearchParams();
  const queryStart = callbackUrl.indexOf("?");
  const hashStart = callbackUrl.indexOf("#");

  if (queryStart >= 0) {
    const queryEnd =
      hashStart >= 0 && hashStart > queryStart ? hashStart : callbackUrl.length;
    appendUrlPartSearchParams(params, callbackUrl.slice(queryStart + 1, queryEnd));
  }

  if (hashStart >= 0) {
    appendUrlPartSearchParams(params, callbackUrl.slice(hashStart + 1));
  }

  return params;
}

function getCallbackTokens(callbackUrl: string): CallbackTokens {
  const params = getCallbackParams(callbackUrl);

  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
  };
}

export async function completeAuthCallbackFromUrl(
  input: AuthCallbackBoundaryRequest,
): Promise<AuthCallbackBoundaryResult> {
  if (input.callbackUrl === null || input.callbackUrl.trim().length === 0) {
    return createResult(
      "missing_url",
      false,
      "Oturum bağlantısı tamamlanamadı.",
    );
  }

  const tokens = getCallbackTokens(input.callbackUrl);

  if (tokens.accessToken === null || tokens.refreshToken === null) {
    return createResult(
      "missing_tokens",
      false,
      "Oturum bağlantısı tamamlanamadı.",
    );
  }

  const boundary = getRuntimeSupabaseBoundary();

  if (!boundary.clientAvailable || boundary.client === null) {
    return createResult(
      "client_unavailable",
      false,
      "Oturum bağlantısı tamamlanamadı.",
    );
  }

  try {
    const { error } = await boundary.client.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    if (error !== null) {
      return createResult(
        "callback_failed",
        false,
        "Oturum bağlantısı tamamlanamadı.",
      );
    }

    return createResult(
      "session_set_client_observed",
      true,
      "Oturum bağlantısı alındı.",
    );
  } catch {
    return createResult(
      "callback_failed",
      false,
      "Oturum bağlantısı tamamlanamadı.",
    );
  }
}
