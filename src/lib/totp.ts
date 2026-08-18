import 'server-only';

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * TOTP (RFC 6238) for optional admin two-factor authentication.
 *
 * Implemented directly rather than pulled in as a dependency: it is ~50 lines of
 * well-specified arithmetic, and this keeps a security-critical path auditable
 * with no supply chain attached.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const DIGITS = 6;
const PERIOD_SECONDS = 30;
/** Accept the neighbouring steps so a slightly skewed clock still works. */
const WINDOW = 1;

export function generateTotpSecret(): string {
  const buffer = randomBytes(20);
  let bits = '';
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');

  let secret = '';
  for (let index = 0; index + 5 <= bits.length; index += 5) {
    secret += BASE32_ALPHABET[Number.parseInt(bits.slice(index, index + 5), 2)];
  }
  return secret;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = '';

  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) throw new Error('Invalid base32 character in TOTP secret.');
    bits += value.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateCode(secret: string, counter: number): string {
  const key = base32Decode(secret);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac('sha1', key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);

  return (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

export function verifyTotp(secret: string, token: string, atMs = Date.now()): boolean {
  const candidate = token.replace(/\s/g, '');
  if (!/^\d{6}$/.test(candidate)) return false;

  const counter = Math.floor(atMs / 1000 / PERIOD_SECONDS);

  for (let drift = -WINDOW; drift <= WINDOW; drift += 1) {
    let expected: string;
    try {
      expected = generateCode(secret, counter + drift);
    } catch {
      return false;
    }
    // Constant-time comparison: both operands are always 6 ASCII digits.
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(candidate))) return true;
  }
  return false;
}

/** otpauth:// URI for enrolling the secret in an authenticator app. */
export function totpEnrollmentUri(secret: string, accountEmail: string, issuer = 'Sonu Malik Admin') {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
