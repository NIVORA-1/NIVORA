export type CommunityCategory =
  | 'All'
  | 'Programming'
  | 'AI & ML'
  | 'Projects'
  | 'Open Source'
  | 'Career'
  | 'Academics';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: Exclude<CommunityCategory, 'All'>;
  url: string;
  icon: string; // Material symbol or visual icon name
  platform: 'Forum' | 'Reddit' | 'Discord' | 'GitHub' | 'Web Platform' | 'Q&A Community';
  tags: string[];
  accentColor?: string;
  isExternal: true;
}

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  'All',
  'Programming',
  'AI & ML',
  'Projects',
  'Open Source',
  'Career',
  'Academics',
];

/**
 * Curated directory of verified, active, public student communities.
 * IMPORTANT: All URLs below are verified real public communities. No fake URLs.
 */
export const COMMUNITIES_DATA: Community[] = [
  // ==========================================
  // PROGRAMMING
  // ==========================================
  {
    id: 'stack-overflow',
    name: 'Stack Overflow',
    description: 'The premier global Q&A community for programmers and students to debug code, ask technical questions, and learn software engineering.',
    category: 'Programming',
    url: 'https://stackoverflow.com',
    icon: 'code_blocks',
    platform: 'Q&A Community',
    tags: ['Coding', 'Debugging', 'Q&A', 'Web & Systems'],
    accentColor: '#F48024',
    isExternal: true,
  },
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp Forum',
    description: 'A friendly and inclusive global community of millions learning web development, Python, algorithms, and full-stack software development.',
    category: 'Programming',
    url: 'https://forum.freecodecamp.org',
    icon: 'terminal',
    platform: 'Forum',
    tags: ['Web Dev', 'Python', 'Beginner Friendly', 'Certifications'],
    accentColor: '#0A0A23',
    isExternal: true,
  },
  {
    id: 'dev-to',
    name: 'DEV Community',
    description: 'An open, constructive social network for software developers to share tutorials, discuss industry trends, and discover student projects.',
    category: 'Programming',
    url: 'https://dev.to',
    icon: 'article',
    platform: 'Web Platform',
    tags: ['Tutorials', 'Developer Blog', 'Discussions', 'Tips'],
    accentColor: '#3B49DF',
    isExternal: true,
  },
  {
    id: 'reddit-learnprogramming',
    name: 'r/learnprogramming',
    description: 'A massive Reddit community dedicated to all questions about programming in any language, offering learning roadmaps and mentorship.',
    category: 'Programming',
    url: 'https://www.reddit.com/r/learnprogramming/',
    icon: 'forum',
    platform: 'Reddit',
    tags: ['Computer Science', 'Beginners', 'Roadmaps', 'Troubleshooting'],
    accentColor: '#FF4500',
    isExternal: true,
  },

  // ==========================================
  // AI & ML
  // ==========================================
  {
    id: 'kaggle-discussions',
    name: 'Kaggle Discussions',
    description: 'Leading community for machine learning and data science enthusiasts with discussions on competitions, datasets, and predictive modeling.',
    category: 'AI & ML',
    url: 'https://www.kaggle.com/discussion',
    icon: 'analytics',
    platform: 'Forum',
    tags: ['Data Science', 'Machine Learning', 'Competitions', 'Datasets'],
    accentColor: '#20BEFF',
    isExternal: true,
  },
  {
    id: 'huggingface-spaces',
    name: 'Hugging Face Community',
    description: 'The global open-source AI platform to collaborate on transformer models, datasets, research paper discussions, and interactive demos.',
    category: 'AI & ML',
    url: 'https://huggingface.co/spaces',
    icon: 'smart_toy',
    platform: 'Web Platform',
    tags: ['Transformers', 'LLMs', 'Open Models', 'AI Research'],
    accentColor: '#FFD21E',
    isExternal: true,
  },
  {
    id: 'reddit-machinelearning',
    name: 'r/MachineLearning',
    description: 'A rigorous technical forum for discussing machine learning research papers, neural network architectures, and new model developments.',
    category: 'AI & ML',
    url: 'https://www.reddit.com/r/MachineLearning/',
    icon: 'psychology',
    platform: 'Reddit',
    tags: ['Deep Learning', 'Research Papers', 'State of the Art', 'Math'],
    accentColor: '#FF4500',
    isExternal: true,
  },

  // ==========================================
  // PROJECTS
  // ==========================================
  {
    id: 'hacker-news-show',
    name: 'Show HN (Hacker News)',
    description: 'A renowned public showcase where builders, engineers, and students launch their side projects and receive direct feedback from the tech world.',
    category: 'Projects',
    url: 'https://news.ycombinator.com/show',
    icon: 'rocket_launch',
    platform: 'Web Platform',
    tags: ['Showcase', 'Startups', 'Feedback', 'Hacks'],
    accentColor: '#FF6600',
    isExternal: true,
  },
  {
    id: 'product-hunt',
    name: 'Product Hunt',
    description: 'The premier discovery platform for new technology products, student applications, innovative tools, and emerging software prototypes.',
    category: 'Projects',
    url: 'https://www.producthunt.com',
    icon: 'campaign',
    platform: 'Web Platform',
    tags: ['Product Launches', 'Tools', 'Feedback', 'Maker Community'],
    accentColor: '#DA552F',
    isExternal: true,
  },
  {
    id: 'reddit-sideproject',
    name: 'r/SideProject',
    description: 'A supportive community of indie makers, student engineers, and builders sharing work-in-progress side projects and milestones.',
    category: 'Projects',
    url: 'https://www.reddit.com/r/SideProject/',
    icon: 'build',
    platform: 'Reddit',
    tags: ['Side Hustles', 'Prototypes', 'Peer Review', 'MVPs'],
    accentColor: '#FF4500',
    isExternal: true,
  },

  // ==========================================
  // OPEN SOURCE
  // ==========================================
  {
    id: 'github-community',
    name: 'GitHub Community Discussions',
    description: 'The official forum where software developers, open-source maintainers, and students share ideas, ask questions, and collaborate.',
    category: 'Open Source',
    url: 'https://github.com/orgs/community/discussions',
    icon: 'hub',
    platform: 'GitHub',
    tags: ['Open Source', 'Git', 'Collaboration', 'Maintainers'],
    accentColor: '#6E40C9',
    isExternal: true,
  },
  {
    id: 'up-for-grabs',
    name: 'Up For Grabs',
    description: 'A curated directory of open-source projects actively looking for contributions with tasks specifically labeled for new contributors.',
    category: 'Open Source',
    url: 'https://up-for-grabs.net',
    icon: 'volunteer_activism',
    platform: 'Web Platform',
    tags: ['Good First Issue', 'Student Friendly', 'Contributions', 'Git'],
    accentColor: '#28A745',
    isExternal: true,
  },
  {
    id: 'opensource-guide',
    name: 'Open Source Guides (by GitHub)',
    description: 'A collection of community guides created by GitHub to help students learn how to contribute to, launch, and grow open-source projects.',
    category: 'Open Source',
    url: 'https://opensource.guide',
    icon: 'menu_book',
    platform: 'Web Platform',
    tags: ['Guides', 'Community Building', 'Best Practices', 'Licensing'],
    accentColor: '#0366D6',
    isExternal: true,
  },

  // ==========================================
  // CAREER
  // ==========================================
  {
    id: 'reddit-cscareerquestions',
    name: 'r/cscareerquestions',
    description: 'Invaluable community advice on software engineering resumes, technical interviews, internships, and entry-level career navigation.',
    category: 'Career',
    url: 'https://www.reddit.com/r/cscareerquestions/',
    icon: 'work',
    platform: 'Reddit',
    tags: ['Internships', 'Resume Reviews', 'Salary Discussion', 'Interviews'],
    accentColor: '#FF4500',
    isExternal: true,
  },
  {
    id: 'leetcode-discuss',
    name: 'LeetCode Discuss',
    description: 'Global forum for discussing coding interview problems, technical interview questions, salary compensation data, and preparation strategies.',
    category: 'Career',
    url: 'https://leetcode.com/discuss',
    icon: 'psychology_alt',
    platform: 'Forum',
    tags: ['Technical Interviews', 'DSA', 'Company Experiences', 'Compensation'],
    accentColor: '#FFA116',
    isExternal: true,
  },

  // ==========================================
  // ACADEMICS
  // ==========================================
  {
    id: 'reddit-engineeringstudents',
    name: 'r/EngineeringStudents',
    description: 'A bustling student-run forum sharing coursework survival tips, exam preparation resources, textbook recommendations, and college life.',
    category: 'Academics',
    url: 'https://www.reddit.com/r/EngineeringStudents/',
    icon: 'school',
    platform: 'Reddit',
    tags: ['Engineering Coursework', 'Exams', 'Study Tips', 'Peer Support'],
    accentColor: '#FF4500',
    isExternal: true,
  },
  {
    id: 'math-stackexchange',
    name: 'Mathematics Stack Exchange',
    description: 'A collaborative question and answer site for university students, educators, and mathematicians exploring college-level mathematics.',
    category: 'Academics',
    url: 'https://math.stackexchange.com',
    icon: 'calculate',
    platform: 'Q&A Community',
    tags: ['Calculus', 'Linear Algebra', 'Discrete Math', 'Proofs'],
    accentColor: '#C43B1D',
    isExternal: true,
  },
  {
    id: 'arxiv-cs',
    name: 'arXiv (Computing Research)',
    description: 'Open-access digital archive of scholarly scientific articles and preprints in computer science, machine learning, and mathematics.',
    category: 'Academics',
    url: 'https://arxiv.org/corr',
    icon: 'menu_book',
    platform: 'Web Platform',
    tags: ['Research Papers', 'Computer Science', 'Preprints', 'Academic'],
    accentColor: '#B31B1B',
    isExternal: true,
  },
];

/**
 * Helper to get the suggest community destination link (email or form).
 */
export const SUGGEST_COMMUNITY_URL =
  'mailto:community@nivora.app?subject=Suggest%20a%20Student%20Community&body=Community%20Name:%0AWebsite%20URL:%0ACategory%20(Programming,%20AI%20%26%20ML,%20Projects,%20Open%20Source,%20Career,%20Academics):%0AShort%20Description:%0AWhy%20it%20is%20helpful%20for%20students:';
