import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import GameOfLifeDemo from './GameOfLifeDemo.astro';
import GameOfLifeProof from './GameOfLifeProof.astro';
import HomelabOverview from './HomelabOverview.astro';
import ReIDPipeline from './ReIDPipeline.astro';
import NeovimConfig from './NeovimConfig.astro';
import PasswordManager from './PasswordManager.astro';
import PortfolioSite from './PortfolioSite.astro';
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
    { id: 'demo', label: 'Playground', component: GameOfLifeDemo, props: { id: 'demo' } },
    {
      id: 'optimizations',
      label: 'Optimizations',
      component: GameOfLifeProof,
      anchors: [
        { id: 'proof', label: 'Proof' },
        { id: 'implementation', label: 'Implementation' },
        { id: 'crates', label: 'Crates and CLI' },
        { id: 'chaos-emergence', label: 'Make Text Emerge From Chaos' },
        { id: 'results-analysis', label: 'Results' },
      ],
    },
  ],
  'kubernetes-homelab': [
    {
      id: 'overview',
      label: 'Overview',
      component: HomelabOverview,
      props: { id: 'overview' },
      anchors: [
        { id: 'architecture', label: 'Architecture' },
        { id: 'operations', label: 'Operations' },
        { id: 'services', label: 'Services' },
        { id: 'resilience', label: 'Resilience' },
      ],
    },
  ],
  'multi-camera-reid': [
    {
      id: 'pipeline',
      label: 'Pipeline',
      component: ReIDPipeline,
      props: { id: 'pipeline' },
      anchors: [
        { id: 'edge-architecture', label: 'Edge Architecture' },
        { id: 'delivery', label: 'Delivery' },
        { id: 'results', label: 'Results' },
      ],
    },
  ],
  'neovim-configuration': [
    { id: 'neovim', label: 'Configuration', component: NeovimConfig, props: { id: 'neovim' } },
  ],
  'random-projects': [
    { id: 'random', label: 'Grab Bag', component: RandomProjects, props: { id: 'random' } },
  ],
  'rust-password-manager': [
    {
      id: 'password-manager',
      label: 'Vault',
      component: PasswordManager,
      props: { id: 'password-manager' },
      anchors: [
        { id: 'crypto', label: 'Crypto' },
        { id: 'api', label: 'API' },
        { id: 'roadmap', label: 'Roadmap' },
      ],
    },
  ],
  'rust-portfolio-website': [
    {
      id: 'portfolio',
      label: 'Platform',
      component: PortfolioSite,
      props: { id: 'portfolio' },
      anchors: [
        { id: 'stack', label: 'Stack' },
        { id: 'delivery', label: 'Delivery' },
        { id: 'features', label: 'Features' },
      ],
    },
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
