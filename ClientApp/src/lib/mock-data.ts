// Mock data for development - replace with API calls later

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
}

export interface MockProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  city: string | null;
  mission_description: string | null;
  avatar_url: string | null;
  social_links: Record<string, string> | null;
  is_public: boolean;
  role_id: number;
  agreed_to_terms_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockAnnouncement {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockCountry {
  id: string;
  code: string;
  name: string;
}

export interface MockRole {
  id: number;
  name: string;
}

// Role constants
export const ROLE_IDS = {
  BASIC: 1,
  DEVOTEE: 2,
  ADMIN: 3,
} as const;

// Demo users for testing
export const mockUsers: MockUser[] = [
  {
    id: 'user-demo-1',
    email: 'demo@example.com',
    user_metadata: { name: 'Demo User' },
  },
  {
    id: 'user-admin-1',
    email: 'admin@example.com',
    user_metadata: { name: 'Admin User' },
  },
];

// Countries list
export const mockCountries: MockCountry[] = [
  { id: '1', code: 'IN', name: 'India' },
  { id: '2', code: 'US', name: 'United States' },
  { id: '3', code: 'GB', name: 'United Kingdom' },
  { id: '4', code: 'AU', name: 'Australia' },
  { id: '5', code: 'CA', name: 'Canada' },
  { id: '6', code: 'DE', name: 'Germany' },
  { id: '7', code: 'FR', name: 'France' },
  { id: '8', code: 'JP', name: 'Japan' },
  { id: '9', code: 'BR', name: 'Brazil' },
  { id: '10', code: 'ZA', name: 'South Africa' },
  { id: '11', code: 'RU', name: 'Russia' },
  { id: '12', code: 'NZ', name: 'New Zealand' },
];

// Roles
export const mockRoles: MockRole[] = [
  { id: 1, name: 'Basic' },
  { id: 2, name: 'Devotee' },
  { id: 3, name: 'Admin' },
];

// Sample profiles
export const mockProfiles: MockProfile[] = [
  {
    id: 'profile-1',
    user_id: 'user-demo-1',
    name: 'Radha Krishna Das',
    email: 'radha.krishna@example.com',
    phone: '+91 98765 43210',
    country: 'India',
    city: 'Mumbai',
    mission_description: 'Spreading the message of Bhagavad Gita through community outreach programs and spiritual retreats.',
    avatar_url: null,
    social_links: { website: 'https://example.com', linkedin: 'https://linkedin.com/in/example' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'profile-2',
    user_id: 'user-2',
    name: 'Govinda Dasi',
    email: 'govinda@example.com',
    phone: '+1 555 123 4567',
    country: 'United States',
    city: 'Los Angeles',
    mission_description: 'Organizing kirtan events and bhakti yoga workshops across the West Coast.',
    avatar_url: null,
    social_links: { instagram: 'https://instagram.com/example' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-02-20T14:30:00Z',
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 'profile-3',
    user_id: 'user-3',
    name: 'Madhava Prabhu',
    email: 'madhava@example.com',
    phone: '+44 7700 900000',
    country: 'United Kingdom',
    city: 'London',
    mission_description: 'Temple management and youth outreach programs in the UK.',
    avatar_url: null,
    social_links: { facebook: 'https://facebook.com/example' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-03-05T09:15:00Z',
    created_at: '2024-03-05T09:15:00Z',
    updated_at: '2024-03-05T09:15:00Z',
  },
  {
    id: 'profile-4',
    user_id: 'user-4',
    name: 'Yamuna Devi',
    email: 'yamuna@example.com',
    phone: '+91 98765 11111',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Teaching Vedic cooking and prasadam distribution.',
    avatar_url: null,
    social_links: null,
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-03-10T11:00:00Z',
    created_at: '2024-03-10T11:00:00Z',
    updated_at: '2024-03-10T11:00:00Z',
  },
  {
    id: 'profile-5',
    user_id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1 555 000 0000',
    country: 'United States',
    city: 'New York',
    mission_description: 'Community administration and platform management.',
    avatar_url: null,
    social_links: null,
    is_public: true,
    role_id: ROLE_IDS.ADMIN,
    agreed_to_terms_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Delhi profiles
  {
    id: 'profile-delhi-1',
    user_id: 'user-delhi-1',
    name: 'Vrindavan Das',
    email: 'vrindavan.das@example.com',
    phone: '+91 98765 22201',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Book distribution and street sankirtan in Delhi NCR region.',
    avatar_url: null,
    social_links: { instagram: 'https://instagram.com/vrindavandas' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-02-01T10:00:00Z',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'profile-delhi-2',
    user_id: 'user-delhi-2',
    name: 'Saraswati Devi',
    email: 'saraswati.devi@example.com',
    phone: '+91 98765 22202',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Bhakti yoga instructor and kirtan leader at ISKCON Delhi.',
    avatar_url: null,
    social_links: { youtube: 'https://youtube.com/@saraswatidevi' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-02-05T11:00:00Z',
    created_at: '2024-02-05T11:00:00Z',
    updated_at: '2024-02-05T11:00:00Z',
  },
  {
    id: 'profile-delhi-3',
    user_id: 'user-delhi-3',
    name: 'Nityananda Prabhu',
    email: 'nityananda@example.com',
    phone: '+91 98765 22203',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Youth preaching and college programs across Delhi universities.',
    avatar_url: null,
    social_links: { linkedin: 'https://linkedin.com/in/nityanandaprabhu' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-02-10T09:00:00Z',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-10T09:00:00Z',
  },
  {
    id: 'profile-delhi-4',
    user_id: 'user-delhi-4',
    name: 'Rukmini Devi',
    email: 'rukmini.devi@example.com',
    phone: '+91 98765 22204',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Deity worship and temple seva coordination.',
    avatar_url: null,
    social_links: null,
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-02-15T08:00:00Z',
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-02-15T08:00:00Z',
  },
  {
    id: 'profile-delhi-5',
    user_id: 'user-delhi-5',
    name: 'Gauranga Das',
    email: 'gauranga.das@example.com',
    phone: '+91 98765 22205',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Bhagavad Gita classes and life coaching for professionals.',
    avatar_url: null,
    social_links: { website: 'https://gaurangadas.com', facebook: 'https://facebook.com/gaurangadas' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-02-20T10:30:00Z',
    created_at: '2024-02-20T10:30:00Z',
    updated_at: '2024-02-20T10:30:00Z',
  },
  {
    id: 'profile-delhi-6',
    user_id: 'user-delhi-6',
    name: 'Tulasi Devi',
    email: 'tulasi.devi@example.com',
    phone: '+91 98765 22206',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Food for Life coordinator - prasadam distribution in slum areas.',
    avatar_url: null,
    social_links: { instagram: 'https://instagram.com/tulasidevi' },
    is_public: true,
    role_id: ROLE_IDS.BASIC,
    agreed_to_terms_at: '2024-02-25T12:00:00Z',
    created_at: '2024-02-25T12:00:00Z',
    updated_at: '2024-02-25T12:00:00Z',
  },
  {
    id: 'profile-delhi-7',
    user_id: 'user-delhi-7',
    name: 'Damodar Prabhu',
    email: 'damodar@example.com',
    phone: '+91 98765 22207',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Temple construction projects and management services.',
    avatar_url: null,
    social_links: { linkedin: 'https://linkedin.com/in/damodarprabhu' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-03-01T09:00:00Z',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 'profile-delhi-8',
    user_id: 'user-delhi-8',
    name: 'Laxmi Devi',
    email: 'laxmi.devi@example.com',
    phone: '+91 98765 22208',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Women\'s spiritual programs and counseling services.',
    avatar_url: null,
    social_links: { facebook: 'https://facebook.com/laxmidevi' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-03-05T11:00:00Z',
    created_at: '2024-03-05T11:00:00Z',
    updated_at: '2024-03-05T11:00:00Z',
  },
  {
    id: 'profile-delhi-9',
    user_id: 'user-delhi-9',
    name: 'Chaitanya Das',
    email: 'chaitanya.das@example.com',
    phone: '+91 98765 22209',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Online preaching and social media outreach for youth.',
    avatar_url: null,
    social_links: { youtube: 'https://youtube.com/@chaitanyadasofficial', instagram: 'https://instagram.com/chaitanyadasofficial' },
    is_public: true,
    role_id: ROLE_IDS.BASIC,
    agreed_to_terms_at: '2024-03-10T10:00:00Z',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z',
  },
  {
    id: 'profile-delhi-10',
    user_id: 'user-delhi-10',
    name: 'Radharani Devi',
    email: 'radharani.devi@example.com',
    phone: '+91 98765 22210',
    country: 'India',
    city: 'Delhi',
    mission_description: 'Children\'s spiritual education and Gurukula programs.',
    avatar_url: null,
    social_links: { website: 'https://delhigurukula.org' },
    is_public: true,
    role_id: ROLE_IDS.DEVOTEE,
    agreed_to_terms_at: '2024-03-15T09:30:00Z',
    created_at: '2024-03-15T09:30:00Z',
    updated_at: '2024-03-15T09:30:00Z',
  },
];

// Sample announcements
export const mockAnnouncements: MockAnnouncement[] = [
  {
    id: 'ann-1',
    user_id: 'user-demo-1',
    title: 'Upcoming Janmashtami Celebration',
    content: 'Join us for the grand celebration of Lord Krishna\'s appearance day. We will have special arati, abhisheka, and prasadam distribution. All devotees are welcome to participate in the festivities.',
    category: 'project',
    status: 'approved',
    admin_notes: null,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'ann-2',
    user_id: 'user-2',
    title: 'Looking for Collaboration on Book Distribution',
    content: 'I am organizing a marathon book distribution event in Los Angeles area. Looking for volunteers and experienced distributors to join the team. We aim to distribute 10,000 books during the holiday season.',
    category: 'collaboration',
    status: 'approved',
    admin_notes: null,
    created_at: '2024-02-15T10:30:00Z',
    updated_at: '2024-02-15T10:30:00Z',
  },
  {
    id: 'ann-3',
    user_id: 'user-3',
    title: 'Relocating to India - Seeking Advice',
    content: 'I am planning to relocate to Vrindavan next year. Would appreciate guidance from devotees who have made similar moves. Looking for information about housing, visa requirements, and daily life.',
    category: 'relocation',
    status: 'approved',
    admin_notes: null,
    created_at: '2024-03-01T15:45:00Z',
    updated_at: '2024-03-01T15:45:00Z',
  },
  {
    id: 'ann-4',
    user_id: 'user-4',
    title: 'Visiting London Temple - April 2024',
    content: 'I will be visiting the London temple in April 2024. Would love to connect with local devotees and perhaps give a cooking class if there is interest.',
    category: 'visiting',
    status: 'pending',
    admin_notes: null,
    created_at: '2024-03-15T12:00:00Z',
    updated_at: '2024-03-15T12:00:00Z',
  },
  {
    id: 'ann-5',
    user_id: 'user-2',
    title: 'New Online Bhagavad Gita Study Group',
    content: 'Starting a weekly online study group for Bhagavad Gita As It Is. Sessions will be held every Sunday at 5 PM PST via Zoom. All levels welcome.',
    category: 'project',
    status: 'approved',
    admin_notes: null,
    created_at: '2024-03-20T09:00:00Z',
    updated_at: '2024-03-20T09:00:00Z',
  },
];
