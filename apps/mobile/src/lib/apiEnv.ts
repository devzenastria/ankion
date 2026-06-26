export type PublicBackendApiEnvKey = "EXPO_PUBLIC_ANKION_API_BASE_URL";

export type BackendApiPublicEnv = Readonly<{
  apiBaseUrl: string | null;
  isConfigured: boolean;
  missingKeys: readonly PublicBackendApiEnvKey[];
}>;

export const PUBLIC_BACKEND_API_ENV_KEYS = [
  "EXPO_PUBLIC_ANKION_API_BASE_URL",
] as const satisfies readonly PublicBackendApiEnvKey[];

declare const process:
  | {
      env?: {
        EXPO_PUBLIC_ANKION_API_BASE_URL?: string;
      };
    }
  | undefined;

function normalizeApiBaseUrl(rawValue: string | undefined): string | null {
  const trimmedValue = typeof rawValue === "string" ? rawValue.trim() : "";

  if (trimmedValue.length === 0) {
    return null;
  }

  return trimmedValue.replace(/\/+$/, "");
}

export function getBackendApiPublicEnv(): BackendApiPublicEnv {
  const apiBaseUrl = normalizeApiBaseUrl(
    typeof process === "undefined" || process.env === undefined
      ? undefined
      : process.env.EXPO_PUBLIC_ANKION_API_BASE_URL,
  );
  const missingKeys =
    apiBaseUrl === null ? PUBLIC_BACKEND_API_ENV_KEYS : [];

  return {
    apiBaseUrl,
    isConfigured: missingKeys.length === 0,
    missingKeys,
  };
}

export const backendApiPublicEnv = getBackendApiPublicEnv();
