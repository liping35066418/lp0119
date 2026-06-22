import { create } from 'zustand';
import { PlacedPartState, ValidationResult } from '@/types';

interface AssemblyStore {
  placedParts: Map<string, PlacedPartState>;
  selectedPartId: string | null;
  validationResults: ValidationResult[];
  errorCount: number;
  startTime: number | null;
  isComplete: boolean;
  lastErrorTime: number;

  setSelectedPart: (partId: string | null) => void;
  placePart: (partId: string, position: [number, number, number], rotation: [number, number, number], isCorrect: boolean) => void;
  removePart: (partId: string) => void;
  setValidationResults: (results: ValidationResult[]) => void;
  incrementErrorCount: () => void;
  setStartTime: (time: number) => void;
  setComplete: (complete: boolean) => void;
  resetAssembly: () => void;
  getPlacedCount: () => number;
}

export const useAssemblyStore = create<AssemblyStore>((set, get) => ({
  placedParts: new Map(),
  selectedPartId: null,
  validationResults: [],
  errorCount: 0,
  startTime: null,
  isComplete: false,
  lastErrorTime: 0,

  setSelectedPart: (partId) => set({ selectedPartId: partId }),

  placePart: (partId, position, rotation, isCorrect) =>
    set((state) => {
      const newPlacedParts = new Map(state.placedParts);
      newPlacedParts.set(partId, { position, rotation, isCorrect });
      return { placedParts: newPlacedParts };
    }),

  removePart: (partId) =>
    set((state) => {
      const newPlacedParts = new Map(state.placedParts);
      newPlacedParts.delete(partId);
      return { placedParts: newPlacedParts };
    }),

  setValidationResults: (results) => set({ validationResults: results }),

  incrementErrorCount: () =>
    set((state) => ({
      errorCount: state.errorCount + 1,
      lastErrorTime: Date.now(),
    })),

  setStartTime: (time) => set({ startTime: time }),

  setComplete: (complete) => set({ isComplete: complete }),

  resetAssembly: () =>
    set({
      placedParts: new Map(),
      selectedPartId: null,
      validationResults: [],
      errorCount: 0,
      startTime: null,
      isComplete: false,
      lastErrorTime: 0,
    }),

  getPlacedCount: () => {
    const state = get();
    let count = 0;
    state.placedParts.forEach((p) => {
      if (p.isCorrect) count++;
    });
    return count;
  },
}));
