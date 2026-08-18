'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Select, TextArea, TextInput } from '@/components/ui/Form';
import { INQUIRY_TYPE_LABELS } from '@/content/defaults';
import { currentUtm, track } from '@/lib/analytics-client';

/**
 * Public contact form.
 *
 * Client-side checks exist for fast feedback only - the API re-validates
 * everything with the same rules, because a browser check protects nobody.
 *
 * Spam controls, none of which burden a real visitor:
 *  - a honeypot field hidden from humans and assistive tech,
 *  - a render timestamp, so a submission faster than a human could type is
 *    scored as suspicious server-side,
 *  - a server-side rate limit per IP hash.
 */

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Errors = Record<string, string>;

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  organization: '',
  subject: '',
  message: '',
  inquiryType: 'GENERAL',
  consent: false,
  website: '',
};

export function ContactForm() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Stamped on mount, not during render: the clock is impure and the value must
  // be the moment the form became interactive, not the moment it rendered.
  const renderedAt = useRef(0);
  const startedRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderedAt.current = Date.now();
    track('contact_form_view');
  }, []);

  // Move focus to the confirmation so screen reader users are not left behind.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const update = (field: keyof typeof INITIAL, value: string | boolean) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track('contact_form_start');
    }
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(values.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (values.subject.trim().length < 3) next.subject = 'Please add a short subject.';
    if (values.message.trim().length < 20) {
      next.message = 'Please write at least 20 characters so the message is actionable.';
    }
    if (!values.consent) next.consent = 'Please confirm you agree to your details being stored.';
    return next;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstField = Object.keys(found)[0]!;
      document.getElementById(`contact-${firstField}`)?.focus();
      return;
    }

    setStatus('submitting');

    try {
      const utm = currentUtm();
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          renderedAt: renderedAt.current,
          sourcePage: window.location.pathname,
          utmSource: utm.utm_source,
          utmMedium: utm.utm_medium,
          utmCampaign: utm.utm_campaign,
          utmTerm: utm.utm_term,
          utmContent: utm.utm_content,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reference?: string;
        error?: string;
        fields?: Errors;
      };

      if (!response.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(
          data.error ??
            (response.status === 429
              ? 'Too many messages from this connection. Please try again in a few minutes.'
              : 'Something went wrong while sending your message. Please try again.'),
        );
        setStatus('error');
        return;
      }

      setReference(data.reference ?? null);
      setStatus('success');
      setValues(INITIAL);
      track('contact_form_submit');
    } catch {
      setFormError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="rounded-xl2 border border-turf-600/50 bg-turf-900/25 p-8 text-center focus-visible:outline-none sm:p-12"
      >
        <CheckCircle2 size={40} aria-hidden="true" className="mx-auto text-turf-300" />
        <h2 className="mt-5 font-display text-2xl text-bone-50">Message received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-bone-300">
          Thank you for getting in touch. Your message has been recorded and will be reviewed
          personally.
        </p>
        {reference ? (
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-bone-400">
            Reference{' '}
            <span className="font-mono text-sm tracking-normal text-brass-200">{reference}</span>
          </p>
        ) : null}
        <div className="mt-8">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              renderedAt.current = Date.now();
              startedRef.current = false;
              setReference(null);
              setStatus('idle');
            }}
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-danger-500/50 bg-danger-600/10 px-4 py-3 text-sm text-danger-400"
        >
          {formError}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" label="Full Name" required error={errors.name}>
          <TextInput
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            value={values.name}
            error={errors.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Your name"
          />
        </Field>

        <Field id="contact-email" label="Email" required error={errors.email}>
          <TextInput
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={values.email}
            error={errors.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field id="contact-phone" label="Phone Number" error={errors.phone}>
          <TextInput
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            error={errors.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91"
          />
        </Field>

        <Field id="contact-organization" label="Organisation / Company" error={errors.organization}>
          <TextInput
            id="contact-organization"
            name="organization"
            autoComplete="organization"
            value={values.organization}
            error={errors.organization}
            onChange={(event) => update('organization', event.target.value)}
          />
        </Field>
      </div>

      <Field id="contact-inquiryType" label="Inquiry Type" required error={errors.inquiryType}>
        <Select
          id="contact-inquiryType"
          name="inquiryType"
          value={values.inquiryType}
          error={errors.inquiryType}
          onChange={(event) => update('inquiryType', event.target.value)}
        >
          {Object.entries(INQUIRY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Field id="contact-subject" label="Subject" required error={errors.subject}>
        <TextInput
          id="contact-subject"
          name="subject"
          required
          value={values.subject}
          error={errors.subject}
          onChange={(event) => update('subject', event.target.value)}
          placeholder="What is this about?"
        />
      </Field>

      <Field
        id="contact-message"
        label="Message"
        required
        error={errors.message}
        hint="At least 20 characters."
      >
        <TextArea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={values.message}
          error={errors.message}
          hint="At least 20 characters."
          onChange={(event) => update('message', event.target.value)}
        />
      </Field>

      {/* Honeypot: off-screen, not tabbable, hidden from assistive tech. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setValues((prev) => ({ ...prev, website: event.target.value }))}
        />
      </div>

      <Checkbox
        id="contact-consent"
        name="consent"
        checked={values.consent}
        error={errors.consent}
        onChange={(event) => update('consent', event.target.checked)}
        label={
          <>
            I agree that the details I have submitted may be stored and used to respond to my
            inquiry, as described in the{' '}
            <a href="/privacy" className="text-brass-200 underline underline-offset-2">
              privacy policy
            </a>
            .
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button type="submit" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
              Sending
            </>
          ) : (
            'Send message'
          )}
        </Button>
        <p className="text-xs text-bone-500">
          Your details are never sold, shared or used for marketing.
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {status === 'submitting' ? 'Sending your message' : ''}
      </p>
    </form>
  );
}
