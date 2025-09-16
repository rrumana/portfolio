import GameOfLifeDemo from './GameOfLifeDemo.astro';
import HomelabOverview from './HomelabOverview.astro';
import ReIDPipeline from './ReIDPipeline.astro';

export const projectContentMap: Record<string, any[]> = {
  'game-of-life': [GameOfLifeDemo],
  'kubernetes-homelab': [HomelabOverview],
  'multi-camera-reid': [ReIDPipeline],
};
