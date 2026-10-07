/**
 * Content access layer. Screens import from here, never from the raw files.
 */
import type { Project } from '@/types';
import { projects } from './projects';

export * from './portfolio';
export * from './projects';
export * from './skills';
export * from './socials';
export * from './experience';
export * from './console';

export const getProjectBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug);
