/**
 * Console layer.
 *
 * Maps the portfolio content onto the PS4 home-screen vocabulary: tiles in the
 * content row, info cards under the selected tile, and the function bar above
 * it. Components render these shapes and never reach into the raw arrays.
 */
import type { Project, Skill, SkillCategory } from '@/types';
import { education, profile } from './portfolio';
import { experiences } from './experience';
import { featuredProjects, projects } from './projects';
import { skillCategories, skills } from './skills';

export interface InfoCard {
  id: string;
  title: string;
  body?: string;
  image?: string;
  icon?: string;
  /** Internal route opened on ✕. */
  to?: string;
  /** External link opened on ✕. */
  href?: string;
}

export type TileKind = 'whats-new' | 'project' | 'library' | 'trophies' | 'profile' | 'resume';

export interface HomeTile {
  id: string;
  kind: TileKind;
  title: string;
  subtitle: string;
  image?: string;
  icon?: string;
  to?: string;
  href?: string;
  startLabel: string;
  cards: InfoCard[];
}

export interface FunctionItem {
  id: string;
  label: string;
  icon: string;
  to?: string;
  action?: 'power';
}

// ── Trophies ─────────────────────────────────────────────────────────────

export type TrophyTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export const trophyTier = (skill: Skill): TrophyTier =>
  skill.level >= 95 ? 'platinum' : skill.level >= 88 ? 'gold' : skill.level >= 80 ? 'silver' : 'bronze';

export const trophyCounts = (list: Skill[] = skills) =>
  list.reduce(
    (acc, skill) => {
      acc[trophyTier(skill)] += 1;
      return acc;
    },
    { platinum: 0, gold: 0, silver: 0, bronze: 0 } as Record<TrophyTier, number>,
  );

export interface TrophyGroup {
  category: SkillCategory;
  skills: Skill[];
  progress: number;
}

export const trophyGroups: TrophyGroup[] = skillCategories
  .map((category) => {
    const list = skills.filter((skill) => skill.category === category);
    const progress = list.length
      ? Math.round(list.reduce((sum, skill) => sum + skill.level, 0) / list.length)
      : 0;
    return { category, skills: list, progress };
  })
  .filter((group) => group.skills.length > 0);

const yearsActive = new Date().getFullYear() - Number(profile.experienceSince);

export const trophyLevel = {
  level: Math.max(yearsActive, 1),
  progress: Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length),
};

// ── Formatting ───────────────────────────────────────────────────────────

const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

export const formatMonth = (iso: string | null) => (iso ? monthFormat.format(new Date(iso)) : 'Present');

export const statusLabel: Record<Project['status'], string> = {
  live: 'Live',
  'in-progress': 'In progress',
  archived: 'Archived',
  concept: 'Concept',
};

export const projectsByYear = [...projects].sort(
  (a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title),
);

// ── Home content row ─────────────────────────────────────────────────────

const projectTile = (project: Project): HomeTile => {
  const website = project.links.website ?? project.links.demo;
  const cards: InfoCard[] = [
    {
      id: `${project.slug}-gallery`,
      title: 'Screenshots',
      body: `${project.contentImage.length} capture${project.contentImage.length === 1 ? '' : 's'}`,
      image: project.contentImage[1] ?? project.coverImage,
      to: `/project/${project.slug}`,
    },
    {
      id: `${project.slug}-role`,
      title: project.role,
      body: `${project.category} · ${project.year} · ${statusLabel[project.status]}`,
      icon: 'BadgeInfo',
      to: `/project/${project.slug}`,
    },
    {
      id: `${project.slug}-stack`,
      title: 'Tech stack',
      body: project.techStack.join(' · '),
      icon: 'Cpu',
      to: `/project/${project.slug}`,
    },
  ];

  if (website) {
    cards.push({
      id: `${project.slug}-site`,
      title: 'Visit website',
      body: website.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      icon: 'ExternalLink',
      href: website,
    });
  }

  return {
    id: project.slug,
    kind: 'project',
    title: project.title,
    subtitle: project.shortDescription,
    image: project.thumbnail,
    to: `/project/${project.slug}`,
    startLabel: 'Start',
    cards,
  };
};

const counts = trophyCounts();
const current = experiences[0];

export const homeTiles: HomeTile[] = [
  {
    id: 'whats-new',
    kind: 'whats-new',
    title: "What's New",
    subtitle: 'Career activity — roles, achievements, and education.',
    icon: 'Sparkles',
    to: '/whats-new',
    startLabel: 'Open',
    cards: [
      ...experiences.slice(0, 2).map((exp) => ({
        id: `wn-${exp.id}`,
        title: `${exp.role} @ ${exp.company}`,
        body: `${formatMonth(exp.startDate)} — ${formatMonth(exp.endDate)}`,
        icon: 'Briefcase',
        to: '/whats-new',
      })),
      {
        id: `wn-${education[0].id}`,
        title: education[0].degree,
        body: education[0].institution,
        icon: 'GraduationCap',
        to: '/whats-new',
      },
    ],
  },
  ...featuredProjects.map(projectTile),
  {
    id: 'library',
    kind: 'library',
    title: 'Library',
    subtitle: 'Every project, sorted by category.',
    icon: 'LayoutGrid',
    to: '/library',
    startLabel: 'Open',
    cards: [
      {
        id: 'lib-all',
        title: `${projects.length} projects`,
        body: `${new Set(projects.map((p) => p.category)).size} categories`,
        icon: 'Gamepad2',
        to: '/library',
      },
      ...projectsByYear.slice(0, 2).map((project) => ({
        id: `lib-${project.slug}`,
        title: project.title,
        body: `Added ${project.year}`,
        image: project.thumbnail,
        to: `/project/${project.slug}`,
      })),
    ],
  },
  {
    id: 'trophies',
    kind: 'trophies',
    title: 'Trophies',
    subtitle: 'Skills and tools, ranked by proficiency.',
    icon: 'Trophy',
    to: '/trophies',
    startLabel: 'Open',
    cards: [
      {
        id: 'tr-level',
        title: `Level ${trophyLevel.level}`,
        body: `${skills.length} trophies · ${counts.platinum} platinum · ${counts.gold} gold`,
        icon: 'Trophy',
        to: '/trophies',
      },
      ...skills
        .filter((s) => s.featured)
        .sort((a, b) => b.level - a.level)
        .slice(0, 2)
        .map((skill) => ({
          id: `tr-${skill.id}`,
          title: skill.name,
          body: `${skill.level}% · ${skill.years}+ yrs`,
          icon: skill.icon,
          to: '/trophies',
        })),
    ],
  },
  {
    id: 'profile',
    kind: 'profile',
    title: profile.headline,
    subtitle: profile.title,
    image: profile.avatar,
    to: '/profile',
    startLabel: 'View profile',
    cards: [
      {
        id: 'pf-status',
        title: profile.available ? 'Online' : 'Away',
        body: profile.availability,
        icon: 'Radio',
        to: '/profile',
      },
      {
        id: 'pf-career',
        title: 'Career',
        body: `${current.role} @ ${current.company}`,
        icon: 'Briefcase',
        to: '/profile?tab=career',
      },
      {
        id: 'pf-msg',
        title: 'Send a message',
        body: profile.email,
        icon: 'MessageSquare',
        to: '/messages',
      },
    ],
  },
  {
    id: 'resume',
    kind: 'resume',
    title: 'Resume',
    subtitle: 'Download the full CV as a PDF.',
    icon: 'FileText',
    href: profile.resumeUrl,
    startLabel: 'Open PDF',
    cards: [
      {
        id: 'rs-pdf',
        title: 'Azra-Yazid-resume.pdf',
        body: 'Opens in a new tab',
        icon: 'Download',
        href: profile.resumeUrl,
      },
    ],
  },
];

export const functionItems: FunctionItem[] = [
  { id: 'notifications', label: 'Notifications', icon: 'Bell', to: '/notifications' },
  { id: 'friends', label: 'Friends', icon: 'Users', to: '/friends' },
  { id: 'messages', label: 'Messages', icon: 'MessageSquare', to: '/messages' },
  { id: 'profile', label: 'Profile', icon: 'UserRound', to: '/profile' },
  { id: 'trophies', label: 'Trophies', icon: 'Trophy', to: '/trophies' },
  { id: 'settings', label: 'Settings', icon: 'Settings', to: '/settings' },
  { id: 'power', label: 'Power', icon: 'Power', action: 'power' },
];
