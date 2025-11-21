import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import GameOfLifeDemo from './GameOfLifeDemo.astro';
import GameOfLifeProof from './GameOfLifeProof.astro';
import HomelabOverview from './HomelabOverview.astro';
import ReIDPipeline from './ReIDPipeline.astro';

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
    { id: 'overview', label: 'Overview', component: HomelabOverview, props: { id: 'overview' } },
  ],
  'multi-camera-reid': [
    { id: 'pipeline', label: 'Pipeline', component: ReIDPipeline, props: { id: 'pipeline' } },
  ],
};
