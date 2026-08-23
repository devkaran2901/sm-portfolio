import type { SVGProps } from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * The four brand marks the footer draws.
 *
 * They are hand-written rather than imported: lucide dropped its brand icons at
 * v1, and pulling in a second icon package to get four glyphs would cost more
 * than the glyphs do. Each one is a single path on a 24-unit grid, inherits
 * `currentColor`, and is drawn `aria-hidden` because the link around it already
 * carries the platform name.
 */
type MarkProps = SVGProps<SVGSVGElement>;

function Frame({ children, ...props }: MarkProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

function Instagram(props: MarkProps) {
  return (
    <Frame {...props} fill="none" stroke="currentColor" strokeWidth={1.7}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.2" cy="6.8" r="1.05" fill="currentColor" stroke="none" />
    </Frame>
  );
}

function Facebook(props: MarkProps) {
  return (
    <Frame {...props} fill="currentColor">
      <path d="M13.9 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.45-.13-2.42 0-4.08 1.48-4.08 4.2V9.9H7.75V13h2.72v8h3.43Z" />
    </Frame>
  );
}

function Linkedin(props: MarkProps) {
  return (
    <Frame {...props} fill="currentColor">
      <path d="M6.94 20.5H4.06V9.06h2.88V20.5ZM5.5 7.79A1.72 1.72 0 1 1 5.5 4.35a1.72 1.72 0 0 1 0 3.44ZM20.5 20.5h-2.87v-5.57c0-1.33-.03-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.93V20.5H10.8V9.06h2.75v1.56h.04c.38-.72 1.32-1.48 2.72-1.48 2.9 0 3.44 1.91 3.44 4.4V20.5Z" />
    </Frame>
  );
}

function Youtube(props: MarkProps) {
  return (
    <Frame {...props} fill="currentColor">
      <path d="M21.6 7.55a2.5 2.5 0 0 0-1.76-1.77C18.28 5.35 12 5.35 12 5.35s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.55C2 9.12 2 12 2 12s0 2.88.4 4.45a2.5 2.5 0 0 0 1.76 1.77c1.56.43 7.84.43 7.84.43s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 14.88 22 12 22 12s0-2.88-.4-4.45ZM10.05 15V9l5.2 3-5.2 3Z" />
    </Frame>
  );
}

const MARKS: Record<string, (props: MarkProps) => React.ReactElement> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
};

/**
 * Draws the mark for a platform, matched case-insensitively on the label the
 * profile record carries. An unrecognised platform falls back to the outward
 * arrow, so adding a network from the admin portal never leaves a blank circle.
 */
export function SocialMark({ label, ...props }: MarkProps & { label: string }) {
  const Mark = MARKS[label.trim().toLowerCase()];
  if (Mark) return <Mark {...props} />;
  return <ArrowUpRight size={16} aria-hidden="true" {...props} />;
}
