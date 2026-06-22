import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProgressState, LevelProgress } from '@/types';
import { levels } from '@/data/levels';

interface ProgressStore extends ProgressState {
  initProgress: () => void;
  unlockLevel: (levelId: string) => void;
  completeLevel: (levelId: string, time: number, errors: number) => void;
  isLevelUnlocked: (levelId: string) => boolean;
  isLevelCompleted: (levelId: string) => boolean;
  getLevelProgress: (levelId: string) => LevelProgress | undefined;
  getTotalProgress: () => number;
}

const getInitialProgress = (): ProgressState => {
  const levelProgress: Record<string, LevelProgress> = {};

  levels.forEach((level, index) => {
    levelProgress[level.id] = {
      completed: false,
      unlocked: index === 0,
    };
  });

  return {
    levels: levelProgress,
    totalCompleted: 0,
  };
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...getInitialProgress(),

      initProgress: () => {
        const current = get();
        const initial = getInitialProgress();
        const mergedLevels = { ...initial.levels };

        Object.keys(current.levels).forEach((id) => {
          if (mergedLevels[id]) {
            mergedLevels[id] = { ...mergedLevels[id], ...current.levels[id] };
          }
        });

        set({ levels: mergedLevels });
      },

      unlockLevel: (levelId) =>
        set((state) => {
          const level = state.levels[levelId];
          if (!level || level.unlocked) return state;

          return {
            levels: {
              ...state.levels,
              [levelId]: { ...level, unlocked: true },
            },
          };
        }),

      completeLevel: (levelId, time, errors) =>
        set((state) => {
          const level = state.levels[levelId];
          if (!level) return state;

          const newBestTime = level.bestTime ? Math.min(level.bestTime, time) : time;
          const newLeastErrors = level.leastErrors ? Math.min(level.leastErrors, errors) : errors;

          const levelIndex = levels.findIndex((l) => l.id === levelId);
          const nextLevel = levels[levelIndex + 1];

          const newLevels = {
            ...state.levels,
            [levelId]: {
              ...level,
              completed: true,
              bestTime: newBestTime,
              leastErrors: newLeastErrors,
            },
          };

          if (nextLevel) {
            newLevels[nextLevel.id] = {
              ...newLevels[nextLevel.id],
              unlocked: true,
            };
          }

          const totalCompleted = Object.values(newLevels).filter((l) => l.completed).length;

          return {
            levels: newLevels,
            totalCompleted,
          };
        }),

      isLevelUnlocked: (levelId) => {
        const state = get();
        return state.levels[levelId]?.unlocked ?? false;
      },

      isLevelCompleted: (levelId) => {
        const state = get();
        return state.levels[levelId]?.completed ?? false;
      },

      getLevelProgress: (levelId) => {
        const state = get();
        return state.levels[levelId];
      },

      getTotalProgress: () => {
        const state = get();
        const total = Object.keys(state.levels).length;
        if (total === 0) return 0;
        return (state.totalCompleted / total) * 100;
      },
    }),
    {
      name: 'assembly-progress-storage',
    },
  ),
);
