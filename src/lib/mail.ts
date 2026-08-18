import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';
import { mailConfig, siteUrl } from './env';

/**
 * Outbound email.
 *
 * SMTP is optional. When it is not configured the app logs the message and
 * carries on - an inquiry is never lost because the mail server is down, it is
 * already persisted before any email is attempted.
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!mailConfig.host) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: mailConfig.user ? { user: mailConfig.user, pass: mailConfig.password } : undefined,
  });
  return transporter;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendMail(message: MailMessage): Promise<{ sent: boolean; reason?: string }> {
  const transport = getTransporter();
  if (!transport) {
    console.info(`[mail] SMTP not configured - skipped "${message.subject}" to ${message.to}`);
    return { sent: false, reason: 'smtp-not-configured' };
  }

  try {
    await transport.sendMail({
      from: mailConfig.from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { sent: true };
  } catch (error) {
    // Never surface transport details to the caller; the inquiry is already saved.
    console.error('[mail] send failed:', (error as Error).message);
    return { sent: false, reason: 'send-failed' };
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f6f2ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#15181a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ea;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #ede7db;border-radius:14px;overflow:hidden;">
        <tr><td style="background:#0e1011;padding:22px 28px;">
          <div style="color:#f6f2ea;font-size:17px;font-weight:600;letter-spacing:-0.01em;">Sonu Malik</div>
          <div style="color:#d4b65a;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">${escapeHtml(title)}</div>
        </td></tr>
        <tr><td style="padding:28px;">${bodyHtml}</td></tr>
        <tr><td style="padding:18px 28px;background:#faf8f4;border-top:1px solid #ede7db;color:#6b6257;font-size:12px;line-height:1.6;">
          Sent automatically from <a href="${siteUrl()}" style="color:#866718;">${escapeHtml(siteUrl())}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return '';
  return `<tr>
    <td style="padding:7px 0;color:#6b6257;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:132px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:7px 0;font-size:14px;color:#15181a;">${escapeHtml(value)}</td>
  </tr>`;
}

export type InquiryEmailData = {
  reference: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  subject: string;
  message: string;
  inquiryTypeLabel: string;
  sourcePage?: string | null;
  campaign?: string | null;
  submittedAt: Date;
};

export function adminNotificationTemplate(data: InquiryEmailData): { html: string; text: string } {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">A new inquiry arrived through the website contact form.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #ede7db;">
      ${row('Reference', data.reference)}
      ${row('Type', data.inquiryTypeLabel)}
      ${row('Name', data.name)}
      ${row('Email', data.email)}
      ${row('Phone', data.phone)}
      ${row('Organisation', data.organization)}
      ${row('Subject', data.subject)}
      ${row('Source page', data.sourcePage)}
      ${row('Campaign', data.campaign)}
      ${row('Received', data.submittedAt.toISOString())}
    </table>
    <div style="margin-top:20px;padding:16px;background:#faf8f4;border-left:3px solid #237f52;border-radius:0 8px 8px 0;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#6b6257;margin-bottom:8px;">Message</div>
      <div style="font-size:14px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
    </div>
    <p style="margin:22px 0 0;">
      <a href="${siteUrl()}/admin/inquiries" style="display:inline-block;background:#0e1011;color:#f6f2ea;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600;">Open in admin portal</a>
    </p>`;

  const text = [
    `New inquiry - ${data.reference}`,
    `Type: ${data.inquiryTypeLabel}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : '',
    data.organization ? `Organisation: ${data.organization}` : '',
    `Subject: ${data.subject}`,
    '',
    data.message,
    '',
    `Manage: ${siteUrl()}/admin/inquiries`,
  ]
    .filter(Boolean)
    .join('\n');

  return { html: layout('New inquiry', body), text };
}

export function acknowledgementTemplate(data: InquiryEmailData): { html: string; text: string } {
  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;">Hello ${escapeHtml(data.name)},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;">
      Thank you for getting in touch. Your message has been received and will be reviewed personally.
      Your reference number is <strong>${escapeHtml(data.reference)}</strong>.
    </p>
    <div style="margin:18px 0;padding:16px;background:#faf8f4;border-left:3px solid #237f52;border-radius:0 8px 8px 0;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#6b6257;margin-bottom:8px;">Your message</div>
      <div style="font-size:14px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
    </div>
    <p style="margin:0;font-size:15px;line-height:1.65;">Regards,<br>Sonu Malik</p>`;

  const text = [
    `Hello ${data.name},`,
    '',
    `Thank you for getting in touch. Your message has been received. Reference: ${data.reference}.`,
    '',
    'Your message:',
    data.message,
    '',
    'Regards,',
    'Sonu Malik',
  ].join('\n');

  return { html: layout('Message received', body), text };
}

export function passwordResetTemplate(name: string, resetUrl: string): { html: string; text: string } {
  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;">Hello ${escapeHtml(name)},</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;">
      A password reset was requested for your admin account. This link expires in 60 minutes and can be used once.
      If you did not request it, no action is needed.
    </p>
    <p style="margin:0 0 18px;">
      <a href="${resetUrl}" style="display:inline-block;background:#0e1011;color:#f6f2ea;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600;">Reset password</a>
    </p>
    <p style="margin:0;font-size:12px;color:#6b6257;word-break:break-all;">${escapeHtml(resetUrl)}</p>`;

  const text = [
    `Hello ${name},`,
    '',
    'A password reset was requested for your admin account. The link below expires in 60 minutes and can be used once.',
    resetUrl,
    '',
    'If you did not request this, no action is needed.',
  ].join('\n');

  return { html: layout('Password reset', body), text };
}
