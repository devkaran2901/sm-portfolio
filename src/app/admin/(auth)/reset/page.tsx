import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ResetPasswordForm } from '@/components/admin/AuthForms';

export const metadata: Metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
  return (
    <>
      <h2 className="mb-5 text-sm font-semibold text-bone-100">Choose a new password</h2>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-ink-800/60" />}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
