import { Level } from '@/types';
import { level9919 } from './level9919';
import { level3918 } from './level3918';

export const levels: Level[] = [level9919, level3918];

export const getLevelById = (id: string): Level | undefined => {
  return levels.find((level) => level.id === id);
};

export const getLevelsBySeries = (series: '9919' | '3918'): Level[] => {
  return levels.filter((level) => level.series === series);
};
