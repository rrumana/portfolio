import type { AstroComponentFactory } from 'astro/runtime/server';
import GameOfLifeDemo from './GameOfLifeDemo.astro';
import HomelabOverview from './HomelabOverview.astro';
import ReIDPipeline from './ReIDPipeline.astro';

export const projectContentMap: Record<string, AstroComponentFactory[]> = {
  'game-of-life': [GameOfLifeDemo],
  'kubernetes-homelab': [HomelabOverview],
  'multi-camera-reid': [ReIDPipeline],
};
