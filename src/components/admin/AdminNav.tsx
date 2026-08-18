'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarRange,
  ChartNoAxesCombined,
  FileText,
  Inbox,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { PermissionKey } from '@/lib/permissions';
import { cn, initials } from '@/lib/utils';

export type AdminIdentity = {
  name: string;
  email: string;
  roleLabel: string;
  permissions: PermissionKey[];
};

type NavItem = { href: string; label: string; icon: LucideIcon; permission: PermissionKey };
type NavGroup = { heading: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
      { href: '/admin/analytics', label: 'Analytics', icon: ChartNoAxesCombined, permission: 'analytics:read' },
      { href: '/admin/inquiries', label: 'Inquiries', icon: Inbox, permission: 'inquiry:read' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { href: '/admin/profile', label: 'Profile', icon: UserRound, permission: 'content:read' },
      { href: '/admin/content/timeline', label: 'Cricket Journey', icon: ListTree, permission: 'content:read' },
      { href: '/admin/content/facilities', label: 'Red Ball', icon: Trophy, permission: 'content:read' },
      { href: '/admin/content/events', label: 'Events', icon: CalendarRange, permission: 'content:read' },
      { href: '/admin/content/players', label: 'Players', icon: Users, permission: 'content:read' },
      { href: '/admin/content/ventures', label: 'Ventures', icon: Building2, permission: 'content:read' },
      { href: '/admin/content/stats', label: 'Statistics', icon: Sparkles, permission: 'content:read' },
      { href: '/admin/content/faqs', label: 'FAQ', icon: MessageCircleQuestion, permission: 'content:read' },
    ],
  },
  {
    heading: 'Evidence',
    items: [
      { href: '/admin/media', label: 'Media & Press', icon: FileText, permission: 'media:read' },
      { href: '/admin/verification', label: 'Verification', icon: BadgeCheck, permission: 'media:read' },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/admin/seo', label: 'SEO', icon: Search, permission: 'content:read' },
      { href: '/admin/users', label: 'Users & Roles', icon: ShieldCheck, permission: 'user:read' },
      { href: '/admin/audit', label: 'Audit Logs', icon: Activity, permission: 'audit:read' },
      { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'content:read' },
    ],
  },
];

/**
 * Admin sidebar.
 *
 * Items are filtered by the signed-in role's permissions, so an Analytics
 * Viewer never sees a link they would be refused at. That is a usability
 * measure, not a security one - the API enforces the same permissions again.
 */
export function AdminNav({ identity }: { identity: AdminIdentity }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const allowed = new Set(identity.permissions);

  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.permission)),
  })).filter((group) => group.items.length > 0);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const signOut = async () => {
    setSigningOut(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="admin-sidebar"
        className="fixed left-4 top-3.5 z-50 grid h-9 w-9 place-items-center rounded-lg border border-ink-600 bg-ink-900 text-bone-100 lg:hidden"
      >
        {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
        <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
      </button>

      {open ? (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink-950/70 lg:hidden"
        />
      ) : null}

      <aside
        id="admin-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[17rem] flex-col border-r border-ink-800 bg-ink-900 transition-transform duration-300 ease-editorial lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-ink-800 px-5">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-turf-600 font-display text-sm font-semibold text-bone-50"
          >
            SM
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-bone-50">Admin Portal</p>
            <p className="truncate text-[0.6875rem] uppercase tracking-[0.12em] text-bone-500">
              Sonu Malik
            </p>
          </div>
        </div>

        <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.heading} className="mb-6 last:mb-0">
              <p className="px-2.5 pb-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-bone-600">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-ink-800 font-medium text-bone-50'
                          : 'text-bone-400 hover:bg-ink-800/60 hover:text-bone-100',
                      )}
                    >
                      <item.icon size={16} aria-hidden="true" className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-ink-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2.5 py-2">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-700 text-xs font-semibold text-bone-100"
            >
              {initials(identity.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-bone-100">{identity.name}</p>
              <p className="truncate text-[0.6875rem] text-bone-500">{identity.roleLabel}</p>
            </div>
          </div>

          <div className="mt-1 flex gap-1">
            <Link
              href="/admin/account"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg px-2.5 py-2 text-xs text-bone-400 transition-colors hover:bg-ink-800/60 hover:text-bone-100"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-bone-400 transition-colors hover:bg-ink-800/60 hover:text-danger-400 disabled:opacity-60"
            >
              <LogOut size={13} aria-hidden="true" />
              {signingOut ? 'Signing out' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
