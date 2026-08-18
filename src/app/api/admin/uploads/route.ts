import { randomBytes, createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { handle, json, noStore } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { uploadConfig } from '@/lib/env';
import { ipHash } from '@/lib/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Evidence upload.
 *
 * Validation is defence in depth, because a filename and a Content-Type header
 * are both attacker-controlled:
 *   1. the declared MIME type must be on the allow list,
 *   2. the extension must match that MIME type,
 *   3. the leading bytes must match the format's magic number,
 *   4. the stored filename is generated, never derived from the upload.
 *
 * Nothing executable is accepted, and files are written outside any path that
 * the server would ever interpret.
 */

const ALLOWED: Record<string, { extensions: string[]; magic: number[][] }> = {
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], magic: [[0xff, 0xd8, 0xff]] },
  'image/png': { extensions: ['.png'], magic: [[0x89, 0x50, 0x4e, 0x47]] },
  'image/webp': { extensions: ['.webp'], magic: [[0x52, 0x49, 0x46, 0x46]] },
  'application/pdf': { extensions: ['.pdf'], magic: [[0x25, 0x50, 0x44, 0x46]] },
};

function matchesMagic(bytes: Uint8Array, signatures: number[][]): boolean {
  return signatures.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte),
  );
}

export async function POST(request: Request) {
  return handle(async () => {
    const user = await requirePermission('media:write');

    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    const mediaArticleId = form?.get('mediaArticleId');

    if (!(file instanceof File)) {
      return noStore(json({ error: 'No file was received.' }, { status: 400 }));
    }

    if (file.size === 0) {
      return noStore(json({ error: 'That file is empty.' }, { status: 400 }));
    }

    if (file.size > uploadConfig.maxBytes) {
      const limitMb = Math.round(uploadConfig.maxBytes / (1024 * 1024));
      return noStore(json({ error: `Files must be ${limitMb}MB or smaller.` }, { status: 413 }));
    }

    const rule = ALLOWED[file.type];
    if (!rule) {
      return noStore(
        json({ error: 'Only JPEG, PNG, WebP and PDF files can be uploaded.' }, { status: 415 }),
      );
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!rule.extensions.includes(extension)) {
      return noStore(
        json({ error: 'The file extension does not match its type.' }, { status: 415 }),
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesMagic(buffer.subarray(0, 8), rule.magic)) {
      return noStore(
        json({ error: 'That file does not look like the type it claims to be.' }, { status: 415 }),
      );
    }

    // Generated name: no path traversal, no collisions, no attacker-chosen string.
    const storedName = `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}${extension}`;
    const checksum = createHash('sha256').update(buffer).digest('hex');

    if (uploadConfig.driver !== 'local') {
      // Object storage belongs behind this branch in production. Failing loudly
      // is better than silently writing to a container's ephemeral disk.
      return noStore(
        json(
          { error: `Upload driver "${uploadConfig.driver}" is not configured on this deployment.` },
          { status: 501 },
        ),
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, storedName), buffer);

    const fileUrl = `/uploads/${storedName}`;

    let evidenceId: string | null = null;
    if (typeof mediaArticleId === 'string' && mediaArticleId) {
      const evidence = await prisma.mediaEvidence.create({
        data: {
          mediaArticleId,
          fileUrl,
          fileName: file.name.slice(0, 240),
          mimeType: file.type,
          sizeBytes: file.size,
          checksum,
          uploadedById: user.id,
        },
        select: { id: true },
      });
      evidenceId = evidence.id;
    }

    await recordAudit({
      actor: user,
      action: 'MEDIA_UPLOADED',
      resourceType: 'MediaEvidence',
      resourceId: evidenceId ?? storedName,
      summary: `Uploaded ${file.name} (${Math.round(file.size / 1024)}KB)`,
      newValue: { fileUrl, mimeType: file.type, checksum },
      ipHash: ipHash(request.headers),
    });

    return noStore(json({ ok: true, url: fileUrl, evidenceId, checksum }, { status: 201 }));
  });
}
