import { createClient } from '@supabase/supabase-js';

import {
  BackendConfigurationError,
  readSupabaseServerEnv,
} from '../config/env';

export type ProfileFoundation = {
  profileReady: boolean;
  anonymousIdentityReady: boolean;
};

export type ProfileFoundationReadResult =
  | {
      ok: true;
      profileFoundation: ProfileFoundation;
    }
  | {
      ok: false;
      code:
        | 'AUTH_TOKEN_INVALID'
        | 'BACKEND_CONFIGURATION_REQUIRED'
        | 'PROFILE_FOUNDATION_READ_FAILED';
    };

function createSupabaseServerClient() {
  const env = readSupabaseServerEnv();

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function readProfileFoundationForAccessToken(
  accessToken: string,
): Promise<ProfileFoundationReadResult> {
  let client: ReturnType<typeof createSupabaseServerClient>;

  try {
    client = createSupabaseServerClient();
  } catch (error) {
    if (error instanceof BackendConfigurationError) {
      return {
        ok: false,
        code: 'BACKEND_CONFIGURATION_REQUIRED',
      };
    }

    return {
      ok: false,
      code: 'PROFILE_FOUNDATION_READ_FAILED',
    };
  }

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser(accessToken);

  if (authError !== null || user === null) {
    return {
      ok: false,
      code: 'AUTH_TOKEN_INVALID',
    };
  }

  const profileResult = await client
    .from('profiles_private')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('owner_user_id', user.id)
    .is('deleted_at', null);

  if (profileResult.error !== null) {
    return {
      ok: false,
      code: 'PROFILE_FOUNDATION_READ_FAILED',
    };
  }

  const anonymousIdentityResult = await client
    .from('anonymous_identities')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('owner_user_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null);

  if (anonymousIdentityResult.error !== null) {
    return {
      ok: false,
      code: 'PROFILE_FOUNDATION_READ_FAILED',
    };
  }

  return {
    ok: true,
    profileFoundation: {
      profileReady: (profileResult.count ?? 0) > 0,
      anonymousIdentityReady: (anonymousIdentityResult.count ?? 0) > 0,
    },
  };
}
