export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-[92rem]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>

      <div className="animate-pulse space-y-6">
        <div className="space-y-3 border-b border-ink-800 pb-6">
          <div className="h-8 w-56 rounded bg-ink-800" />
          <div className="h-3 w-96 max-w-full rounded bg-ink-800/70" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-xl2 bg-ink-800/60" />
          ))}
        </div>

        <div className="h-72 rounded-xl2 bg-ink-800/60" />
      </div>
    </div>
  );
}
