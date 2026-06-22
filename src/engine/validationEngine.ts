import { Level, PlacedPartState, ValidationResult, Part } from '@/types';

const distance3D = (a: [number, number, number], b: [number, number, number]): number => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const distanceByAxis = (
  a: [number, number, number],
  b: [number, number, number],
  axis: 'x' | 'y' | 'z' | 'all',
): number => {
  if (axis === 'all') return distance3D(a, b);
  const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
  return Math.abs(a[idx] - b[idx]);
};

export const validateOrder = (
  partId: string,
  level: Level,
  placedParts: Map<string, PlacedPartState>,
): ValidationResult => {
  const partIndex = level.assemblyOrder.indexOf(partId);
  if (partIndex === -1) {
    return { passed: false, errorType: 'order', message: '零件不在装配序列中' };
  }

  for (let i = 0; i < partIndex; i++) {
    const prevPartId = level.assemblyOrder[i];
    const prevPart = placedParts.get(prevPartId);
    if (!prevPart || !prevPart.isCorrect) {
      const prevPartInfo = level.parts.find((p) => p.id === prevPartId);
      return {
        passed: false,
        errorType: 'order',
        message: `装配顺序错误：请先安装 ${prevPartInfo?.name || '前置零件'}`,
        hint: `当前零件需在第 ${partIndex + 1} 步安装，前面还有 ${partIndex - i} 个零件未就位`,
        affectedParts: [prevPartId, partId],
      };
    }
  }

  return { passed: true, message: '装配顺序正确' };
};

export const validatePosition = (part: Part, actualPosition: [number, number, number]): ValidationResult => {
  const dist = distance3D(actualPosition, part.targetPosition);

  if (dist <= part.snapTolerance) {
    return { passed: true, message: '位置精度达标' };
  }

  return {
    passed: false,
    errorType: 'position',
    message: `零件位置偏差 ${dist.toFixed(2)} 单位，超出容差 ${part.snapTolerance} 单位`,
    hint: '请将零件拖动到正确位置，蓝色虚影为目标位置',
    affectedParts: [part.id],
  };
};

export const validateSnapConstraints = (
  partId: string,
  level: Level,
  placedParts: Map<string, PlacedPartState>,
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const part = level.parts.find((p) => p.id === partId);
  if (!part) return results;

  const partState = placedParts.get(partId);
  if (!partState) return results;

  const relevantConstraints = level.snapConstraints.filter(
    (c) => c.partA === partId || c.partB === partId,
  );

  for (const constraint of relevantConstraints) {
    const otherPartId = constraint.partA === partId ? constraint.partB : constraint.partA;
    const otherPart = level.parts.find((p) => p.id === otherPartId);
    const otherPartState = placedParts.get(otherPartId);

    if (!otherPart || !otherPartState || !otherPartState.isCorrect) continue;

    const isPartA = constraint.partA === partId;
    const snapPointA = isPartA ? constraint.snapPoints.positionA : constraint.snapPoints.positionB;
    const snapPointB = isPartA ? constraint.snapPoints.positionB : constraint.snapPoints.positionA;

    const worldSnapA: [number, number, number] = [
      partState.position[0] + snapPointA[0],
      partState.position[1] + snapPointA[1],
      partState.position[2] + snapPointA[2],
    ];

    const worldSnapB: [number, number, number] = [
      otherPartState.position[0] + snapPointB[0],
      otherPartState.position[1] + snapPointB[1],
      otherPartState.position[2] + snapPointB[2],
    ];

    const dist = distance3D(worldSnapA, worldSnapB);

    if (dist > constraint.tolerance) {
      results.push({
        passed: false,
        errorType: 'snap',
        message: `卡扣对接偏差 ${dist.toFixed(2)} 单位，超出容差范围`,
        hint: `${part.name} 与 ${otherPart.name} 的卡扣需准确对齐`,
        affectedParts: [partId, otherPartId],
      });
    } else {
      results.push({
        passed: true,
        message: `卡扣对接正常（${part.name} ↔ ${otherPart.name}）`,
      });
    }
  }

  return results;
};

export const validateSpaceConstraints = (
  partId: string,
  level: Level,
  placedParts: Map<string, PlacedPartState>,
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const part = level.parts.find((p) => p.id === partId);
  if (!part) return results;

  const partState = placedParts.get(partId);
  if (!partState) return results;

  const relevantConstraints = level.spaceConstraints.filter(
    (c) => c.partA === partId || c.partB === partId,
  );

  for (const constraint of relevantConstraints) {
    const otherPartId = constraint.partA === partId ? constraint.partB : constraint.partA;
    const otherPartState = placedParts.get(otherPartId);
    const otherPart = level.parts.find((p) => p.id === otherPartId);

    if (!otherPartState || !otherPartState.isCorrect || !otherPart) continue;

    const dist = distanceByAxis(partState.position, otherPartState.position, constraint.axis);

    if (dist < constraint.minDistance) {
      results.push({
        passed: false,
        errorType: 'space',
        message: `空间间距不足：当前 ${dist.toFixed(2)} 单位，最小需要 ${constraint.minDistance} 单位`,
        hint: constraint.description,
        affectedParts: [partId, otherPartId],
      });
    } else if (dist > constraint.maxDistance) {
      results.push({
        passed: false,
        errorType: 'space',
        message: `空间间距过大：当前 ${dist.toFixed(2)} 单位，最大允许 ${constraint.maxDistance} 单位`,
        hint: constraint.description,
        affectedParts: [partId, otherPartId],
      });
    } else {
      results.push({
        passed: true,
        message: `空间间距合规（${part.name} ↔ ${otherPart.name}）`,
      });
    }
  }

  return results;
};

export const validatePartPlacement = (
  partId: string,
  position: [number, number, number],
  rotation: [number, number, number],
  level: Level,
  placedParts: Map<string, PlacedPartState>,
): ValidationResult[] => {
  const results: ValidationResult[] = [];

  const part = level.parts.find((p) => p.id === partId);
  if (!part) {
    return [{ passed: false, message: '零件不存在' }];
  }

  const orderResult = validateOrder(partId, level, placedParts);
  results.push(orderResult);

  if (!orderResult.passed) {
    return results;
  }

  const positionResult = validatePosition(part, position);
  results.push(positionResult);

  if (!positionResult.passed) {
    return results;
  }

  const tempPlacedParts = new Map(placedParts);
  tempPlacedParts.set(partId, { position, rotation, isCorrect: true });

  const snapResults = validateSnapConstraints(partId, level, tempPlacedParts);
  results.push(...snapResults);

  const spaceResults = validateSpaceConstraints(partId, level, tempPlacedParts);
  results.push(...spaceResults);

  return results;
};

export const isAssemblyComplete = (
  level: Level,
  placedParts: Map<string, PlacedPartState>,
): boolean => {
  if (placedParts.size !== level.parts.length) return false;

  for (const part of level.parts) {
    const placed = placedParts.get(part.id);
    if (!placed || !placed.isCorrect) return false;
  }

  return true;
};

export const getCurrentStep = (level: Level, placedParts: Map<string, PlacedPartState>): number => {
  let step = 0;
  for (const partId of level.assemblyOrder) {
    const placed = placedParts.get(partId);
    if (placed && placed.isCorrect) {
      step++;
    } else {
      break;
    }
  }
  return step;
};
