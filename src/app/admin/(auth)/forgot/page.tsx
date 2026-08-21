import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/admin/AuthForms';

export const metadata: Metadata = { title: 'Reset password' };

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="mb-5 text-sm font-sans font-semibold text-bone-100">Reset your password</h2>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-ink-800/60" />}>
        <ForgotPasswordForm />
      </Suspense>
    </>
  );
}
