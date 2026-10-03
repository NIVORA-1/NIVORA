/**
 * Discourse Community Integration Configuration
 * 
 * Central configuration for the Nivora Community integration with Discourse.
 * Discourse serves as the hosted, scalable community engine while Nivora provides
 * the native student dashboard and entry point.
 */

export interface CommunityCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  icon: string;
  description: string;
  tagline: string;
  topicsCountEstimate?: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  customPath?: string;
}

export interface StudentActivityHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
}

/**
 * Returns the configured Discourse Community Base URL.
 * Falls back to the default hosted Discourse instance if not provided in environment.
 */
export function getDiscourseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_DISCOURSE_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('your-discourse')) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'https://nivora.discourse.group';
}

/**
 * Builds the external destination URL for a given category.
 * If individual category paths or deep links are configured, they are appended.
 * Otherwise returns the main Discourse community URL safely.
 */
export function getDiscourseCategoryUrl(categoryPathOrSlug?: string): string {
  const baseUrl = getDiscourseUrl();
  if (!categoryPathOrSlug) return baseUrl;

  const cleanPath = categoryPathOrSlug.startsWith('/')
    ? categoryPathOrSlug
    : `/c/${categoryPathOrSlug}`;

  return `${baseUrl}${cleanPath}`;
}

/**
 * Checks whether the Discourse URL is a valid, reachable URL format.
 */
export function isValidDiscourseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * What students can do in the Nivora Discourse Community
 */
export const WHAT_STUDENTS_CAN_DO: StudentActivityHighlight[] = [
  {
    id: 'ask-doubts',
    title: 'Ask Doubts',
    description: 'Get fast, verified answers on challenging coursework problem sets from peers and mentors.',
    icon: 'help_outline',
    badge: 'Academics',
  },
  {
    id: 'study-groups',
    title: 'Join Study Groups',
    description: 'Collaborate with branch peers, sync exam revision schedules, and run Pomodoro deep work rooms.',
    icon: 'groups',
    badge: 'Collaboration',
  },
  {
    id: 'share-projects',
    title: 'Share Projects',
    description: 'Showcase repositories, commit timelines, architectural whitepapers, and get peer feedback.',
    icon: 'rocket_launch',
    badge: 'Showcase',
  },
  {
    id: 'coding-academics',
    title: 'Discuss Coding & Academics',
    description: 'Dive deep into algorithms, systems design, machine learning, robotics, and compiler revisions.',
    icon: 'terminal',
    badge: 'Technical',
  },
  {
    id: 'career-opportunities',
    title: 'Find Career Opportunities',
    description: 'Browse campus placement alerts, off-campus referrals, interview debriefs, and salary trends.',
    icon: 'work_outline',
    badge: 'Placements',
  },
  {
    id: 'connect-students',
    title: 'Connect with Other Students',
    description: 'Meet batchmates, discover research partners across all 5 academic streams, and build your network.',
    icon: 'handshake',
    badge: 'Network',
  },
];

/**
 * The 9 Core Community Categories (Discourse Categories)
 */
export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  {
    id: 'announcements',
    slug: 'announcements',
    name: 'Announcements',
    emoji: '📢',
    icon: 'campaign',
    tagline: 'Official notices & updates',
    description: 'Official university notices, portal maintenance alerts, exam timetables, and campus news.',
    accentColor: '#E85A4F',
    badgeBg: 'bg-primary/10',
    badgeBorder: 'border-primary/30',
    customPath: '/c/announcements',
  },
  {
    id: 'general-discussion',
    slug: 'general-discussion',
    name: 'General Discussion',
    emoji: '💬',
    icon: 'chat',
    tagline: 'Campus lounge & chatter',
    description: 'Campus life, student conversations, peer insights, club meetups, and informal discussions.',
    accentColor: '#D8C3A5',
    badgeBg: 'bg-muted-sand/20',
    badgeBorder: 'border-muted-sand/40',
    customPath: '/c/general-discussion',
  },
  {
    id: 'ask-doubts',
    slug: 'ask-doubts',
    name: 'Ask Doubts',
    emoji: '❓',
    icon: 'help',
    tagline: 'Coursework Q&A',
    description: 'Stuck on an assignment or lecture concept? Post questions with equations, code, or screenshots.',
    accentColor: '#E98074',
    badgeBg: 'bg-coral/10',
    badgeBorder: 'border-coral/30',
    customPath: '/c/ask-doubts',
  },
  {
    id: 'study-groups',
    slug: 'study-groups',
    name: 'Study Groups',
    emoji: '📚',
    icon: 'menu_book',
    tagline: 'Peer circles & sprints',
    description: 'Coordinate semester study circles, shared note repositories, and group problem sets.',
    accentColor: '#8FC5A7',
    badgeBg: 'bg-[#8FC5A7]/10',
    badgeBorder: 'border-[#8FC5A7]/30',
    customPath: '/c/study-groups',
  },
  {
    id: 'coding',
    slug: 'coding',
    name: 'Coding',
    emoji: '💻',
    icon: 'code',
    tagline: 'Languages & algorithms',
    description: 'Algorithms, data structures, competitive programming, debugging, and framework discussions.',
    accentColor: '#64B5F6',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    customPath: '/c/coding',
  },
  {
    id: 'projects',
    slug: 'projects',
    name: 'Projects',
    emoji: '🚀',
    icon: 'construction',
    tagline: 'Repos & proof-of-work',
    description: 'Showcase capstones, hackathon builds, find team members, and request code reviews.',
    accentColor: '#BA68C8',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    customPath: '/c/projects',
  },
  {
    id: 'career-internships',
    slug: 'career-internships',
    name: 'Career & Internships',
    emoji: '💼',
    icon: 'business_center',
    tagline: 'Placements & referrals',
    description: 'Interview debriefs, online assessment patterns, resume critiques, and verified referrals.',
    accentColor: '#FFB74D',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    customPath: '/c/career-internships',
  },
  {
    id: 'exams-preparation',
    slug: 'exams-preparation',
    name: 'Exams & Preparation',
    emoji: '🎓',
    icon: 'school',
    tagline: 'Past papers & notes',
    description: 'Mid-term syllabi breakdown, end-semester archives, professor tip sheets, and revision roadmaps.',
    accentColor: '#4DB6AC',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    customPath: '/c/exams-preparation',
  },
  {
    id: 'connect',
    slug: 'connect',
    name: 'Connect',
    emoji: '🤝',
    icon: 'people',
    tagline: 'Student networking',
    description: 'Peer matchmaking across streams, alumni mentorship, and collaborative project partner discovery.',
    accentColor: '#E85A4F',
    badgeBg: 'bg-deep-coral/10',
    badgeBorder: 'border-deep-coral/30',
    customPath: '/c/connect',
  },
];
