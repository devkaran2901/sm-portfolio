import { AnalyticsProvider } from '@/components/site/AnalyticsProvider';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { JsonLd } from '@/components/ui/JsonLd';
import { getBusinesses, getProfile } from '@/lib/content';
import { analyticsEnabled } from '@/lib/env';
import { personSchema, websiteSchema } from '@/lib/schema-org';

/**
 * Public site shell.
 *
 * Person and WebSite JSON-LD live here so the primary entity is declared on
 * every public page, which is what search and generative engines resolve
 * "Sonu Malik" against.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, businesses] = await Promise.all([getProfile(), getBusinesses()]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main" className="flex-1 pt-[4.5rem]">
        {children}
      </main>

      <SiteFooter profile={profile} businesses={businesses} />

      <JsonLd data={[personSchema(profile), websiteSchema()]} />
      <AnalyticsProvider enabled={analyticsEnabled} />
    </div>
  );
}
