import 'server-only';

import { ZodError, type ZodType } from 'zod';
import { Prisma } from '@prisma/client';

import { AuthorizationError } from './auth';
import { fieldErrors } from './validation';
import { isProduction } from './env';

/**
 * Route-handler plumbing.
 *
 * One rule drives the error mapping below: a client learns what it needs to fix
 * its own request and nothing more. Stack traces, SQL, Prisma error text and
 * internal identifiers stay in the server log.
 */

export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function noStore(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function badRequest(message: string, fields?: Record<string, string>): never {
  throw new ApiError(message, 400, fields);
}

export function notFound(message = 'Not found.'): never {
  throw new ApiError(message, 404);
}

/**
 * Wraps a handler so every failure path returns a consistent JSON envelope.
 */
export function handle(fn: () => Promise<Response>): Promise<Response> {
  return fn().catch((error: unknown) => {
    if (error instanceof AuthorizationError) {
      return noStore(json({ error: error.message }, { status: error.status }));
    }

    if (error instanceof ApiError) {
      return noStore(
        json({ error: error.message, fields: error.fields }, { status: error.status }),
      );
    }

    if (error instanceof ZodError) {
      return noStore(
        json(
          { error: 'Some fields need attention.', fields: fieldErrors(error) },
          { status: 422 },
        ),
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 unique violation is the one case worth naming to the client.
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[] | undefined)?.join(', ') ?? 'value';
        return noStore(
          json({ error: `That ${target} is already in use.` }, { status: 409 }),
        );
      }
      if (error.code === 'P2025') {
        return noStore(json({ error: 'Record not found.' }, { status: 404 }));
      }
      console.error('[api] prisma error:', error.code, error.message);
      return noStore(json({ error: 'The request could not be completed.' }, { status: 400 }));
    }

    console.error('[api] unhandled error:', error);
    return noStore(
      json(
        {
          error: 'Something went wrong on our side. Please try again.',
          ...(isProduction ? {} : { detail: (error as Error).message }),
        },
        { status: 500 },
      ),
    );
  });
}

/** Parses and validates a JSON body. Rejects anything that is not an object. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    badRequest('Expected a JSON body.');
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    badRequest('Expected a JSON object.');
  }

  return schema.parse(raw);
}

/** Reads and clamps pagination parameters. */
export function readPagination(url: URL, defaultSize = 25, maxSize = 100) {
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const requested = Number.parseInt(url.searchParams.get('pageSize') ?? '', 10);
  const pageSize = Math.min(maxSize, Math.max(1, Number.isFinite(requested) ? requested : defaultSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** Short, human-friendly inquiry reference, e.g. SM-7K3F2Q. */
export function inquiryReference(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let out = '';
  for (let index = 0; index < 6; index += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SM-${out}`;
}
