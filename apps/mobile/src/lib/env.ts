export type PublicSupabaseEnvKey =
  | "EXPO_PUBLIC_SUPABASE_URL"
  | "EXPO_PUBLIC_SUPABASE_ANON_KEY";

export type SupabasePublicEnv = Readonly<{
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  isConfigured: boolean;
  missingKeys: readonly PublicSupabaseEnvKey[];
}>;

export const PUBLIC_SUPABASE_ENV_KEYS = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
] as const satisfies readonly PublicSupabaseEnvKey[];

declare const process:
  | {
      env?: {
        EXPO_PUBLIC_SUPABASE_URL?: string;
        EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
      };
    }
  | undefined;

function normalizePublicEnvValue(rawValue: string | undefined): string | null {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  return value.length > 0 ? value : null;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const values: Record<PublicSupabaseEnvKey, string | null> = {
    EXPO_PUBLIC_SUPABASE_URL: normalizePublicEnvValue(
      typeof process === "undefined" || process.env === undefined
        ? undefined
        : process.env.EXPO_PUBLIC_SUPABASE_URL,
    ),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: normalizePublicEnvValue(
      typeof process === "undefined" || process.env === undefined
        ? undefined
        : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };

  const missingKeys = PUBLIC_SUPABASE_ENV_KEYS.filter(
    (key) => values[key] === null,
  );

  return {
    supabaseUrl: values.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: values.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    isConfigured: missingKeys.length === 0,
    missingKeys,
  };
}

export const supabasePublicEnv = getSupabasePublicEnv();
