import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabasePublicEnv,
  type PublicSupabaseEnvKey,
  type SupabasePublicEnv,
} from "./env";

export type SupabaseBoundaryReason =
  | "missing_env"
  | "unconfigured"
  | "dependency_ready"
  | "disabled_by_phase_gate";

export type SupabaseBoundaryPhaseGate = "inert_client_boundary";

export type SupabaseBoundaryDebugSafeDescriptor = Readonly<{
  dependencyReady: true;
  phaseGate: SupabaseBoundaryPhaseGate;
  reason: SupabaseBoundaryReason;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  missingKeys: readonly PublicSupabaseEnvKey[];
}>;

export type InertSupabaseBoundary = Readonly<{
  kind: "inert_supabase_boundary";
  status: "configured" | "missing_public_env";
  env: SupabasePublicEnv;
  clientAvailable: false;
  client: SupabaseClient | null;
  dependencyReady: true;
  phaseGate: SupabaseBoundaryPhaseGate;
  reason: SupabaseBoundaryReason;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  debugSafeDescriptor: SupabaseBoundaryDebugSafeDescriptor;
}>;

function getBoundaryReason(env: SupabasePublicEnv): SupabaseBoundaryReason {
  return env.isConfigured ? "disabled_by_phase_gate" : "missing_env";
}

function getDebugSafeDescriptor(
  env: SupabasePublicEnv,
): SupabaseBoundaryDebugSafeDescriptor {
  const reason = getBoundaryReason(env);

  return {
    dependencyReady: true,
    phaseGate: "inert_client_boundary",
    reason,
    urlConfigured: env.supabaseUrl !== null,
    anonKeyConfigured: env.supabaseAnonKey !== null,
    missingKeys: env.missingKeys,
  };
}

export function getInertSupabaseBoundary(): InertSupabaseBoundary {
  const env = getSupabasePublicEnv();
  const debugSafeDescriptor = getDebugSafeDescriptor(env);

  return {
    kind: "inert_supabase_boundary",
    status: env.isConfigured ? "configured" : "missing_public_env",
    env,
    clientAvailable: false,
    client: null,
    dependencyReady: true,
    phaseGate: "inert_client_boundary",
    reason: debugSafeDescriptor.reason,
    urlConfigured: debugSafeDescriptor.urlConfigured,
    anonKeyConfigured: debugSafeDescriptor.anonKeyConfigured,
    debugSafeDescriptor,
  };
}

export const inertSupabaseBoundary = getInertSupabaseBoundary();
