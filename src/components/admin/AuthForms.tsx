'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Form';

/**
 * Admin authentication forms.
 *
 * Error messages are intentionally uninformative about which part failed: the
 * server returns one generic string for a bad email or a bad password, and the
 * UI shows exactly that rather than trying to be helpful.
 */

function useSubmit<T extends Record<string, unknown>>(
  url: string,
  method: 'POST' | 'PUT',
  onSuccess: (data: Record<string, unknown>) => void,
) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const submit = async (payload: T) => {
    setPending(true);
    setError(null);
    setFields({});

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

      if (!response.ok) {
        setError((data.error as string) ?? 'Something went wrong. Please try again.');
        setFields((data.fields as Record<string, string>) ?? {});
        return { ok: false, data };
      }

      onSuccess(data);
      return { ok: true, data };
    } catch {
      setError('Network error. Please check your connection and try again.');
      return { ok: false, data: {} };
    } finally {
      setPending(false);
    }
  };

  return { submit, pending, error, fields, setError };
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger-500/50 bg-danger-600/10 px-4 py-3 text-sm text-danger-400"
    >
      {message}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [totpRequired, setTotpRequired] = useState(false);

  const { submit, pending, error, fields } = useSubmit<{
    email: string;
    password: string;
    totp?: string;
  }>('/api/auth/login', 'POST', (data) => {
    // A seeded or reset account must set its own password before doing anything.
    const destination = data.mustChangePassword
      ? '/admin/account'
      : next && next.startsWith('/admin')
        ? next
        : '/admin';
    router.replace(destination);
    router.refresh();
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await submit({ email, password, totp: totp || undefined });
    if (!result.ok && (result.data as { totpRequired?: boolean }).totpRequired) {
      setTotpRequired(true);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <ErrorBanner message={error} />

      <Field id="login-email" label="Email" required error={fields.email}>
        <TextInput
          id="login-email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          value={email}
          error={fields.email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field id="login-password" label="Password" required error={fields.password}>
        <TextInput
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          error={fields.password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      {totpRequired ? (
        <Field
          id="login-totp"
          label="Authenticator code"
          required
          hint="Six digits from your authenticator app."
        >
          <TextInput
            id="login-totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={totp}
            onChange={(event) => setTotp(event.target.value.replace(/\D/g, ''))}
          />
        </Field>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            Signing in
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      <p className="text-center text-sm">
        <Link href="/admin/forgot" className="text-bone-400 hover:text-brass-200">
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { submit, pending, error, fields } = useSubmit<{ email: string }>(
    '/api/auth/password-reset',
    'POST',
    () => setSent(true),
  );

  if (sent) {
    return (
      <div className="rounded-xl2 border border-turf-600/50 bg-turf-900/25 p-6 text-center">
        <p className="text-sm text-bone-200">
          If that address belongs to an admin account, a reset link is on its way. It expires in 60
          minutes.
        </p>
        <Link
          href="/admin/login"
          className="mt-5 inline-block text-sm font-semibold text-brass-200 hover:text-brass-100"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit({ email });
      }}
      noValidate
      className="space-y-5"
    >
      <ErrorBanner message={error} />

      <Field id="forgot-email" label="Email" required error={fields.email}>
        <TextInput
          id="forgot-email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          value={email}
          error={fields.email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? 'Sending' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm">
        <Link href="/admin/login" className="text-bone-400 hover:text-brass-200">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState<string | null>(null);

  const { submit, pending, error, fields } = useSubmit<{ token: string; password: string }>(
    '/api/auth/password-reset',
    'PUT',
    () => router.replace('/admin/login?reset=1'),
  );

  if (!token) {
    return (
      <div className="rounded-xl2 border border-danger-500/40 bg-danger-600/10 p-6 text-center">
        <p className="text-sm text-danger-400">
          This reset link is incomplete. Request a new one from the sign-in page.
        </p>
        <Link
          href="/admin/forgot"
          className="mt-5 inline-block text-sm font-semibold text-brass-200 hover:text-brass-100"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (password !== confirm) {
          setMismatch('Both passwords must match.');
          return;
        }
        setMismatch(null);
        void submit({ token, password });
      }}
      noValidate
      className="space-y-5"
    >
      <ErrorBanner message={error ?? mismatch} />

      <Field
        id="reset-password"
        label="New password"
        required
        error={fields.password}
        hint="At least 12 characters, with upper case, lower case and a number."
      >
        <TextInput
          id="reset-password"
          type="password"
          autoComplete="new-password"
          required
          autoFocus
          value={password}
          error={fields.password}
          hint="At least 12 characters, with upper case, lower case and a number."
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <Field id="reset-confirm" label="Confirm new password" required>
        <TextInput
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? 'Saving' : 'Set new password'}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { submit, pending, error, fields } = useSubmit<{
    currentPassword: string;
    newPassword: string;
  }>('/api/auth/change-password', 'POST', () => {
    setDone(true);
    // The change revoked every session, this one included.
    setTimeout(() => {
      router.replace('/admin/login');
      router.refresh();
    }, 2200);
  });

  if (done) {
    return (
      <div className="rounded-xl2 border border-turf-600/50 bg-turf-900/25 p-6">
        <p className="text-sm text-bone-200">
          Password updated. All sessions were signed out, so you will be asked to sign in again in a
          moment.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (newPassword !== confirm) {
          setMismatch('Both passwords must match.');
          return;
        }
        setMismatch(null);
        void submit({ currentPassword, newPassword });
      }}
      noValidate
      className="max-w-md space-y-5"
    >
      <ErrorBanner message={error ?? mismatch} />

      <Field id="current-password" label="Current password" required error={fields.currentPassword}>
        <TextInput
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          error={fields.currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </Field>

      <Field
        id="new-password"
        label="New password"
        required
        error={fields.newPassword}
        hint="At least 12 characters, with upper case, lower case and a number."
      >
        <TextInput
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          value={newPassword}
          error={fields.newPassword}
          hint="At least 12 characters, with upper case, lower case and a number."
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </Field>

      <Field id="confirm-password" label="Confirm new password" required>
        <TextInput
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving' : 'Update password'}
      </Button>
    </form>
  );
}
