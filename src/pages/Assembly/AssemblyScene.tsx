import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Part, Level } from '@/types';
import { useAssemblyStore } from '@/store/useAssemblyStore';
import { validatePartPlacement, isAssemblyComplete, getCurrentStep } from '@/engine/validationEngine';

interface SceneProps {
  level: Level;
  onValidation: (results: any[]) => void;
  onAssemblyComplete: () => void;
}

function PartMesh({
  part,
  position,
  isDragging,
  isPlaced,
  isCorrect,
  onPointerDown,
  onPointerUp,
  showGhost,
}: {
  part: Part;
  position: [number, number, number];
  isDragging: boolean;
  isPlaced: boolean;
  isCorrect: boolean;
  onPointerDown: (e: any) => void;
  onPointerUp: (e: any) => void;
  showGhost?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const renderGeometry = useCallback(() => {
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
  }, [part.geometry]);

  const metalness = part.geometry.metalness ?? 0.5;
  const roughness = part.geometry.roughness ?? 0.5;

  if (showGhost) {
    return (
      <mesh position={part.targetPosition} rotation={part.targetRotation as any}>
        {renderGeometry()}
        <meshStandardMaterial
          color="#00D4FF"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

  return (
    <group position={position}>
      {(hovered || isDragging) && !isCorrect && (
        <mesh position={[0, 0.01, 0]}>
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
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
      )}

      <mesh
        ref={meshRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOver={() => {
          setHovered(true);
          if (!isDragging) document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          setHovered(false);
          if (!isDragging) document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={part.geometry.color}
          metalness={metalness}
          roughness={roughness}
          emissive={isCorrect ? '#00C9A7' : hovered || isDragging ? '#00D4FF' : '#000000'}
          emissiveIntensity={isCorrect ? 0.1 : hovered || isDragging ? 0.2 : 0}
          transparent={isDragging}
          opacity={isDragging ? 0.85 : 1}
        />
      </mesh>

      {isCorrect && (
        <mesh position={[0, part.geometry.dimensions[1] / 2 + 0.2, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#00C9A7" />
        </mesh>
      )}
    </group>
  );
}

function SceneContent({ level, onValidation, onAssemblyComplete }: SceneProps) {
  const { placedParts, placePart, setSelectedPart, incrementErrorCount, startTime, setStartTime } = useAssemblyStore();
  const { camera, raycaster, pointer } = useThree();
  
  const [draggingPartId, setDraggingPartId] = useState<string | null>(null);
  const [dragPositions, setDragPositions] = useState<Map<string, [number, number, number]>>(new Map());
  const planeRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetHeightRef = useRef<number>(0);

  const currentStep = getCurrentStep(level, placedParts);

  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    const initialPositions = new Map<string, [number, number, number]>();
    level.parts.forEach((part, index) => {
      initialPositions.set(part.id, [
        6 + (index % 2) * 2,
        part.geometry.dimensions[1] / 2 + 0.5,
        -3 + Math.floor(index / 2) * 1.5,
      ]);
    });
    setDragPositions(initialPositions);
  }, [level, startTime, setStartTime]);

  useFrame(() => {
    if (draggingPartId) {
      raycaster.setFromCamera(pointer, camera);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeRef.current, intersectPoint);

      if (intersectPoint) {
        const part = level.parts.find((p) => p.id === draggingPartId);
        if (part) {
          const newPos: [number, number, number] = [
            intersectPoint.x + dragOffsetRef.current.x,
            intersectPoint.y + dragOffsetRef.current.y,
            intersectPoint.z + dragOffsetRef.current.z,
          ];

          setDragPositions((prev) => {
            const newMap = new Map(prev);
            newMap.set(draggingPartId, newPos);
            return newMap;
          });
        }
      }
    }
  });

  const handlePointerDown = (partId: string, e: any) => {
    e.stopPropagation();
    
    const part = level.parts.find((p) => p.id === partId);
    if (!part) return;

    const orderIndex = level.assemblyOrder.indexOf(partId);
    if (orderIndex > currentStep) {
      return;
    }

    const placed = placedParts.get(partId);
    if (placed?.isCorrect) {
      return;
    }

    const targetHeight = part.targetPosition[1];
    targetHeightRef.current = targetHeight;

    planeRef.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, targetHeight, 0),
    );

    const currentPos = dragPositions.get(partId) || part.targetPosition;
    
    raycaster.setFromCamera(pointer, camera);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeRef.current, intersectPoint);

    if (intersectPoint) {
      dragOffsetRef.current.set(
        currentPos[0] - intersectPoint.x,
        currentPos[1] - intersectPoint.y,
        currentPos[2] - intersectPoint.z,
      );
    }

    setDraggingPartId(partId);
    setSelectedPart(partId);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerUp = (partId: string, e: any) => {
    e.stopPropagation();
    
    if (draggingPartId === partId) {
      setDraggingPartId(null);
      document.body.style.cursor = 'auto';

      const currentPos = dragPositions.get(partId);
      if (!currentPos) return;

      const part = level.parts.find((p) => p.id === partId);
      if (!part) return;

      const results = validatePartPlacement(
        partId,
        currentPos,
        [0, 0, 0],
        level,
        placedParts,
      );

      const hasErrors = results.some((r) => !r.passed);

      if (!hasErrors) {
        placePart(partId, part.targetPosition, [0, 0, 0], true);
        setDragPositions((prev) => {
          const newMap = new Map(prev);
          newMap.set(partId, [...part.targetPosition] as [number, number, number]);
          return newMap;
        });

        const newPlacedParts = new Map(placedParts);
        newPlacedParts.set(partId, { position: part.targetPosition, rotation: [0, 0, 0], isCorrect: true });

        if (isAssemblyComplete(level, newPlacedParts)) {
          setTimeout(() => onAssemblyComplete(), 500);
        }
      } else {
        incrementErrorCount();
        onValidation(results);
        
        const initialPos: [number, number, number] = [
          6 + (level.parts.findIndex((p) => p.id === partId) % 2) * 2,
          part.geometry.dimensions[1] / 2 + 0.5,
          -3 + Math.floor(level.parts.findIndex((p) => p.id === partId) / 2) * 1.5,
        ];
        
        setDragPositions((prev) => {
          const newMap = new Map(prev);
          newMap.set(partId, initialPos);
          return newMap;
        });
      }
    }
  };

  const getPartStatus = (partId: string): 'placed' | 'current' | 'locked' => {
    const placed = placedParts.get(partId);
    if (placed?.isCorrect) return 'placed';
    const orderIndex = level.assemblyOrder.indexOf(partId);
    if (orderIndex === currentStep) return 'current';
    if (orderIndex > currentStep) return 'locked';
    return 'current';
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#88aaff" />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#00D4FF" />
      <pointLight position={[-8, 3, -8]} intensity={0.3} color="#4488ff" />

      <Grid
        position={[0, 0, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a365d"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#00D4FF"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      <mesh position={[7, 0.05, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial color="#1a202c" transparent opacity={0.6} />
      </mesh>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4}
      />

      {level.parts.filter((p) => getPartStatus(p.id) !== 'placed').map((part) => (
        <PartMesh
          key={`ghost-${part.id}`}
          part={part}
          position={part.targetPosition}
          isDragging={false}
          isPlaced={false}
          isCorrect={false}
          onPointerDown={() => {}}
          onPointerUp={() => {}}
          showGhost={true}
        />
      ))}

      {level.parts.map((part) => {
        const status = getPartStatus(part.id);
        const isPlaced = status === 'placed';
        const position = dragPositions.get(part.id) || part.targetPosition;
        const isDragging = draggingPartId === part.id;

        return (
          <PartMesh
            key={part.id}
            part={part}
            position={isPlaced ? part.targetPosition : position}
            isDragging={isDragging}
            isPlaced={isPlaced}
            isCorrect={isPlaced}
            onPointerDown={(e: any) => handlePointerDown(part.id, e)}
            onPointerUp={(e: any) => handlePointerUp(part.id, e)}
            showGhost={false}
          />
        );
      })}

      <Html position={[7, 4, -1]} center>
        <div className="bg-metal-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-metal-600 text-center">
          <p className="text-xs text-metal-400 font-display">待装配区</p>
        </div>
      </Html>

      <Html position={[0, 4, 0]} center>
        <div className="bg-tech-500/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-tech-500/50 text-center">
          <p className="text-xs text-tech-300 font-display">装配区</p>
        </div>
      </Html>

      <OrbitControls
        makeDefault
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={5}
        maxDistance={25}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />

      <fog attach="fog" args={['#071019', 20, 40]} />
    </>
  );
}

export default function AssemblyScene({ level, onValidation, onAssemblyComplete }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [10, 7, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'linear-gradient(180deg, #071019 0%, #0d1a2b 100%)' }}
    >
      <SceneContent level={level} onValidation={onValidation} onAssemblyComplete={onAssemblyComplete} />
    </Canvas>
  );
}
