let rememberedAuthCallbackUrl: string | null = null;

const authCallbackUrlIndicators = [
  "ankion://auth-callback",
  "auth-callback",
  "access_token",
  "refresh_token",
  "code=",
  "error=",
  "error_description",
];

function isAuthCallbackUrlCandidate(url: string | null): url is string {
  if (url === null || url.trim().length === 0) {
    return false;
  }

  const normalizedUrl = url.toLowerCase();

  return authCallbackUrlIndicators.some((indicator) =>
    normalizedUrl.includes(indicator),
  );
}

export function getAuthCallbackUrlSafeSignature(url: string | null): string {
  if (url === null || url.length === 0) {
    return "no-url";
  }

  const normalizedUrl = url.toLowerCase();

  return [
    "url-present",
    normalizedUrl.includes("auth-callback")
      ? "auth-callback"
      : "no-auth-callback",
    normalizedUrl.includes("access_token")
      ? "access-field"
      : "no-access-field",
    normalizedUrl.includes("refresh_token")
      ? "refresh-field"
      : "no-refresh-field",
    normalizedUrl.includes("code=") ? "code-field" : "no-code-field",
    normalizedUrl.includes("error") ? "error-field" : "no-error-field",
  ].join(",");
}

export function rememberAuthCallbackUrl(url: string | null): void {
  if (!isAuthCallbackUrlCandidate(url)) {
    return;
  }

  rememberedAuthCallbackUrl = url;
}

export function getRememberedAuthCallbackUrl(): string | null {
  return rememberedAuthCallbackUrl;
}

export function consumeRememberedAuthCallbackUrl(): string | null {
  const url = rememberedAuthCallbackUrl;

  rememberedAuthCallbackUrl = null;

  return url;
}
