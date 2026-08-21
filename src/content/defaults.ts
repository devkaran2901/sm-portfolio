/**
 * Canonical launch content.
 *
 * ACCURACY POLICY (see README):
 *  - Every statement here traces back to information supplied by the site owner.
 *  - Nothing is embellished. No tournament names, dates, statistics, awards,
 *    quotations, publications or URLs have been invented.
 *  - Claims that still need documentary backing carry `needsSource: true` and
 *    render with a "Verification required" marker until an admin attaches a source.
 *  - This file is also the fallback the public site renders from when the
 *    database is unreachable, so it must stay factual and self-consistent.
 */

export const SITE = {
  name: 'Sonu Malik',
  domain: 'sonumalik.in',
  defaultTitle: 'Sonu Malik | Sports Infrastructure Founder, Rohtak, Haryana',
  defaultDescription:
    'Sonu Malik is a Rohtak-based sports infrastructure founder and entrepreneur. Founder of Red Ball Cricket Ground, a multi-sports complex in Haryana, with international club cricket experience in South Africa, Nepal and Norway.',
  locale: 'en_IN',
  redBallUrl: 'https://www.redballsportsarena.in',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/red-ball', label: 'Red Ball' },
  { href: '/players', label: 'Players & Impact' },
  { href: '/ventures', label: 'Ventures' },
  { href: '/media', label: 'Media' },
  { href: '/contact', label: 'Contact' },
] as const;

export const PROFILE = {
  id: 'primary',
  fullName: 'Sonu Malik',
  headline: 'Sonu Malik',
  positioning: 'Cricket Enthusiast · Sports Infrastructure Founder · Entrepreneur',
  shortBio:
    'From the cricket grounds of Mokhra to building a multi-sports ecosystem in Rohtak.',
  longBio: [
    'Sonu Malik was born on 23 March 1988 in Mokhra village, Rohtak district, Haryana, and lives in Rohtak today. Cricket started where most Haryana careers start: on village ground with the local Mokhra team, then at the collegiate level for Vaish College.',
    'He did not take the professional BCCI route as a player. Instead his cricket took him abroad, into international club cricket - turning out with Dolphin Club in South Africa, playing club cricket in Nepal, and taking part in the Norwegian Cup in Norway.',
    'That travelling grounding shaped what came next. For roughly six years he has founded and run Red Ball Cricket Ground in Rohtak, growing it from a cricket ground into a multi-sport arena spanning cricket, racquet sports, outdoor games, precision sports, fitness and aquatics, alongside an on-site restaurant.',
    'Alongside the sports infrastructure he holds an LLM from Kalinga University and runs two businesses as founder and owner: The Page and Hotel The Prada.',
  ].join('\n\n'),
  birthDate: '1988-03-23',
  birthPlace: 'Mokhra, Rohtak, Haryana, India',
  currentCity: 'Rohtak',
  region: 'Haryana',
  country: 'India',
  education: 'LLM',
  educationBody: 'Kalinga University',
  portraitUrl: '/images/sonu-malik-portrait.jpg',
  // Describes only what the photograph actually shows.
  portraitAlt: 'Sonu Malik at the podium of the Norwegian Embassy in New Delhi',
  email: null,
  phone: null,
  socialLinks: [] as Array<{ label: string; url: string }>,
};

export type TimelineSeed = {
  slug: string;
  yearLabel: string;
  sortOrder: number;
  title: string;
  summary: string;
  category: 'ORIGIN' | 'CRICKET' | 'INTERNATIONAL' | 'INFRASTRUCTURE' | 'BUSINESS' | 'EDUCATION';
  location?: string;
  country?: string;
  needsSource: boolean;
};

export const TIMELINE: TimelineSeed[] = [
  {
    slug: 'born-mokhra-1988',
    yearLabel: '1988',
    sortOrder: 10,
    title: 'Born in Mokhra, Rohtak',
    summary:
      'Born on 23 March 1988 in Mokhra village, Rohtak district, Haryana - the village where his cricket began.',
    category: 'ORIGIN',
    location: 'Mokhra, Rohtak',
    country: 'India',
    needsSource: false,
  },
  {
    slug: 'village-cricket',
    yearLabel: 'Early years',
    sortOrder: 20,
    title: 'Village cricket in Mokhra',
    summary:
      'Started playing cricket locally with his village team in Mokhra, learning the game on open ground rather than in an academy.',
    category: 'CRICKET',
    location: 'Mokhra, Rohtak',
    country: 'India',
    needsSource: false,
  },
  {
    slug: 'vaish-college-cricket',
    yearLabel: 'College years',
    sortOrder: 30,
    title: 'Collegiate cricket at Vaish College',
    summary:
      'Progressed from village cricket to the collegiate level, playing for Vaish College.',
    category: 'CRICKET',
    location: 'Rohtak',
    country: 'India',
    needsSource: true,
  },
  {
    slug: 'south-africa-dolphin-club',
    yearLabel: 'International club cricket',
    sortOrder: 40,
    title: 'South Africa - Dolphin Club',
    summary:
      'Travelled to South Africa and played club cricket with Dolphin Club. This was international club cricket, not national representation.',
    category: 'INTERNATIONAL',
    location: 'South Africa',
    country: 'South Africa',
    needsSource: true,
  },
  {
    slug: 'nepal-club-cricket',
    yearLabel: 'International club cricket',
    sortOrder: 50,
    title: 'Nepal - club cricket',
    summary: 'Played and travelled for club cricket in Nepal.',
    category: 'INTERNATIONAL',
    location: 'Nepal',
    country: 'Nepal',
    needsSource: true,
  },
  {
    slug: 'norway-norwegian-cup',
    yearLabel: 'International club cricket',
    sortOrder: 60,
    title: 'Norway - Norwegian Cup',
    summary: 'Participated in the Norwegian Cup during his time playing club cricket in Norway.',
    category: 'INTERNATIONAL',
    location: 'Norway',
    country: 'Norway',
    needsSource: true,
  },
  {
    slug: 'llm-kalinga-university',
    yearLabel: 'Education',
    sortOrder: 70,
    title: 'LLM, Kalinga University',
    summary: 'Completed an LLM at Kalinga University.',
    category: 'EDUCATION',
    needsSource: true,
  },
  {
    slug: 'red-ball-founded',
    yearLabel: 'Sports infrastructure',
    sortOrder: 80,
    title: 'Founded Red Ball Cricket Ground',
    summary:
      'Founded Red Ball Cricket Ground in Rohtak and has run it for approximately six years, starting from cricket and expanding outward.',
    category: 'INFRASTRUCTURE',
    location: 'Rohtak',
    country: 'India',
    needsSource: true,
  },
  {
    slug: 'multi-sports-complex',
    yearLabel: 'Present',
    sortOrder: 90,
    title: 'A multi-sports ecosystem',
    summary:
      'Red Ball has grown into a multi-sport arena spanning cricket, racquet sports, outdoor games, precision sports, fitness and aquatics, alongside continued business activity.',
    category: 'INFRASTRUCTURE',
    location: 'Rohtak',
    country: 'India',
    needsSource: false,
  },
];

export type FacilitySeed = {
  slug: string;
  name: string;
  group: 'CRICKET' | 'RACQUET' | 'FIELD' | 'FITNESS' | 'PRECISION' | 'HOSPITALITY';
  quantity: number | null;
  unitLabel: string | null;
  description: string;
  iconKey: string;
  /** Featured facilities take the large cards that anchor the arena grid. */
  isFeatured: boolean;
  sortOrder: number;
};

/**
 * Sports facilities at Red Ball Sports Arena, exactly as supplied.
 *
 * Descriptions state what each facility is for and nothing more - no capacities,
 * dimensions, surfaces, opening hours, pricing or coaching claims have been
 * invented to fill the cards out.
 */
export const FACILITIES: FacilitySeed[] = [
  {
    slug: 'cricket-grounds',
    name: 'Cricket Grounds',
    group: 'CRICKET',
    quantity: 2,
    unitLabel: 'Grounds',
    description:
      'Dedicated cricket grounds designed for competitive matches, training sessions and cricket events.',
    iconKey: 'target',
    isFeatured: true,
    sortOrder: 10,
  },
  {
    slug: 'cricket-academy',
    name: 'Cricket Academy',
    group: 'CRICKET',
    quantity: 2,
    unitLabel: 'Academies',
    description:
      'A dedicated environment for cricket training, skill development and structured practice.',
    iconKey: 'graduation',
    isFeatured: false,
    sortOrder: 20,
  },
  {
    slug: 'box-cricket',
    name: 'Box Cricket',
    group: 'CRICKET',
    quantity: null,
    unitLabel: null,
    description: 'A dedicated space for fast-paced recreational and competitive box cricket.',
    iconKey: 'box',
    isFeatured: false,
    sortOrder: 30,
  },
  {
    slug: 'badminton',
    name: 'Badminton',
    group: 'RACQUET',
    quantity: null,
    unitLabel: null,
    description: 'Dedicated badminton facilities for training, practice and recreational play.',
    iconKey: 'racquet',
    isFeatured: false,
    sortOrder: 40,
  },
  {
    slug: 'pickleball',
    name: 'Pickleball',
    group: 'RACQUET',
    quantity: null,
    unitLabel: null,
    description: 'Dedicated pickleball courts for recreational and competitive play.',
    iconKey: 'racquet',
    isFeatured: false,
    sortOrder: 50,
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    group: 'RACQUET',
    quantity: null,
    unitLabel: null,
    description: 'Tennis facilities designed for practice, training and recreational matches.',
    iconKey: 'racquet',
    isFeatured: false,
    sortOrder: 60,
  },
  {
    slug: 'football-ground',
    name: 'Football Ground',
    group: 'FIELD',
    quantity: null,
    unitLabel: null,
    description:
      'An outdoor football facility suitable for training, games and recreational activities.',
    iconKey: 'football',
    isFeatured: true,
    sortOrder: 70,
  },
  {
    slug: 'volleyball',
    name: 'Volleyball',
    group: 'FIELD',
    quantity: null,
    unitLabel: null,
    description: 'A dedicated volleyball facility for practice, games and recreational play.',
    iconKey: 'volleyball',
    isFeatured: false,
    sortOrder: 80,
  },
  {
    slug: 'table-tennis',
    name: 'Table Tennis',
    group: 'RACQUET',
    quantity: null,
    unitLabel: null,
    description:
      'Indoor table tennis facilities for practice, training and recreational games.',
    iconKey: 'racquet',
    isFeatured: false,
    sortOrder: 90,
  },
  {
    slug: 'swimming-pool',
    name: 'Swimming Pool',
    group: 'FITNESS',
    quantity: null,
    unitLabel: null,
    description:
      'A dedicated swimming facility for fitness, recreation and swimming activities.',
    iconKey: 'waves',
    isFeatured: false,
    sortOrder: 100,
  },
  {
    slug: 'gym',
    name: 'Gym & Fitness',
    group: 'FITNESS',
    quantity: null,
    unitLabel: null,
    description:
      'A dedicated fitness facility supporting strength, conditioning and general physical fitness.',
    iconKey: 'dumbbell',
    isFeatured: false,
    sortOrder: 110,
  },
  {
    slug: 'archery',
    name: 'Archery',
    group: 'PRECISION',
    quantity: null,
    unitLabel: null,
    description: 'A dedicated space for archery practice and recreational activities.',
    iconKey: 'target',
    isFeatured: false,
    sortOrder: 120,
  },
  {
    slug: 'shooting',
    name: 'Shooting',
    group: 'PRECISION',
    quantity: null,
    unitLabel: null,
    description:
      'A dedicated shooting facility for supervised sporting and recreational activities.',
    iconKey: 'crosshair',
    isFeatured: false,
    sortOrder: 130,
  },
  {
    // Kept in the data but excluded from the sports section, which covers
    // sport only. Removing it would contradict the bio and the FAQ.
    slug: 'restaurant',
    name: 'Restaurant',
    group: 'HOSPITALITY',
    quantity: null,
    unitLabel: null,
    description:
      'An on-site restaurant serving players, families and spectators through the day.',
    iconKey: 'utensils',
    isFeatured: false,
    sortOrder: 200,
  },
];

export const FACILITY_GROUP_LABELS: Record<FacilitySeed['group'], string> = {
  CRICKET: 'Cricket',
  RACQUET: 'Racquet Sports',
  FIELD: 'Outdoor Games',
  FITNESS: 'Fitness & Aquatics',
  PRECISION: 'Precision Sports',
  HOSPITALITY: 'Hospitality',
};

export type EventSeed = {
  slug: string;
  name: string;
  category: 'CORPORATE_LEAGUE' | 'OPEN_TOURNAMENT' | 'BCCI_U14' | 'BCCI_U16' | 'BCCI_U19' | 'OTHER';
  organizer: string | null;
  summary: string;
  sortOrder: number;
};

/**
 * Event categories only. Individual tournament names, dates, results and
 * certifications are deliberately absent - those get added from the admin
 * portal with a source attached.
 */
export const EVENTS: EventSeed[] = [
  {
    slug: 'corporate-cricket-leagues',
    name: 'Corporate Cricket Leagues',
    category: 'CORPORATE_LEAGUE',
    organizer: null,
    summary:
      'Corporate cricket leagues are hosted at the facility, bringing company teams onto the grounds across a season format.',
    sortOrder: 10,
  },
  {
    slug: 'open-cricket-tournaments',
    name: 'Open Cricket Tournaments',
    category: 'OPEN_TOURNAMENT',
    organizer: null,
    summary:
      'Open tournaments run at the ground for club and district-level teams.',
    sortOrder: 20,
  },
  {
    slug: 'bcci-u14-matches',
    name: 'Official BCCI U-14 Matches',
    category: 'BCCI_U14',
    organizer: null,
    summary: 'The ground has hosted official BCCI Under-14 matches.',
    sortOrder: 30,
  },
  {
    slug: 'bcci-u16-matches',
    name: 'Official BCCI U-16 Matches',
    category: 'BCCI_U16',
    organizer: null,
    summary: 'The ground has hosted official BCCI Under-16 matches.',
    sortOrder: 40,
  },
  {
    slug: 'bcci-u19-matches',
    name: 'Official BCCI U-19 Matches',
    category: 'BCCI_U19',
    organizer: null,
    summary: 'The ground has hosted official BCCI Under-19 matches.',
    sortOrder: 50,
  },
];

export type PlayerSeed = {
  slug: string;
  name: string;
  teamContext: string | null;
  associationNote: string;
  /**
   * Supplied photograph. The alt text describes only what is visible in the
   * frame - it never restates the association, because the photograph is not
   * evidence of one.
   */
  photoUrl: string | null;
  photoAlt: string | null;
  sortOrder: number;
};

/**
 * Wording is deliberately limited to association with the facility.
 * No coaching, mentoring, discovery or management relationship is claimed.
 */
export const PLAYERS: PlayerSeed[] = [
  {
    slug: 'mohit-rathee',
    name: 'Mohit Rathee',
    teamContext: 'Punjab Kings',
    associationNote: 'Player associated with the facility.',
    photoUrl: '/images/players/mohit-rathee.webp',
    photoAlt: 'Mohit Rathee, arms folded, in Punjab Kings kit.',
    sortOrder: 10,
  },
  {
    slug: 'nishant-sindhu',
    name: 'Nishant Sindhu',
    teamContext: 'Gujarat Titans',
    associationNote: 'Player associated with the facility.',
    photoUrl: '/images/players/nishant-sindhu.webp',
    photoAlt: 'Nishant Sindhu on the field in India kit at the Emerging Teams Asia Cup.',
    sortOrder: 20,
  },
];

export type BusinessSeed = {
  slug: string;
  name: string;
  role: string;
  category: string | null;
  description: string;
  /**
   * Premises photograph. Seeded as a BusinessImage with isPlaceholder false,
   * which is the flag the public queries filter on - a placeholder row is a
   * reserved slot, not a picture.
   */
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
};

export const BUSINESSES: BusinessSeed[] = [
  {
    slug: 'the-page',
    name: 'The Page',
    role: 'Founder & Owner',
    category: null,
    description:
      'A business founded and owned by Sonu Malik. Full details, imagery and links are managed from the admin portal and published once confirmed.',
    imageUrl: '/images/ventures/the-page.jpg',
    imageAlt: 'The Page at night: a lit glass frontage under a patterned canopy, with its sign above the entrance.',
    sortOrder: 10,
  },
  {
    slug: 'hotel-the-prada',
    name: 'Hotel The Prada',
    role: 'Founder & Owner',
    category: 'Hospitality',
    description:
      'A hotel founded and owned by Sonu Malik. Location, photography, booking and contact details are managed from the admin portal and published once confirmed.',
    imageUrl: '/images/ventures/hotel-the-prada.webp',
    imageAlt:
      'The entrance to Hotel The Prada, its name on the canopy below a row of international flags.',
    sortOrder: 20,
  },
];

export type StatSeed = {
  key: string;
  value: string;
  label: string;
  description: string | null;
  sortOrder: number;
};

export const STATS: StatSeed[] = [
  {
    key: 'cricket-grounds',
    value: '2',
    label: 'Cricket Grounds',
    description: 'Full-size grounds at the Rohtak complex.',
    sortOrder: 10,
  },
  {
    key: 'cricket-academies',
    value: '2',
    label: 'Cricket Academies',
    description: 'Academies operating on site.',
    sortOrder: 20,
  },
  {
    key: 'players-progressed',
    value: '50+',
    label: 'Players Progressed to Higher Levels',
    description:
      'Players who trained or played at the facility and went on to higher levels of competitive cricket.',
    sortOrder: 30,
  },
  {
    key: 'years-operating',
    value: '6+',
    label: 'Years of Operation',
    description: 'Red Ball Cricket Ground has been running for approximately six years.',
    sortOrder: 40,
  },
  {
    key: 'sports-disciplines',
    value: '13',
    label: 'Sports Facilities',
    description:
      'Cricket, box cricket, badminton, pickleball, tennis, table tennis, football, volleyball, swimming, gym, archery and shooting.',
    sortOrder: 50,
  },
];

export type CountrySeed = {
  code: string;
  country: string;
  detail: string;
  note: string;
  /** Percentage coordinates on the flat world map used by the international section. */
  x: number;
  y: number;
};

export const INTERNATIONAL: CountrySeed[] = [
  {
    code: 'ZA',
    country: 'South Africa',
    detail: 'Dolphin Club',
    note: 'Club cricket with Dolphin Club.',
    x: 54.5,
    y: 79.5,
  },
  {
    code: 'NP',
    country: 'Nepal',
    detail: 'International club cricket',
    note: 'Club cricket experience in Nepal.',
    x: 71.5,
    y: 42.5,
  },
  {
    code: 'NO',
    country: 'Norway',
    detail: 'Norwegian Cup',
    note: 'Participated in the Norwegian Cup.',
    x: 51.5,
    y: 18,
  },
];

export type FaqSeed = { slug: string; question: string; answer: string; sortOrder: number };

/** Answers stay inside what is actually known. No padding for search rankings. */
export const FAQS: FaqSeed[] = [
  {
    slug: 'who-is-sonu-malik',
    question: 'Who is Sonu Malik?',
    answer:
      'Sonu Malik is a sports infrastructure founder and entrepreneur based in Rohtak, Haryana, India. He founded Red Ball Cricket Ground, a multi-sports complex in Rohtak, and owns two businesses: The Page and Hotel The Prada. He has international club cricket experience in South Africa, Nepal and Norway.',
    sortOrder: 10,
  },
  {
    slug: 'where-is-sonu-malik-from',
    question: 'Where is Sonu Malik from?',
    answer:
      'He was born in Mokhra village in Rohtak district, Haryana, India, on 23 March 1988, and currently lives in Rohtak, Haryana.',
    sortOrder: 20,
  },
  {
    slug: 'education',
    question: 'What is Sonu Malik educational background?',
    answer: 'He holds an LLM from Kalinga University.',
    sortOrder: 30,
  },
  {
    slug: 'cricket-connection',
    question: 'What is Sonu Malik connection to cricket?',
    answer:
      'He began playing cricket with his village team in Mokhra and later played at the collegiate level for Vaish College. He has international club cricket experience abroad, and today he founded and runs Red Ball Cricket Ground in Rohtak. He has not played professionally in BCCI competitions.',
    sortOrder: 40,
  },
  {
    slug: 'international-club-cricket',
    question: 'Where has Sonu Malik played international club cricket?',
    answer:
      'In South Africa with Dolphin Club, in Nepal, and in Norway where he took part in the Norwegian Cup. This is club-level cricket abroad, not national team representation.',
    sortOrder: 50,
  },
  {
    slug: 'what-is-red-ball',
    question: 'What is Red Ball Cricket Ground?',
    answer:
      'Red Ball Cricket Ground is a multi-sports complex in Rohtak, Haryana, founded by Sonu Malik and operating for approximately six years. It began as a cricket ground and has expanded into cricket, racquet sports, fitness and hospitality facilities.',
    sortOrder: 60,
  },
  {
    slug: 'red-ball-facilities',
    question: 'What facilities are available at Red Ball Sports Arena?',
    answer:
      'Cricket grounds and a cricket academy, box cricket, badminton, pickleball, tennis, table tennis, a football ground, volleyball, a swimming pool, a gym, archery and shooting, alongside an on-site restaurant.',
    sortOrder: 70,
  },
  {
    slug: 'red-ball-events',
    question: 'Which cricket events are hosted at Red Ball?',
    answer:
      'Corporate cricket leagues, open cricket tournaments, and official BCCI Under-14, Under-16 and Under-19 matches.',
    sortOrder: 80,
  },
  {
    slug: 'players-associated',
    question: 'Which players are associated with Red Ball?',
    answer:
      'Mohit Rathee, in a Punjab Kings context, and Nishant Sindhu, in a Gujarat Titans context, are among the players associated with the facility. The ground also hosts domestic, Ranji and IPL-level players. More than 50 players who trained or played at the facility have progressed to higher levels.',
    sortOrder: 90,
  },
  {
    slug: 'businesses',
    question: 'What businesses does Sonu Malik own?',
    answer:
      'He is the founder and owner of The Page and of Hotel The Prada, alongside operating Red Ball Cricket Ground.',
    sortOrder: 100,
  },
];

export const INQUIRY_TYPE_LABELS = {
  SPORTS_FACILITY: 'Sports Facility',
  CRICKET: 'Cricket',
  BUSINESS: 'Business',
  PARTNERSHIP: 'Partnership',
  MEDIA: 'Media',
  EVENT: 'Event',
  GENERAL: 'General Inquiry',
} as const;

export const INQUIRY_STATUS_LABELS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  SPAM: 'Spam',
  ARCHIVED: 'Archived',
} as const;

export const EVENT_CATEGORY_LABELS = {
  CORPORATE_LEAGUE: 'Corporate League',
  OPEN_TOURNAMENT: 'Open Tournament',
  BCCI_U14: 'BCCI U-14',
  BCCI_U16: 'BCCI U-16',
  BCCI_U19: 'BCCI U-19',
  OTHER: 'Other',
} as const;

export const MEDIA_CATEGORY_LABELS = {
  NORWAY_CRICKET: 'Norway Cricket',
  INTERNATIONAL_CLUB_CRICKET: 'International Club Cricket',
  RED_BALL_GROUND: 'Red Ball Cricket Ground',
  SPORTS_INFRASTRUCTURE: 'Sports Infrastructure',
  BUSINESS: 'Business',
  PLAYER_ASSOCIATIONS: 'Player Associations',
  EVENTS: 'Events',
  OTHER: 'Other',
} as const;

export const MEDIA_TYPE_LABELS = {
  NEWSPAPER_ARTICLE: 'Newspaper Article',
  NEWSPAPER_CLIPPING: 'Newspaper Clipping',
  ONLINE_ARTICLE: 'Online Article',
  INTERVIEW: 'Interview',
  VIDEO: 'Video',
  PHOTO: 'Photo',
  PDF: 'PDF',
  EXTERNAL_REFERENCE: 'External Reference',
} as const;

export const VERIFICATION_STATUS_LABELS = {
  UNVERIFIED: 'Unverified',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
} as const;

export const SOURCE_TYPE_LABELS = {
  NEWSPAPER: 'Newspaper',
  MAGAZINE: 'Magazine',
  ONLINE_PUBLICATION: 'Online Publication',
  BROADCAST: 'Broadcast',
  OFFICIAL_RECORD: 'Official Record',
  CLUB_WEBSITE: 'Club Website',
  INSTITUTIONAL_WEBSITE: 'Institutional Website',
  TOURNAMENT_RECORD: 'Tournament Record',
  OTHER: 'Other',
} as const;

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  CONTENT_ADMIN: 'Content Admin',
  INQUIRY_MANAGER: 'Inquiry Manager',
  ANALYTICS_VIEWER: 'Analytics Viewer',
} as const;

/**
 * Claims that are asserted publicly and still need a documentary source.
 * Seeded into VerificationRecord as UNVERIFIED so the evidence archive starts
 * honest rather than empty.
 */
export const OPEN_CLAIMS: string[] = [
  'Played collegiate cricket for Vaish College.',
  'Played club cricket with Dolphin Club in South Africa.',
  'Played club cricket in Nepal.',
  'Participated in the Norwegian Cup in Norway.',
  'Holds an LLM from Kalinga University.',
  'Founded Red Ball Cricket Ground and has operated it for approximately six years.',
  'Red Ball Cricket Ground has hosted official BCCI Under-14 matches.',
  'Red Ball Cricket Ground has hosted official BCCI Under-16 matches.',
  'Red Ball Cricket Ground has hosted official BCCI Under-19 matches.',
  'More than 50 players who trained or played at the facility have progressed to higher levels.',
  'The ground hosts domestic, Ranji and IPL-level players.',
  'Mohit Rathee is associated with the facility, in a Punjab Kings context.',
  'Nishant Sindhu is associated with the facility, in a Gujarat Titans context.',
  'Founder and owner of The Page.',
  'Founder and owner of Hotel The Prada.',
];
