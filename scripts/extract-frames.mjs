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
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v']);

/**
 * Pulls frames out of a video with ffmpeg.
 *
 * `-t` is applied to the output rather than the input so the duration limit is
 * measured after the fps filter - an input-side seek would land on the nearest
 * keyframe and quietly hand back more or less footage than asked for.
 */
function extractFromVideo({ source, outDir, prefix, extension, seconds, fps, width, quality }) {
  const filters = [`fps=${fps}`];
  if (width) filters.push(`scale=${width}:-2`);

  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', source,
    '-t', String(seconds),
    '-vf', filters.join(','),
    '-c:v', 'libwebp',
    '-quality', String(quality),
    '-compression_level', '5',
    '-preset', 'picture',
    '-an',
    path.join(outDir, `${prefix}%04d${extension}`),
  ];

  execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] });
}

function probe(source) {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate',
    '-show_entries', 'format=duration',
    '-of', 'json', source,
  ]).toString();
  const data = JSON.parse(out);
  const stream = data.streams?.[0] ?? {};
  const [num, den] = String(stream.avg_frame_rate ?? '0/1').split('/').map(Number);
  return {
    width: stream.width ?? 0,
    height: stream.height ?? 0,
    fps: den ? num / den : 0,
    duration: Number(data.format?.duration ?? 0),
  };
}

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
    console.error('Usage: node scripts/extract-frames.mjs <video-or-animated-file> [--duration S] [--fps N] [--width N] [--quality N]');
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

  const isVideo = VIDEO_EXTENSIONS.has(path.extname(source).toLowerCase());

  if (isVideo) {
    const info = probe(source);
    const seconds = Number.parseFloat(flags.duration ?? '5');
    const fps = Number.parseFloat(flags.fps ?? String(Math.min(info.fps || 24, 30)));
    const expected = Math.round(seconds * fps);

    console.log(`Source : ${source}`);
    console.log(`Video  : ${info.width}x${info.height}, ${info.fps.toFixed(2)} fps, ${info.duration.toFixed(2)}s`);
    console.log(`Taking : first ${seconds}s at ${fps} fps -> ~${expected} frames`);

    if (seconds > info.duration) {
      console.warn(`WARNING: asked for ${seconds}s but the clip is only ${info.duration.toFixed(2)}s.`);
    }

    await mkdir(OUT_DIR, { recursive: true });
    const existingVideo = await readdir(OUT_DIR);
    const staleVideo = existingVideo.filter((n) => n.startsWith(PREFIX) && n.endsWith(EXTENSION));
    await Promise.all(staleVideo.map((n) => unlink(path.join(OUT_DIR, n))));
    if (staleVideo.length > 0) console.log(`Cleared: ${staleVideo.length} previous frame(s)`);

    extractFromVideo({
      source, outDir: OUT_DIR, prefix: PREFIX, extension: EXTENSION,
      seconds, fps,
      width: targetWidth,
      quality,
    });

    const written = (await readdir(OUT_DIR)).filter((n) => n.startsWith(PREFIX) && n.endsWith(EXTENSION));
    const videoTotal = written.length
      ? written.reduce((sum, n) => sum + fs.statSync(path.join(OUT_DIR, n)).size, 0) / 1024 / 1024
      : 0;

    console.log(`Written: ${written.length} frames, ${videoTotal.toFixed(1)} MB total`);
    if (written.length !== expected) {
      console.log(`  (expected ~${expected}; ffmpeg rounds on frame boundaries)`);
    }
    if (videoTotal > 12) {
      console.warn('WARNING: over 12 MB. Re-run with a lower --fps or --width.');
    }
    console.log('\nNext: npm run frames');
    return;
  }

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
