import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import GameOfLifeDemo from './GameOfLifeDemo.astro';
import HomelabOverview from './HomelabOverview.astro';
import NeovimConfig from './NeovimConfig.astro';
import LectureSeries from './LectureSeries.astro';
import RandomProjects from './RandomProjects.astro';

export interface SectionAnchor {
  id: string;
  label: string;
}

export interface ProjectSection {
  id: string;
  label: string;
  component: AstroComponentFactory;
  props?: Record<string, unknown>;
  anchors?: SectionAnchor[];
}

export const projectContentMap: Record<string, ProjectSection[]> = {
  'game-of-life': [
    { id: 'playground', label: 'Playground', component: GameOfLifeDemo, props: { id: 'playground' } },
  ],
  'kubernetes-homelab': [
    {
      id: 'platform-map',
      label: 'Platform map',
      component: HomelabOverview,
      props: { id: 'platform-map' },
    },
  ],
  'neovim-configuration': [
    { id: 'neovim', label: 'Configuration', component: NeovimConfig, props: { id: 'neovim' } },
  ],
  'random-projects': [
    { id: 'random', label: 'Grab bag', component: RandomProjects, props: { id: 'random' } },
  ],
  'rust-programming-lecture-series': [
    {
      id: 'lecture',
      label: 'Lecture',
      component: LectureSeries,
      props: { id: 'lecture' },
      anchors: [
        { id: 'format', label: 'Format' },
        { id: 'curriculum', label: 'Curriculum' },
        { id: 'status', label: 'Status' },
      ],
    },
  ],
};
