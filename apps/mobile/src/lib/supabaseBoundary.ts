import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabasePublicEnv,
  type PublicSupabaseEnvKey,
  type SupabasePublicEnv,
} from "./env";

export type SupabaseBoundaryReason =
  | "missing_env"
  | "unconfigured"
  | "dependency_ready"
  | "runtime_client_ready"
  | "disabled_by_phase_gate";

export type SupabaseBoundaryPhaseGate =
  | "inert_client_boundary"
  | "runtime_client_boundary";

export type SupabaseBoundaryDebugSafeDescriptor = Readonly<{
  dependencyReady: true;
  phaseGate: SupabaseBoundaryPhaseGate;
  reason: SupabaseBoundaryReason;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  missingKeys: readonly PublicSupabaseEnvKey[];
  clientAvailable: boolean;
  isAuthSessionBoundaryEnabled: false;
}>;

type SupabaseBoundaryBase = Readonly<{
  env: SupabasePublicEnv;
  dependencyReady: true;
  phaseGate: SupabaseBoundaryPhaseGate;
  reason: SupabaseBoundaryReason;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  debugSafeDescriptor: SupabaseBoundaryDebugSafeDescriptor;
  isAuthSessionBoundaryEnabled: false;
}>;

export type InertSupabaseBoundary = SupabaseBoundaryBase &
  Readonly<{
    kind: "inert_supabase_boundary";
    status: "configured" | "missing_public_env";
    clientAvailable: false;
    client: null;
    phaseGate: "inert_client_boundary";
    reason: "missing_env" | "disabled_by_phase_gate";
  }>;

export type RuntimeSupabaseBoundary = SupabaseBoundaryBase &
  Readonly<{
    kind: "runtime_supabase_boundary";
    status: "ready";
    clientAvailable: true;
    client: SupabaseClient;
    phaseGate: "runtime_client_boundary";
    reason: "runtime_client_ready";
  }>;

export type MissingRuntimeSupabaseBoundary = SupabaseBoundaryBase &
  Readonly<{
    kind: "runtime_supabase_boundary";
    status: "missing_public_env";
    clientAvailable: false;
    client: null;
    phaseGate: "runtime_client_boundary";
    reason: "missing_env";
  }>;

export type SupabaseBoundary =
  | InertSupabaseBoundary
  | RuntimeSupabaseBoundary
  | MissingRuntimeSupabaseBoundary;

let runtimeSupabaseClient: SupabaseClient | null = null;

function isSupabaseEnvConfigured(
  env: SupabasePublicEnv,
): env is SupabasePublicEnv &
  Readonly<{
    supabaseUrl: string;
    supabaseAnonKey: string;
    isConfigured: true;
  }> {
  return (
    env.isConfigured &&
    env.supabaseUrl !== null &&
    env.supabaseAnonKey !== null
  );
}

function getInertBoundaryReason(
  env: SupabasePublicEnv,
): InertSupabaseBoundary["reason"] {
  return env.isConfigured ? "disabled_by_phase_gate" : "missing_env";
}

function getRuntimeBoundaryReason(
  env: SupabasePublicEnv,
): RuntimeSupabaseBoundary["reason"] | MissingRuntimeSupabaseBoundary["reason"] {
  return isSupabaseEnvConfigured(env) ? "runtime_client_ready" : "missing_env";
}

function getDebugSafeDescriptor(input: {
  env: SupabasePublicEnv;
  phaseGate: SupabaseBoundaryPhaseGate;
  reason: SupabaseBoundaryReason;
  clientAvailable: boolean;
}): SupabaseBoundaryDebugSafeDescriptor {
  return {
    dependencyReady: true,
    phaseGate: input.phaseGate,
    reason: input.reason,
    urlConfigured: input.env.supabaseUrl !== null,
    anonKeyConfigured: input.env.supabaseAnonKey !== null,
    missingKeys: input.env.missingKeys,
    clientAvailable: input.clientAvailable,
    isAuthSessionBoundaryEnabled: false,
  };
}

function createRuntimeSupabaseClient(
  env: SupabasePublicEnv,
): SupabaseClient | null {
  if (!isSupabaseEnvConfigured(env)) {
    return null;
  }

  if (runtimeSupabaseClient !== null) {
    return runtimeSupabaseClient;
  }

  runtimeSupabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return runtimeSupabaseClient;
}

export function getInertSupabaseBoundary(): InertSupabaseBoundary {
  const env = getSupabasePublicEnv();
  const reason = getInertBoundaryReason(env);
  const debugSafeDescriptor = getDebugSafeDescriptor({
    env,
    phaseGate: "inert_client_boundary",
    reason,
    clientAvailable: false,
  });

  return {
    kind: "inert_supabase_boundary",
    status: env.isConfigured ? "configured" : "missing_public_env",
    env,
    clientAvailable: false,
    client: null,
    dependencyReady: true,
    phaseGate: "inert_client_boundary",
    reason,
    urlConfigured: debugSafeDescriptor.urlConfigured,
    anonKeyConfigured: debugSafeDescriptor.anonKeyConfigured,
    debugSafeDescriptor,
    isAuthSessionBoundaryEnabled: false,
  };
}

export function getRuntimeSupabaseBoundary():
  | RuntimeSupabaseBoundary
  | MissingRuntimeSupabaseBoundary {
  const env = getSupabasePublicEnv();
  const client = createRuntimeSupabaseClient(env);
  const clientAvailable = client !== null;
  const reason = getRuntimeBoundaryReason(env);
  const debugSafeDescriptor = getDebugSafeDescriptor({
    env,
    phaseGate: "runtime_client_boundary",
    reason,
    clientAvailable,
  });

  if (client === null) {
    return {
      kind: "runtime_supabase_boundary",
      status: "missing_public_env",
      env,
      clientAvailable: false,
      client: null,
      dependencyReady: true,
      phaseGate: "runtime_client_boundary",
      reason: "missing_env",
      urlConfigured: debugSafeDescriptor.urlConfigured,
      anonKeyConfigured: debugSafeDescriptor.anonKeyConfigured,
      debugSafeDescriptor,
      isAuthSessionBoundaryEnabled: false,
    };
  }

  return {
    kind: "runtime_supabase_boundary",
    status: "ready",
    env,
    clientAvailable: true,
    client,
    dependencyReady: true,
    phaseGate: "runtime_client_boundary",
    reason: "runtime_client_ready",
    urlConfigured: debugSafeDescriptor.urlConfigured,
    anonKeyConfigured: debugSafeDescriptor.anonKeyConfigured,
    debugSafeDescriptor,
    isAuthSessionBoundaryEnabled: false,
  };
}

export const inertSupabaseBoundary = getInertSupabaseBoundary();
