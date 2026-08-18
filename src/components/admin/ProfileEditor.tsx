'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { EntityForm, type EntityValues } from '@/components/admin/EntityForm';
import { Panel } from '@/components/admin/Ui';
import type { FieldDef } from '@/lib/resource-fields';

const FIELDS: FieldDef[] = [
  { name: 'fullName', label: 'Full name', type: 'text', required: true },
  { name: 'headline', label: 'Hero headline', type: 'text', required: true },
  {
    name: 'positioning',
    label: 'Positioning line',
    type: 'text',
    required: true,
    span: 2,
    hint: 'Separate roles with the middle dot character. Keep claims accurate.',
  },
  {
    name: 'shortBio',
    label: 'Short bio',
    type: 'textarea',
    required: true,
    span: 2,
    hint: 'One or two sentences. Used in the hero, footer and social previews.',
  },
  {
    name: 'longBio',
    label: 'Full biography',
    type: 'textarea',
    required: true,
    span: 2,
    hint: 'Separate paragraphs with a blank line.',
  },
  { name: 'birthDate', label: 'Date of birth', type: 'date' },
  { name: 'birthPlace', label: 'Birthplace', type: 'text' },
  { name: 'currentCity', label: 'Current city', type: 'text' },
  { name: 'region', label: 'State / region', type: 'text' },
  { name: 'country', label: 'Country', type: 'text' },
  { name: 'education', label: 'Qualification', type: 'text', placeholder: 'LLM' },
  { name: 'educationBody', label: 'Institution', type: 'text', placeholder: 'Kalinga University' },
  { name: 'portraitUrl', label: 'Portrait URL', type: 'url' },
  { name: 'portraitAlt', label: 'Portrait alt text', type: 'text' },
  {
    name: 'email',
    label: 'Public email',
    type: 'text',
    hint: 'Published on the contact page. Leave blank to keep it private.',
  },
  { name: 'phone', label: 'Public phone', type: 'text' },
  { name: 'socialLinks', label: 'Social links', type: 'links', span: 2 },
];

/**
 * Profile editor.
 *
 * Changes here propagate to the hero, about page, footer, contact page and the
 * Person JSON-LD, so the structured data can never drift from the visible copy.
 */
export function ProfileEditor({ initial }: { initial: EntityValues | null }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  return (
    <Panel
      title="Public profile"
      description="Used across the site and in the Person structured data. Only state what can be supported."
    >
      {saved ? (
        <p
          role="status"
          className="mb-5 rounded-lg border border-turf-600/50 bg-turf-900/30 px-4 py-3 text-sm text-turf-200"
        >
          Profile saved. The public site updates on its next revalidation.
        </p>
      ) : null}

      <EntityForm
        fields={FIELDS}
        initial={initial}
        endpoint="/api/admin/profile"
        method="PUT"
        submitLabel="Save profile"
        onSaved={() => {
          setSaved(true);
          router.refresh();
        }}
      />
    </Panel>
  );
}
