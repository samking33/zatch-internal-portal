import { normalizeSessionUser, type AdminSessionUser } from './admin-api';

const DEFAULT_DEVELOPMENT_SECRET = 'zatch-web-dev-session-secret-change-me';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let signingKeyPromise: Promise<CryptoKey> | null = null;

const getSessionSecret = (): string => {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.SESSION_SECRET;

  if (secret && secret.trim().length > 0) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET or SESSION_SECRET must be configured in production');
  }

  return DEFAULT_DEVELOPMENT_SECRET;
};

const getSubtleCrypto = (): SubtleCrypto => {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    throw new Error('Web Crypto is not available');
  }

  return subtle;
};

const getSigningKey = async (): Promise<CryptoKey> => {
  if (!signingKeyPromise) {
    signingKeyPromise = getSubtleCrypto().importKey(
      'raw',
      encoder.encode(getSessionSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    );
  }

  return signingKeyPromise;
};

const encodeBase64Url = (value: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64url');
  }

  let binary = '';
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const decodeBase64Url = (value: string): Uint8Array => {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64url'));
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const toArrayBuffer = (value: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(value.byteLength);
  new Uint8Array(buffer).set(value);
  return buffer;
};

export const serializeSessionUserCookie = async (value: unknown): Promise<string> => {
  const normalizedUser = normalizeSessionUser(value);
  const payload = encodeBase64Url(encoder.encode(JSON.stringify(normalizedUser)));
  const signature = await getSubtleCrypto().sign('HMAC', await getSigningKey(), encoder.encode(payload));

  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
};

export const parseSessionUserCookie = async (
  value: string | undefined,
): Promise<AdminSessionUser | null> => {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split('.');

  if (!payload || !signature) {
    return null;
  }

  try {
    const verified = await getSubtleCrypto().verify(
      'HMAC',
      await getSigningKey(),
      toArrayBuffer(decodeBase64Url(signature)),
      encoder.encode(payload),
    );

    if (!verified) {
      return null;
    }

    return normalizeSessionUser(JSON.parse(decoder.decode(decodeBase64Url(payload))));
  } catch {
    return null;
  }
};
