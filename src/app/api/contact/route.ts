import { after } from 'next/server';

import { handle, inquiryReference, json, noStore, parseBody } from '@/lib/api';
import { recordAudit } from '@/lib/audit';
import { markSessionConverted } from '@/lib/analytics';
import { prisma } from '@/lib/db';
import { mailConfig } from '@/lib/env';
import { acknowledgementTemplate, adminNotificationTemplate, sendMail } from '@/lib/mail';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { geoFromHeaders, ipHash, visitorHash } from '@/lib/request';
import { contactSchema } from '@/lib/validation';
import { INQUIRY_TYPE_LABELS } from '@/content/defaults';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public contact endpoint.
 *
 * Order of operations matters: the inquiry is persisted first, then email is
 * attempted afterwards via `after()`. A dead SMTP server therefore delays
 * nothing and loses nothing - the message is already in the database and
 * visible in the admin portal.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const headers = request.headers;
    const hash = ipHash(headers);

    // Six submissions per hour per network is generous for a human, hostile to a script.
    const limit = await rateLimit({
      key: `contact:${hash}`,
      limit: 6,
      windowSeconds: 3600,
      durable: true,
    });
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const input = await parseBody(request, contactSchema);

    // Spam scoring. Nothing here blocks outright except the honeypot: borderline
    // messages are still stored, just flagged, so a false positive is recoverable.
    let spamScore = 0;
    if (input.website) spamScore += 100;
    if (input.renderedAt && Date.now() - input.renderedAt < 3000) spamScore += 40;
    const linkCount = (input.message.match(/https?:\/\//gi) ?? []).length;
    if (linkCount >= 3) spamScore += 30;
    if (/\b(seo services|crypto|casino|backlinks|viagra)\b/i.test(input.message)) spamScore += 40;

    if (spamScore >= 100) {
      // Honeypot filled: respond as if accepted so bots learn nothing.
      return noStore(json({ ok: true, reference: inquiryReference() }, { status: 201 }));
    }

    const geo = geoFromHeaders(headers);
    const reference = inquiryReference();

    const inquiry = await prisma.contactInquiry.create({
      data: {
        reference,
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone ?? null,
        organization: input.organization ?? null,
        subject: input.subject,
        message: input.message,
        inquiryType: input.inquiryType,
        consentGiven: true,
        status: spamScore >= 60 ? 'SPAM' : 'NEW',
        spamScore,
        sourcePage: input.sourcePage ?? null,
        referrer: headers.get('referer')?.slice(0, 600) ?? null,
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        utmTerm: input.utmTerm ?? null,
        utmContent: input.utmContent ?? null,
        visitorHash: visitorHash(headers),
        countryCode: geo.countryCode,
      },
    });

    // Everything below is best-effort and runs after the response is sent.
    after(async () => {
      await markSessionConverted(request.headers.get('x-analytics-session'));

      await recordAudit({
        action: 'CONTENT_CREATED',
        resourceType: 'ContactInquiry',
        resourceId: inquiry.id,
        summary: `New ${INQUIRY_TYPE_LABELS[inquiry.inquiryType]} inquiry ${reference} received`,
        ipHash: null,
      });

      const emailData = {
        reference,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        organization: inquiry.organization,
        subject: inquiry.subject,
        message: inquiry.message,
        inquiryTypeLabel: INQUIRY_TYPE_LABELS[inquiry.inquiryType],
        sourcePage: inquiry.sourcePage,
        campaign: inquiry.utmCampaign,
        submittedAt: inquiry.createdAt,
      };

      if (mailConfig.notifyTo) {
        const template = adminNotificationTemplate(emailData);
        await sendMail({
          to: mailConfig.notifyTo,
          subject: `[${reference}] ${inquiry.subject}`,
          replyTo: inquiry.email,
          ...template,
        });
      }

      if (mailConfig.sendAcknowledgement && inquiry.status !== 'SPAM') {
        const template = acknowledgementTemplate(emailData);
        await sendMail({
          to: inquiry.email,
          subject: `We received your message (${reference})`,
          ...template,
        });
      }
    });

    return noStore(json({ ok: true, reference }, { status: 201 }));
  });
}
