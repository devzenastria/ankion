import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

export type OwnPasswordHash = string;

export const ownPasswordHashAlgorithm = 'scrypt';
export const ownPasswordHashVersion = 'ankion-scrypt-v1';

const saltByteLength = 32;
const derivedKeyByteLength = 64;
const scryptCost = 16_384;
const scryptBlockSize = 8;
const scryptParallelization = 1;
const scryptMaxMemory = 64 * 1024 * 1024;

type ParsedOwnPasswordHash = {
  version: string;
  cost: number;
  blockSize: number;
  parallelization: number;
  salt: Buffer;
  derivedKey: Buffer;
};

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      derivedKeyByteLength,
      {
        N: scryptCost,
        maxmem: scryptMaxMemory,
        p: scryptParallelization,
        r: scryptBlockSize,
      },
      (error, derivedKey) => {
        if (error !== null) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

function encodeOwnPasswordHash(input: ParsedOwnPasswordHash): OwnPasswordHash {
  return [
    input.version,
    input.cost,
    input.blockSize,
    input.parallelization,
    input.salt.toString('base64url'),
    input.derivedKey.toString('base64url'),
  ].join('$');
}

function parsePositiveInteger(input: string | undefined): number | null {
  if (input === undefined || !/^[1-9][0-9]*$/.test(input)) {
    return null;
  }

  const value = Number(input);

  return Number.isSafeInteger(value) ? value : null;
}

function parseBase64UrlBuffer(input: string | undefined): Buffer | null {
  if (input === undefined || input.length === 0) {
    return null;
  }

  try {
    return Buffer.from(input, 'base64url');
  } catch {
    return null;
  }
}

function parseOwnPasswordHash(storedHash: string): ParsedOwnPasswordHash | null {
  const parts = storedHash.split('$');

  if (parts.length !== 6) {
    return null;
  }

  const [version, costInput, blockSizeInput, parallelizationInput, saltInput, hashInput] =
    parts;

  if (version !== ownPasswordHashVersion) {
    return null;
  }

  const cost = parsePositiveInteger(costInput);
  const blockSize = parsePositiveInteger(blockSizeInput);
  const parallelization = parsePositiveInteger(parallelizationInput);
  const salt = parseBase64UrlBuffer(saltInput);
  const derivedKey = parseBase64UrlBuffer(hashInput);

  if (
    cost !== scryptCost ||
    blockSize !== scryptBlockSize ||
    parallelization !== scryptParallelization ||
    salt === null ||
    salt.length !== saltByteLength ||
    derivedKey === null ||
    derivedKey.length !== derivedKeyByteLength
  ) {
    return null;
  }

  return {
    version,
    cost,
    blockSize,
    parallelization,
    salt,
    derivedKey,
  };
}

export async function createOwnPasswordHash(
  password: string,
): Promise<OwnPasswordHash> {
  const salt = randomBytes(saltByteLength);
  const derivedKey = await derivePasswordKey(password, salt);

  return encodeOwnPasswordHash({
    version: ownPasswordHashVersion,
    cost: scryptCost,
    blockSize: scryptBlockSize,
    parallelization: scryptParallelization,
    salt,
    derivedKey,
  });
}

export async function verifyOwnPasswordHash(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parsedHash = parseOwnPasswordHash(storedHash);

  if (parsedHash === null) {
    return false;
  }

  const candidateKey = await derivePasswordKey(password, parsedHash.salt);

  if (candidateKey.length !== parsedHash.derivedKey.length) {
    return false;
  }

  return timingSafeEqual(candidateKey, parsedHash.derivedKey);
}
