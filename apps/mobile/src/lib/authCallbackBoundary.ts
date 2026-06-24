import { getRuntimeSupabaseBoundary } from "./supabaseBoundary";

export type AuthCallbackBoundaryRequest = Readonly<{
  callbackUrl: string | null;
  routeParams?: Readonly<Record<string, unknown>> | null;
}>;

export type AuthCallbackBoundaryStatus =
  | "missing_url"
  | "callback_error"
  | "missing_tokens"
  | "code_flow_detected"
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
  hasCallbackData: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasCode: boolean;
  hasErrorParam: boolean;
  safeMessage: string;
}>;

type CallbackFields = Readonly<{
  accessToken: string | null;
  refreshToken: string | null;
  hasCallbackData: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasCode: boolean;
  hasErrorParam: boolean;
}>;

const knownCallbackFieldNames = new Set([
  "access_token",
  "refresh_token",
  "code",
  "error",
  "error_description",
]);

function createResult(
  status: AuthCallbackBoundaryStatus,
  isSessionEstablished: boolean,
  safeMessage: string,
  fields?: Pick<
    AuthCallbackBoundaryResult,
    | "hasCallbackData"
    | "hasAccessToken"
    | "hasRefreshToken"
    | "hasCode"
    | "hasErrorParam"
  >,
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
    hasCallbackData: fields?.hasCallbackData ?? false,
    hasAccessToken: fields?.hasAccessToken ?? false,
    hasRefreshToken: fields?.hasRefreshToken ?? false,
    hasCode: fields?.hasCode ?? false,
    hasErrorParam: fields?.hasErrorParam ?? false,
    safeMessage,
  };
}

function appendUrlPartSearchParams(
  target: URLSearchParams,
  urlPart: string,
): void {
  const normalizedUrlPart = urlPart.replace(/^[?#]/, "");

  if (normalizedUrlPart.length === 0) {
    return;
  }

  const sourceParams = new URLSearchParams(normalizedUrlPart);

  sourceParams.forEach((value, key) => {
    if (knownCallbackFieldNames.has(key)) {
      target.set(key, value);
    }
  });
}

function appendRouteParams(
  target: URLSearchParams,
  routeParams: Readonly<Record<string, unknown>> | null | undefined,
): void {
  if (routeParams === null || routeParams === undefined) {
    return;
  }

  for (const [key, rawValue] of Object.entries(routeParams)) {
    if (!knownCallbackFieldNames.has(key)) {
      continue;
    }

    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (typeof value === "string" && value.length > 0) {
      target.set(key, value);
    }
  }
}

function hasOpaqueRouteParams(
  routeParams: Readonly<Record<string, unknown>> | null | undefined,
): boolean {
  if (routeParams === null || routeParams === undefined) {
    return false;
  }

  return Object.keys(routeParams).length > 0;
}

function getCallbackParams(input: AuthCallbackBoundaryRequest): URLSearchParams {
  const params = new URLSearchParams();

  if (input.callbackUrl !== null) {
    const urlParts = input.callbackUrl.split(/[?#]/).slice(1);

    for (const urlPart of urlParts) {
      appendUrlPartSearchParams(params, urlPart);
    }
  }

  appendRouteParams(params, input.routeParams);

  return params;
}

function getCallbackFields(input: AuthCallbackBoundaryRequest): CallbackFields {
  const params = getCallbackParams(input);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const hasCallbackUrl =
    input.callbackUrl !== null && input.callbackUrl.trim().length > 0;

  return {
    accessToken,
    refreshToken,
    hasCallbackData:
      hasCallbackUrl || hasOpaqueRouteParams(input.routeParams) || params.size > 0,
    hasAccessToken: accessToken !== null && accessToken.length > 0,
    hasRefreshToken: refreshToken !== null && refreshToken.length > 0,
    hasCode: params.has("code"),
    hasErrorParam: params.has("error") || params.has("error_description"),
  };
}

export async function completeAuthCallbackFromUrl(
  input: AuthCallbackBoundaryRequest,
): Promise<AuthCallbackBoundaryResult> {
  const fields = getCallbackFields(input);

  if (!fields.hasCallbackData) {
    return createResult(
      "missing_url",
      false,
      "Oturum bağlantısı bulunamadı.",
    );
  }

  if (fields.hasErrorParam) {
    return createResult(
      "callback_error",
      false,
      "Oturum bağlantısı güvenli şekilde tamamlanamadı.",
      fields,
    );
  }

  if (fields.hasCode && (!fields.hasAccessToken || !fields.hasRefreshToken)) {
    return createResult(
      "code_flow_detected",
      false,
      "Bu bağlantı farklı bir oturum tamamlama yöntemi gerektiriyor.",
      fields,
    );
  }

  const accessToken = fields.accessToken;
  const refreshToken = fields.refreshToken;

  if (
    accessToken === null ||
    accessToken.length === 0 ||
    refreshToken === null ||
    refreshToken.length === 0
  ) {
    return createResult(
      "missing_tokens",
      false,
      "Oturum bağlantısı eksik veriyle geldi.",
      fields,
    );
  }

  const boundary = getRuntimeSupabaseBoundary();

  if (!boundary.clientAvailable || boundary.client === null) {
    return createResult(
      "client_unavailable",
      false,
      "Oturum bağlantısı tamamlanamadı.",
      fields,
    );
  }

  try {
    const { error } = await boundary.client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error !== null) {
      return createResult(
        "callback_failed",
        false,
        "Oturum bağlantısı tamamlanamadı.",
        fields,
      );
    }

    return createResult(
      "session_set_client_observed",
      true,
      "Oturum bağlantısı güvenli şekilde alındı.",
      fields,
    );
  } catch {
    return createResult(
      "callback_failed",
      false,
      "Oturum bağlantısı tamamlanamadı.",
      fields,
    );
  }
}
