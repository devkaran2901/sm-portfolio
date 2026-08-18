import { handle, json, noStore, parseBody } from '@/lib/api';
import { ingestEvent } from '@/lib/analytics';
import { rateLimit } from '@/lib/rate-limit';
import { ipHash } from '@/lib/request';
import { analyticsEventSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Analytics ingestion endpoint.
 *
 * Always answers 202 quickly, even when an event is dropped: the browser has
 * nothing useful to do with a failure, and a beacon cannot read the response
 * anyway. Rejections are counted server-side, never surfaced as client errors.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const hash = ipHash(request.headers);

    // A busy reader might fire a few dozen events an hour; a script fires thousands.
    const limit = await rateLimit({ key: `analytics:${hash}`, limit: 240, windowSeconds: 3600 });
    if (!limit.ok) return noStore(json({ ok: false }, { status: 202 }));

    const input = await parseBody(request, analyticsEventSchema);
    const result = await ingestEvent(input, request.headers);

    return noStore(
      json({ ok: result.accepted, sessionKey: result.sessionKey }, { status: 202 }),
    );
  });
}
