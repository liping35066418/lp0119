import { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import { Trophy, Clock, AlertTriangle, ArrowLeft, RotateCcw, ChevronRight, Star } from 'lucide-react';
import { getLevelById, levels } from '@/data/levels';
import { useProgressStore } from '@/store/useProgressStore';
import { useAssemblyStore } from '@/store/useAssemblyStore';
import { getLevelStats } from '@/engine/validationEngine';

function ShellModel({ color, dimensions }: { color: string; dimensions: [number, number, number] }) {
  const groupRef = useRef<any>(null);
  const [w, h, d] = dimensions;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, h / 2 - 0.05, 0]}>
        <boxGeometry args={[w * 0.9, 0.1, d * 0.9]} />
        <meshStandardMaterial
          color="#1a202c"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[w * 0.3, 0, d / 2 + 0.01]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function Success() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const level = getLevelById(levelId || '');
  const { getLevelProgress, totalCompleted } = useProgressStore();
  const { errorCount, startTime, resetAssembly } = useAssemblyStore();
  const progress = getLevelProgress(levelId || '');

  const elapsedTime = progress?.bestTime || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreStars = () => {
    if (!progress?.bestTime || !level) return 0;
    const baseTime = getLevelStats(level).assemblySteps * 15;
    const ratio = progress.bestTime / baseTime;
    if (ratio <= 0.6 && errorCount === 0) return 3;
    if (ratio <= 1 && errorCount <= 2) return 2;
    return 1;
  };

  const stars = getScoreStars();

  const handleBack = () => {
    resetAssembly();
    navigate('/');
  };

  const handleRetry = () => {
    resetAssembly();
    navigate(`/assembly/${levelId}`);
  };

  const handleNext = () => {
    resetAssembly();
    const currentIndex = levels.findIndex((l) => l.id === levelId);
    if (currentIndex < levels.length - 1) {
      navigate(`/assembly/${levels[currentIndex + 1].id}`);
    } else {
      navigate('/');
    }
  };

  if (!level) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-industrial-950">
        <p className="text-metal-400">关卡不存在</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-industrial-950 overflow-hidden relative">
      <div className="fixed inset-0 bg-grid-pattern bg-grid-40 opacity-20 pointer-events-none" />
      
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-metal-800/80 backdrop-blur-sm border border-metal-700 text-metal-300 hover:text-white hover:border-metal-600 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回关卡</span>
      </motion.button>

      <div className="h-full flex">
        <div className="flex-1 relative">
          <Canvas
            shadows
            camera={{ position: [5, 4, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-3, 2, -3]} intensity={0.5} color="#00D4FF" />
            <pointLight position={[3, 2, 3]} intensity={0.3} color="#00C9A7" />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <ShellModel
                color={level.shellModel.color}
                dimensions={level.shellModel.dimensions}
              />
            </Float>

            <ContactShadows
              position={[0, -level.shellModel.dimensions[1] / 2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />

            <OrbitControls
              makeDefault
              enablePan={false}
              minDistance={4}
              maxDistance={12}
              autoRotate
              autoRotateSpeed={0.5}
            />

            <fog attach="fog" args={['#071019', 10, 25]} />
          </Canvas>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-xs text-metal-500 mb-2">360° 旋转查看</p>
              <p className="font-display text-lg font-semibold text-tech-400">
                {level.shellModel.name}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="w-96 bg-metal-gradient border-l border-metal-700 flex flex-col p-8 z-10">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success-500 to-success-700 flex items-center justify-center shadow-glow-green">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">装配完成!</h1>
                <p className="text-sm text-metal-400">{level.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 justify-center py-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                >
                  <Star
                    className={`w-10 h-10 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-metal-700'}`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-8"
          >
            <div className="p-4 rounded-xl bg-metal-800/50 border border-metal-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tech-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-tech-400" />
                  </div>
                  <div>
                    <p className="text-xs text-metal-500">用时</p>
                    <p className="font-display text-xl font-bold text-white">
                      {formatTime(elapsedTime)}
                    </p>
                  </div>
                </div>
                {progress?.bestTime && (
                  <div className="text-right">
                    <p className="text-xs text-metal-500">最佳</p>
                    <p className="font-display text-sm font-semibold text-tech-400">
                      {formatTime(progress.bestTime)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-metal-800/50 border border-metal-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <p className="text-xs text-metal-500">错误次数</p>
                    <p className="font-display text-xl font-bold text-white">
                      {errorCount}
                    </p>
                  </div>
                </div>
                {progress?.leastErrors !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-metal-500">最少</p>
                    <p className="font-display text-sm font-semibold text-warning-400">
                      {progress.leastErrors} 次
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-metal-800/50 border border-metal-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <p className="text-xs text-metal-500">零件数</p>
                    <p className="font-display text-xl font-bold text-white">
                      {getLevelStats(level).assemblySteps} 个
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-metal-500">完成度</p>
                  <p className="font-display text-sm font-semibold text-success-400">
                    100%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex-1 flex flex-col justify-end space-y-3"
          >
            <button
              onClick={handleRetry}
              className="w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 bg-metal-700 text-white hover:bg-metal-600 transition-colors border border-metal-600"
            >
              <RotateCcw className="w-5 h-5" />
              再次练习
            </button>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-tech-500 to-success-500 text-white hover:shadow-lg hover:shadow-glow-cyan transition-all"
            >
              下一关
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-metal-600">
              总进度: {totalCompleted} 关已完成
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute top-6 right-6 z-20"
      >
        <div className="px-4 py-2 rounded-xl bg-success-500/10 border border-success-500/30 backdrop-blur-sm">
          <p className="text-sm font-display font-semibold text-success-400">
            新外壳已解锁
          </p>
        </div>
      </motion.div>
    </div>
  );
}
