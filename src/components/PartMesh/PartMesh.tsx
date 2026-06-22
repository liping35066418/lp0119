import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Part } from '@/types';

interface PartMeshProps {
  part: Part;
  position: [number, number, number];
  rotation?: [number, number, number];
  isGhost?: boolean;
  isSelected?: boolean;
  isCorrect?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: any) => void;
  onPointerUp?: (e: any) => void;
}

export default function PartMesh({
  part,
  position,
  rotation = [0, 0, 0],
  isGhost = false,
  isSelected = false,
  isCorrect = false,
  onClick,
  onPointerDown,
  onPointerUp,
}: PartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.position.y = position[1] + 0.02;
      }
    }
  });

  const getColor = () => {
    if (isGhost) return part.geometry.color;
    if (isCorrect) return part.geometry.color;
    return part.geometry.color;
  };

  const getOpacity = () => {
    if (isGhost) return 0.3;
    return 1;
  };

  const renderGeometry = () => {
    const { type, dimensions } = part.geometry;
    const [w, h, d] = dimensions;

    switch (type) {
      case 'box':
        return <boxGeometry args={[w, h, d]} />;
      case 'cylinder':
        return <cylinderGeometry args={[w / 2, w / 2, h, 32]} />;
      case 'sphere':
        return <sphereGeometry args={[w / 2, 32, 32]} />;
      default:
        return <boxGeometry args={[w, h, d]} />;
    }
  };

  const metalness = part.geometry.metalness ?? 0.5;
  const roughness = part.geometry.roughness ?? 0.5;

  return (
    <group position={position} rotation={rotation as any}>
      {isSelected && (
        <mesh>
          {part.geometry.type === 'box' && (
            <boxGeometry args={[
              part.geometry.dimensions[0] * 1.1,
              part.geometry.dimensions[1] * 1.1,
              part.geometry.dimensions[2] * 1.1,
            ]} />
          )}
          {part.geometry.type === 'cylinder' && (
            <cylinderGeometry args={[
              part.geometry.dimensions[0] / 2 * 1.15,
              part.geometry.dimensions[0] / 2 * 1.15,
              part.geometry.dimensions[1] * 1.1,
              32,
            ]} />
          )}
          <meshBasicMaterial
            color="#00D4FF"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={getColor()}
          transparent={isGhost || hovered}
          opacity={getOpacity()}
          metalness={metalness}
          roughness={roughness}
          emissive={isSelected ? '#00D4FF' : hovered ? '#1a365d' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
        />
      </mesh>

      {isCorrect && (
        <mesh position={[0, part.geometry.dimensions[1] / 2 + 0.1, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#00C9A7" />
        </mesh>
      )}
    </group>
  );
}
