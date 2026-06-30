export type OwnAuthRouteGateState = Readonly<{
  enabled: boolean;
}>;

export const ownAuthRuntimeEnabledEnvKey = 'OWN_AUTH_RUNTIME_ENABLED';

export function readOwnAuthRouteGate(
  env: NodeJS.ProcessEnv = process.env,
): OwnAuthRouteGateState {
  return {
    enabled: env[ownAuthRuntimeEnabledEnvKey]?.trim().toLowerCase() === 'true',
  };
}
