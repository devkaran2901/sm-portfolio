/**
 * Explodes an animated image into the numbered still frames the hero sequence
 * needs.
 *
 * Why this exists: an animated WebP or GIF plays on its own timeline and the
 * browser exposes no way to seek it, so it cannot be scrubbed by scroll
 * position. The sequence needs individually addressable stills.
 *
 * Usage:
 *   node scripts/extract-frames.mjs public/frames/output.webp
 *   node scripts/extract-frames.mjs public/frames/output.webp --width 1600 --quality 72
 *
 * The source file is moved out of public/frames afterwards, since leaving it
 * there would ship a megabyte nobody downloads on purpose.
 */
import { mkdir, readdir, rename, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'frames');
const PREFIX = 'frame-';
const EXTENSION = '.webp';

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      flags[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    } else {
      positional.push(argv[i]);
    }
  }
  return { source: positional[0], flags };
}

async function main() {
  const { source, flags } = parseArgs(process.argv.slice(2));

  if (!source) {
    console.error('Usage: node scripts/extract-frames.mjs <animated-file> [--width N] [--quality N]');
    process.exitCode = 1;
    return;
  }
  if (!existsSync(source)) {
    console.error(`Not found: ${source}`);
    process.exitCode = 1;
    return;
  }

  const quality = Number.parseInt(flags.quality ?? '72', 10);
  const targetWidth = flags.width ? Number.parseInt(flags.width, 10) : null;

  const meta = await sharp(source, { animated: true }).metadata();
  const pages = meta.pages ?? 1;

  if (pages < 2) {
    console.error(`${source} has only ${pages} page - it is a still image, not an animation.`);
    console.error('Export a frame sequence, or an animated WebP/GIF, and try again.');
    process.exitCode = 1;
    return;
  }

  console.log(`Source : ${source}`);
  console.log(`Frames : ${pages} at ${meta.width}x${meta.pageHeight}`);

  await mkdir(OUT_DIR, { recursive: true });

  // Clear any previous extraction so a shorter re-export cannot leave stale
  // frames behind, which would show up as a gap or a stutter at the end.
  const existing = await readdir(OUT_DIR);
  const stale = existing.filter((f) => f.startsWith(PREFIX) && f.endsWith(EXTENSION));
  await Promise.all(stale.map((f) => unlink(path.join(OUT_DIR, f))));
  if (stale.length > 0) console.log(`Cleared: ${stale.length} previous frame(s)`);

  const pad = String(pages).length < 4 ? 4 : String(pages).length;
  let bytes = 0;

  for (let page = 0; page < pages; page += 1) {
    let pipeline = sharp(source, { page });
    if (targetWidth && targetWidth !== meta.width) {
      pipeline = pipeline.resize({ width: targetWidth, withoutEnlargement: true });
    }
    const buffer = await pipeline.webp({ quality, effort: 5 }).toBuffer();
    bytes += buffer.length;

    const name = `${PREFIX}${String(page + 1).padStart(pad, '0')}${EXTENSION}`;
    await sharp(buffer).toFile(path.join(OUT_DIR, name));

    if ((page + 1) % 20 === 0 || page === pages - 1) {
      process.stdout.write(`  extracted ${page + 1}/${pages}\r`);
    }
  }
  process.stdout.write('\n');

  // Move the source out of the served folder. libvips can still hold the file
  // open briefly after the last read, which surfaces as EBUSY on Windows, so
  // this retries and then degrades to a note - the frames are already written
  // and losing the tidy-up is not worth failing the run over.
  const resolvedSource = path.resolve(source);
  if (resolvedSource.startsWith(path.resolve(OUT_DIR))) {
    const parked = path.join(process.cwd(), path.basename(source));
    let moved = false;

    for (let attempt = 0; attempt < 5 && !moved; attempt += 1) {
      try {
        await rename(resolvedSource, parked);
        moved = true;
      } catch (error) {
        if (error.code !== 'EBUSY' && error.code !== 'EPERM') throw error;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    console.log(
      moved
        ? `Moved  : source out of public/frames -> ./${path.basename(source)}`
        : `NOTE   : could not move ${path.basename(source)} out of public/frames (file locked). Move it manually so it is not served.`,
    );
  }

  const total = bytes / 1024 / 1024;
  console.log(`Written: ${pages} frames, ${total.toFixed(1)} MB total (${Math.round(bytes / pages / 1024)} KB average)`);
  if (total > 12) {
    console.warn('WARNING: over 12 MB. Re-run with --width 1280 or a lower --quality.');
  }
  console.log('\nNext: npm run frames');
}

main().catch((error) => {
  console.error('Extraction failed:', error.message);
  process.exitCode = 1;
});
