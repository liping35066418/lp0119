import { motion } from 'framer-motion';
import { Lock, CheckCircle, Clock, AlertTriangle, Play, Layers, Link2, Ruler } from 'lucide-react';
import { Level } from '@/types';
import { useProgressStore } from '@/store/useProgressStore';
import { useNavigate } from 'react-router-dom';
import { getLevelStats } from '@/engine/validationEngine';

interface LevelCardProps {
  level: Level;
  index: number;
}

export default function LevelCard({ level, index }: LevelCardProps) {
  const navigate = useNavigate();
  const progress = useProgressStore();
  const levelProgress = progress.getLevelProgress(level.id);
  const isUnlocked = levelProgress?.unlocked ?? false;
  const isCompleted = levelProgress?.completed ?? false;

  const handleClick = () => {
    if (isUnlocked) {
      navigate(`/assembly/${level.id}`);
    }
  };

  const renderDifficultyStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${i < level.difficulty ? 'bg-tech-500' : 'bg-metal-600'}`}
      />
    ));
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeriesColor = () => {
    return level.series === '9919' ? 'from-tech-500 to-tech-700' : 'from-success-500 to-success-700';
  };

  const getSeriesGlow = () => {
    return level.series === '9919' ? 'shadow-glow-cyan' : 'shadow-glow-green';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={handleClick}
      className={`
        relative group cursor-pointer
        bg-metal-gradient rounded-xl overflow-hidden
        border border-metal-600
        transition-all duration-300
        ${isUnlocked ? 'hover:border-tech-500 hover:' + getSeriesGlow() : 'opacity-60 cursor-not-allowed'}
        ${isCompleted ? 'border-success-500/50' : ''}
      `}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          backgroundImage: `linear-gradient(90deg, ${level.series === '9919' ? '#00D4FF' : '#00C9A7'}, transparent)`,
        }}
      />

      <div className="relative h-40 bg-metal-700 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-40 opacity-30" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            w-20 h-20 rounded-lg
            bg-gradient-to-br ${getSeriesColor()}
            opacity-80
            flex items-center justify-center
            ${isUnlocked ? 'group-hover:scale-110' : ''}
            transition-transform duration-300
          `}>
            {isUnlocked ? (
              <span className="font-display text-3xl font-bold text-white">{level.series}</span>
            ) : (
              <Lock className="w-8 h-8 text-white/60" />
            )}
          </div>
        </div>

        {isCompleted && (
          <div className="absolute top-3 right-3">
            <CheckCircle className="w-6 h-6 text-success-500" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium rounded bg-black/40 text-metal-200 font-display tracking-wider">
            {level.series} 系列
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-lg font-semibold text-white">{level.name}</h3>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs text-metal-400 mr-2">难度</span>
          {renderDifficultyStars()}
        </div>

        <p className="text-sm text-metal-400 mb-3 line-clamp-2">
          {level.description}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col items-center p-2 rounded-lg bg-metal-800/50 border border-metal-700/50">
            <Layers className="w-4 h-4 text-tech-400 mb-1" />
            <span className="font-display text-sm font-bold text-white">
              {getLevelStats(level).assemblySteps}
            </span>
            <span className="text-xs text-metal-500">装配步数</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-metal-800/50 border border-metal-700/50">
            <Link2 className="w-4 h-4 text-success-400 mb-1" />
            <span className="font-display text-sm font-bold text-white">
              {getLevelStats(level).snapConstraints}
            </span>
            <span className="text-xs text-metal-500">卡扣点数</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-metal-800/50 border border-metal-700/50">
            <Ruler className="w-4 h-4 text-warning-400 mb-1" />
            <span className="font-display text-sm font-bold text-white">
              {getLevelStats(level).spaceConstraints}
            </span>
            <span className="text-xs text-metal-500">空间约束</span>
          </div>
        </div>

        {isCompleted && levelProgress?.bestTime !== undefined && (
          <div className="flex items-center gap-4 mb-4 text-xs text-metal-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-tech-400" />
              <span>最佳: {formatTime(levelProgress.bestTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-warning-400" />
              <span>最少错误: {levelProgress.leastErrors}</span>
            </div>
          </div>
        )}

        <button
          disabled={!isUnlocked}
          className={`
            w-full py-2.5 rounded-lg font-display font-semibold text-sm
            flex items-center justify-center gap-2
            transition-all duration-300
            ${isUnlocked
              ? 'bg-gradient-to-r ' + getSeriesColor() + ' text-white hover:shadow-lg hover:' + getSeriesGlow()
              : 'bg-metal-700 text-metal-500 cursor-not-allowed'
            }
          `}
        >
          {isUnlocked ? (
            <>
              <Play className="w-4 h-4" />
              {isCompleted ? '再次练习' : '开始装配'}
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              未解锁
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
