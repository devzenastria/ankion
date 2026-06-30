import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export type OwnRefreshToken = string;
export type OwnRefreshTokenHash = string;

export const ownRefreshTokenHashVersion = 'ankion-refresh-sha256-v1';

const refreshTokenByteLength = 32;
const refreshTokenHashByteLength = 32;

function encodeRefreshTokenHash(hash: Buffer): OwnRefreshTokenHash {
  return `${ownRefreshTokenHashVersion}$${hash.toString('base64url')}`;
}

function parseRefreshTokenHash(tokenHash: string): Buffer | null {
  const parts = tokenHash.split('$');

  if (parts.length !== 2) {
    return null;
  }

  const [version, encodedHash] = parts;

  if (
    version !== ownRefreshTokenHashVersion ||
    encodedHash === undefined ||
    encodedHash.length === 0
  ) {
    return null;
  }

  try {
    const hash = Buffer.from(encodedHash, 'base64url');

    return hash.length === refreshTokenHashByteLength ? hash : null;
  } catch {
    return null;
  }
}

export function hashOwnRefreshToken(token: string): OwnRefreshTokenHash {
  const hash = createHash('sha256').update(token, 'utf8').digest();

  return encodeRefreshTokenHash(hash);
}

export function createOwnRefreshToken(): {
  token: OwnRefreshToken;
  tokenHash: OwnRefreshTokenHash;
} {
  const token = randomBytes(refreshTokenByteLength).toString('base64url');

  return {
    token,
    tokenHash: hashOwnRefreshToken(token),
  };
}

export function verifyOwnRefreshToken(
  token: string,
  tokenHash: string,
): boolean {
  const expectedHash = parseRefreshTokenHash(tokenHash);

  if (expectedHash === null) {
    return false;
  }

  const candidateHash = parseRefreshTokenHash(hashOwnRefreshToken(token));

  if (candidateHash === null || candidateHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(candidateHash, expectedHash);
}
