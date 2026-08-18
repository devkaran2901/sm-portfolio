/**
 * Route-level loading skeleton for the public site.
 *
 * Mirrors the interior page rhythm (breadcrumb, eyebrow, headline, body) so the
 * layout does not jump when the real content arrives.
 */
export default function SiteLoading() {
  return (
    <div className="shell py-20" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>

      <div className="animate-pulse space-y-6">
        <div className="h-3 w-32 rounded bg-ink-800" />
        <div className="h-3 w-24 rounded bg-ink-800" />
        <div className="h-14 w-full max-w-2xl rounded bg-ink-800" />
        <div className="h-4 w-full max-w-xl rounded bg-ink-800/70" />
        <div className="h-4 w-4/5 max-w-lg rounded bg-ink-800/70" />

        <div className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-52 rounded-xl2 bg-ink-800/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
