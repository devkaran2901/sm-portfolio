/**
 * Form definitions for the CMS collections.
 *
 * Client-safe by design (no server imports): the admin UI renders forms from
 * these descriptors, while the API validates the same shapes with Zod. Keeping
 * the two in one repo but separate modules means the browser never sees server
 * code, and the server never trusts the browser's idea of the shape.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'url'
  | 'date'
  | 'links';

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  /** Layout width inside the two-column form grid. */
  span?: 1 | 2;
  defaultValue?: string | number | boolean;
};

export type ResourceForm = {
  key: string;
  title: string;
  description: string;
  /** Columns shown in the list table. */
  columns: Array<{ name: string; label: string }>;
  fields: FieldDef[];
};

const slugField: FieldDef = {
  name: 'slug',
  label: 'Slug',
  type: 'text',
  required: true,
  hint: 'Lower-case identifier used in links and anchors.',
};

const sortField: FieldDef = {
  name: 'sortOrder',
  label: 'Sort order',
  type: 'number',
  defaultValue: 0,
  hint: 'Lower numbers appear first.',
};

const publishedField: FieldDef = {
  name: 'isPublished',
  label: 'Published on the public site',
  type: 'checkbox',
  defaultValue: true,
};

export const RESOURCE_FORMS: Record<string, ResourceForm> = {
  timeline: {
    key: 'timeline',
    title: 'Cricket Journey',
    description:
      'Timeline entries shown on the home, about and cricket pages. Year labels are free text on purpose - describe a period rather than inventing a date.',
    columns: [
      { name: 'yearLabel', label: 'Year' },
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
    ],
    fields: [
      slugField,
      { name: 'yearLabel', label: 'Year label', type: 'text', required: true, placeholder: '1988 or "Early years"' },
      { name: 'title', label: 'Title', type: 'text', required: true, span: 2 },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, span: 2 },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'ORIGIN', label: 'Origin' },
          { value: 'CRICKET', label: 'Cricket' },
          { value: 'INTERNATIONAL', label: 'International' },
          { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
          { value: 'BUSINESS', label: 'Business' },
          { value: 'EDUCATION', label: 'Education' },
        ],
      },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'country', label: 'Country', type: 'text' },
      sortField,
      {
        name: 'needsSource',
        label: 'Still needs a documentary source',
        type: 'checkbox',
        defaultValue: true,
        hint: 'When ticked, the entry shows a "Verification required" marker publicly.',
        span: 2,
      },
      {
        name: 'isVerified',
        label: 'A verified source is attached',
        type: 'checkbox',
        defaultValue: false,
        hint: 'Set automatically when a linked verification record is marked Verified.',
        span: 2,
      },
      publishedField,
    ],
  },

  facilities: {
    key: 'facilities',
    title: 'Red Ball Facilities',
    description: 'Facilities that make up the multi-sports complex in Rohtak.',
    columns: [
      { name: 'name', label: 'Facility' },
      { name: 'group', label: 'Group' },
      { name: 'quantity', label: 'Qty' },
    ],
    fields: [
      slugField,
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'group',
        label: 'Group',
        type: 'select',
        required: true,
        options: [
          { value: 'CRICKET', label: 'Cricket' },
          { value: 'RACQUET', label: 'Racquet Sports' },
          { value: 'FITNESS', label: 'Fitness & Recreation' },
          { value: 'HOSPITALITY', label: 'Hospitality' },
        ],
      },
      { name: 'quantity', label: 'Quantity', type: 'number', hint: 'Leave blank when a count does not apply.' },
      { name: 'unitLabel', label: 'Unit label', type: 'text', placeholder: 'Grounds, Courts' },
      {
        name: 'iconKey',
        label: 'Icon',
        type: 'select',
        options: [
          { value: 'target', label: 'Target (cricket)' },
          { value: 'graduation', label: 'Academy' },
          { value: 'box', label: 'Box cricket' },
          { value: 'racquet', label: 'Racquet' },
          { value: 'dumbbell', label: 'Gym' },
          { value: 'waves', label: 'Swimming' },
          { value: 'utensils', label: 'Restaurant' },
          { value: 'dot', label: 'Generic' },
        ],
      },
      { name: 'description', label: 'Description', type: 'textarea', required: true, span: 2 },
      sortField,
      publishedField,
    ],
  },

  events: {
    key: 'events',
    title: 'Events & Competitions',
    description:
      'Cricket hosted at the ground. Add the organiser, year and a supporting reference before publishing a specific fixture.',
    columns: [
      { name: 'name', label: 'Event' },
      { name: 'category', label: 'Category' },
      { name: 'yearLabel', label: 'Year' },
    ],
    fields: [
      slugField,
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'CORPORATE_LEAGUE', label: 'Corporate League' },
          { value: 'OPEN_TOURNAMENT', label: 'Open Tournament' },
          { value: 'BCCI_U14', label: 'BCCI U-14' },
          { value: 'BCCI_U16', label: 'BCCI U-16' },
          { value: 'BCCI_U19', label: 'BCCI U-19' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      { name: 'yearLabel', label: 'Year', type: 'text', hint: 'Leave blank rather than guessing.' },
      { name: 'organizer', label: 'Organiser', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, span: 2 },
      sortField,
      publishedField,
    ],
  },

  players: {
    key: 'players',
    title: 'Player Associations',
    description:
      'Players associated with the facility. Do not describe a coaching, mentoring or management relationship unless it is documented and verified.',
    columns: [
      { name: 'name', label: 'Player' },
      { name: 'teamContext', label: 'Team context' },
      { name: 'associationType', label: 'Association' },
    ],
    fields: [
      slugField,
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'teamContext', label: 'Team context', type: 'text', hint: 'Exactly as supplied. Never inferred.' },
      { name: 'level', label: 'Level', type: 'text', placeholder: 'Domestic, Ranji, IPL' },
      {
        name: 'associationType',
        label: 'Association type',
        type: 'select',
        required: true,
        options: [
          { value: 'UNSPECIFIED', label: 'Unspecified (safest default)' },
          { value: 'PLAYED_AT_FACILITY', label: 'Played at the facility' },
          { value: 'TRAINED_AT_ACADEMY', label: 'Trained at the academy' },
          { value: 'GUEST_APPEARANCE', label: 'Guest appearance' },
          { value: 'TOURNAMENT_PARTICIPANT', label: 'Tournament participant' },
        ],
      },
      {
        name: 'associationNote',
        label: 'Public wording',
        type: 'textarea',
        required: true,
        span: 2,
        hint: 'This exact sentence is published. Keep it to what can be supported.',
      },
      { name: 'photoUrl', label: 'Photo URL', type: 'url' },
      { name: 'photoAlt', label: 'Photo alt text', type: 'text' },
      sortField,
      publishedField,
    ],
  },

  ventures: {
    key: 'ventures',
    title: 'Business Ventures',
    description: 'Businesses founded and owned by Sonu Malik. Leave unknown fields blank.',
    columns: [
      { name: 'name', label: 'Business' },
      { name: 'role', label: 'Role' },
      { name: 'location', label: 'Location' },
    ],
    fields: [
      slugField,
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true, defaultValue: 'Founder & Owner' },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'Hospitality' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, span: 2 },
      { name: 'websiteUrl', label: 'Website URL', type: 'url' },
      { name: 'bookingUrl', label: 'Booking URL', type: 'url' },
      { name: 'logoUrl', label: 'Logo URL', type: 'url' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'contactEmail', label: 'Contact email', type: 'text' },
      { name: 'contactPhone', label: 'Contact phone', type: 'text' },
      { name: 'socialLinks', label: 'Social links', type: 'links', span: 2 },
      sortField,
      publishedField,
    ],
  },

  stats: {
    key: 'stats',
    title: 'Statistics',
    description:
      'Figures shown across the site. Values are text so honest forms like "50+" and "6+" stay intact.',
    columns: [
      { name: 'value', label: 'Value' },
      { name: 'label', label: 'Label' },
      { name: 'key', label: 'Key' },
    ],
    fields: [
      { name: 'key', label: 'Key', type: 'text', required: true, hint: 'Stable identifier, e.g. players-progressed.' },
      { name: 'value', label: 'Value', type: 'text', required: true, placeholder: '50+' },
      { name: 'label', label: 'Label', type: 'text', required: true, span: 2 },
      { name: 'description', label: 'Description', type: 'textarea', span: 2 },
      sortField,
      publishedField,
    ],
  },

  faqs: {
    key: 'faqs',
    title: 'FAQ',
    description:
      'Questions and answers used on the public site and in FAQ structured data. Answers must stay inside what is known.',
    columns: [
      { name: 'question', label: 'Question' },
      { name: 'slug', label: 'Slug' },
    ],
    fields: [
      slugField,
      { name: 'question', label: 'Question', type: 'text', required: true, span: 2 },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true, span: 2 },
      sortField,
      publishedField,
    ],
  },
};

export function getResourceForm(key: string): ResourceForm | null {
  return Object.hasOwn(RESOURCE_FORMS, key) ? RESOURCE_FORMS[key]! : null;
}
