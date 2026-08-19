# Hero frame sequence

Drop your exported frames in this folder, then run `npm run frames` from the
project root.

## Naming

Files must end in digits and be numbered consecutively:

    frame-0001.webp
    frame-0002.webp
    frame-0003.webp
    ...

Any prefix, any zero padding and any of `.webp` `.avif` `.jpg` `.png` will work
— the manifest script reads the pattern from the first file. What it cannot
handle is a gap in the numbering, which would freeze the sequence mid-scroll; it
warns if it finds one.

## Sizing

The whole sequence downloads, so total weight is what matters, not any single
frame:

- 90–150 frames is plenty for a smooth scroll
- 1600px wide is enough (the canvas covers, so height is flexible)
- WebP or AVIF at quality ~72, aiming for 40–80 KB per frame
- That lands around 6–10 MB total, loaded progressively after first paint

Avoid PNG here — it is typically 5–10x larger than WebP for photographic frames.

## Not committing these to git

The folder is git-ignored apart from this README, so large binaries stay out of
the repository. Upload them with your deploy, or move them to object storage and
point `NEXT_PUBLIC_FRAMES_BASE_URL` at that bucket.
