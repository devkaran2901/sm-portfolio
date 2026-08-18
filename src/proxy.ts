import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth-edge';

/**
 * Edge gate for the admin area (Next 16 proxy convention).
 *
 * This is the cheap first check: it verifies the session JWT signature and
 * expiry without touching the database, and bounces anonymous requests before
 * they reach a page. It is NOT the authorisation boundary - revocation,
 * deactivation and permission checks all happen server-side in
 * `getSessionUser`/`requirePermission`, because a token that is cryptographically
 * valid can still belong to a session that was revoked a second ago.
 */
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Public entry points inside the admin area.
  const isPublicAdminRoute =
    pathname === '/admin/login' || pathname === '/admin/forgot' || pathname === '/admin/reset';

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith('/admin') && !isPublicAdminRoute && !claims) {
    const loginUrl = new URL('/admin/login', request.url);
    // Preserve where they were heading so login can return them there.
    if (pathname !== '/admin') loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // A signed-in admin has no reason to see the login form.
  if (isPublicAdminRoute && claims && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (pathname.startsWith('/api/admin') && !claims) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const response = NextResponse.next();
  // Belt and braces: the admin area must never be indexed or cached.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
