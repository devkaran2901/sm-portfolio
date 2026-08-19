import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { Breadcrumb } from '@/lib/seo';

/**
 * Interior page opener with breadcrumbs.
 *
 * The breadcrumb trail is a real <nav> with an ordered list, matching the
 * BreadcrumbList JSON-LD emitted alongside it.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <div className="grain relative overflow-hidden border-b border-ink-800">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_85%_-20%,rgba(255,255,255,0.5),transparent_60%)]"
      />

      <div className="shell relative py-16 sm:py-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-bone-500">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <ChevronRight size={12} aria-hidden="true" className="text-ink-500" />
                  ) : null}
                  {isLast ? (
                    <span aria-current="page" className="text-bone-300">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={crumb.path} className="transition-colors hover:text-bone-200">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <p className="eyebrow mt-8">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-display-lg text-bone-50">{title}</h1>
        {lead ? (
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-bone-300">{lead}</p>
        ) : null}
      </div>
    </div>
  );
}
