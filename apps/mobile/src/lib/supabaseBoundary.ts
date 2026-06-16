import { getSupabasePublicEnv, type SupabasePublicEnv } from "./env";

export type InertSupabaseBoundary = Readonly<{
  kind: "inert_supabase_boundary";
  status: "configured" | "missing_public_env";
  env: SupabasePublicEnv;
  clientAvailable: false;
}>;

export function getInertSupabaseBoundary(): InertSupabaseBoundary {
  const env = getSupabasePublicEnv();

  return {
    kind: "inert_supabase_boundary",
    status: env.isConfigured ? "configured" : "missing_public_env",
    env,
    clientAvailable: false,
  };
}

export const inertSupabaseBoundary = getInertSupabaseBoundary();