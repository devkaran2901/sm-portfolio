/**
 * Environment access.
 *
 * Everything here is read lazily so that a missing optional variable never
 * breaks a build. Secrets are only ever read from this module on the server;
 * nothing in here is exported to the client bundle except the values that are
 * already public by definition (NEXT_PUBLIC_*).
 */

function optional(key: string, fallback = ''): string {
  return process.env[key]?.trim() || fallback;
}

function required(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function toInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBool(value: string, fallback: boolean): boolean {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

/** Public origin without a trailing slash. */
export function siteUrl(): string {
  const raw =
    optional('NEXT_PUBLIC_SITE_URL') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

export function authSecret(): Uint8Array {
  const secret = required('AUTH_SECRET');
  if (secret.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export function sessionTtlSeconds(): number {
  return toInt(optional('AUTH_SESSION_TTL'), 60 * 60 * 8);
}

export function analyticsSalt(): string {
  // Falls back to AUTH_SECRET so hashing is never accidentally unsalted.
  return optional('ANALYTICS_IP_SALT') || optional('AUTH_SECRET') || 'insecure-dev-salt';
}

export const analyticsEnabled = toBool(optional('NEXT_PUBLIC_ANALYTICS_ENABLED'), true);

export const mailConfig = {
  get host() {
    return optional('SMTP_HOST');
  },
  get port() {
    return toInt(optional('SMTP_PORT'), 587);
  },
  get secure() {
    return toBool(optional('SMTP_SECURE'), false);
  },
  get user() {
    return optional('SMTP_USER');
  },
  get password() {
    return optional('SMTP_PASSWORD');
  },
  get from() {
    return optional('MAIL_FROM', 'no-reply@localhost');
  },
  get notifyTo() {
    return optional('INQUIRY_NOTIFY_TO');
  },
  get sendAcknowledgement() {
    return toBool(optional('INQUIRY_SEND_ACK'), true);
  },
  get isConfigured() {
    return Boolean(optional('SMTP_HOST') && optional('INQUIRY_NOTIFY_TO'));
  },
};

export const uploadConfig = {
  get driver() {
    return optional('UPLOAD_DRIVER', 'local');
  },
  get maxBytes() {
    return toInt(optional('UPLOAD_MAX_BYTES'), 10 * 1024 * 1024);
  },
};

export const seedAdmin = {
  get email() {
    return optional('SEED_ADMIN_EMAIL');
  },
  get password() {
    return optional('SEED_ADMIN_PASSWORD');
  },
  get name() {
    return optional('SEED_ADMIN_NAME', 'Site Administrator');
  },
};

export const hasDatabaseUrl = () => Boolean(optional('DATABASE_URL'));
