export type BearerTokenParseResult =
  | {
      ok: true;
      token: string;
    }
  | {
      ok: false;
      code: 'AUTH_REQUIRED' | 'AUTH_HEADER_INVALID';
    };

export function parseBearerToken(
  authorizationHeader: string | undefined,
): BearerTokenParseResult {
  if (authorizationHeader === undefined || authorizationHeader.trim() === '') {
    return {
      ok: false,
      code: 'AUTH_REQUIRED',
    };
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  if (match === null) {
    return {
      ok: false,
      code: 'AUTH_HEADER_INVALID',
    };
  }

  const token = match[1]?.trim();

  if (token === undefined || token.length === 0 || /\s/.test(token)) {
    return {
      ok: false,
      code: 'AUTH_HEADER_INVALID',
    };
  }

  return {
    ok: true,
    token,
  };
}
