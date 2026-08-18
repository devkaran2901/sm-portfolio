import { Suspense } from 'react';
import type { Metadata } from 'next';

import { LoginForm } from '@/components/admin/AuthForms';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-ink-800/60" />}>
      <LoginForm />
    </Suspense>
  );
}
