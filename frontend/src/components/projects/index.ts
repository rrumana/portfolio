import type { AstroComponentFactory } from 'astro/runtime/server';
import GameOfLifeDemo from './GameOfLifeDemo.astro';

export const projectContentMap: Record<string, AstroComponentFactory[]> = {
  'game-of-life': [GameOfLifeDemo],
};
