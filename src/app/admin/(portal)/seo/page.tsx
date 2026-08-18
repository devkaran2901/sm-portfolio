import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SeoEditor } from '@/components/admin/SeoEditor';
import { AdminPage, Panel } from '@/components/admin/Ui';
import { can, getSessionUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'SEO' };
export const dynamic = 'force-dynamic';

export default async function SeoPage() {
  const user = await getSessionUser();
  if (!can(user, 'content:read')) redirect('/admin');

  return (
    <AdminPage
      title="SEO"
      description="Titles, descriptions and indexing rules per page. Structured data is generated from the content itself, so it always matches what is visible."
    >
      <div className="space-y-5">
        <Panel title="What is generated automatically">
          <ul className="grid gap-2 text-sm text-bone-300 sm:grid-cols-2">
            {[
              'Canonical URLs, Open Graph and Twitter card tags on every page',
              'Person and WebSite JSON-LD on every public page',
              'SportsActivityLocation JSON-LD for Red Ball Cricket Ground',
              'Organization JSON-LD for each published business',
              'FAQPage JSON-LD from the FAQ collection',
              'BreadcrumbList JSON-LD on interior pages',
              'sitemap.xml, excluding anything marked no-index',
              'robots.txt, with AI crawlers allowed on public pages only',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turf-400"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-bone-500">
            Structured data only ever asserts what appears on the page. Fields with no known value
            are omitted rather than filled in, which is why some schema properties stay empty.
          </p>
        </Panel>

        <SeoEditor canWrite={can(user, 'seo:write')} />
      </div>
    </AdminPage>
  );
}
