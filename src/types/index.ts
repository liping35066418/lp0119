export type PartGeometryType = 'box' | 'cylinder' | 'sphere' | 'custom';

export interface PartGeometry {
  type: PartGeometryType;
  dimensions: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
}

export interface Part {
  id: string;
  name: string;
  category: string;
  geometry: PartGeometry;
  targetPosition: [number, number, number];
  targetRotation: [number, number, number];
  snapTolerance: number;
  order: number;
}

export interface SnapConstraint {
  id: string;
  partA: string;
  partB: string;
  snapPoints: {
    positionA: [number, number, number];
    positionB: [number, number, number];
  };
  tolerance: number;
}

export interface SpaceConstraint {
  id: string;
  partA: string;
  partB: string;
  minDistance: number;
  maxDistance: number;
  axis: 'x' | 'y' | 'z' | 'all';
  description: string;
}

export type SeriesType = '9919' | '3918';

export interface ShellModel {
  name: string;
  color: string;
  dimensions: [number, number, number];
}

export interface Level {
  id: string;
  name: string;
  series: SeriesType;
  difficulty: number;
  description: string;
  parts: Part[];
  snapConstraints: SnapConstraint[];
  spaceConstraints: SpaceConstraint[];
  assemblyOrder: string[];
  shellModel: ShellModel;
}

export interface PlacedPartState {
  position: [number, number, number];
  rotation: [number, number, number];
  isCorrect: boolean;
}

export interface ValidationResult {
  passed: boolean;
  errorType?: 'order' | 'position' | 'snap' | 'space';
  message: string;
  hint?: string;
  affectedParts?: string[];
}

export type ValidationType = 'order' | 'position' | 'snap' | 'space';

export interface LevelProgress {
  completed: boolean;
  bestTime?: number;
  leastErrors?: number;
  unlocked: boolean;
}

export interface ProgressState {
  levels: Record<string, LevelProgress>;
  totalCompleted: number;
}
