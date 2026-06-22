import { motion } from 'framer-motion';
import { Cpu, Package, TrendingUp, Award } from 'lucide-react';
import LevelCard from '@/components/LevelCard/LevelCard';
import { levels } from '@/data/levels';
import { useProgressStore } from '@/store/useProgressStore';
import { useEffect } from 'react';

export default function LevelSelect() {
  const progress = useProgressStore();

  useEffect(() => {
    progress.initProgress();
  }, []);

  const totalProgress = progress.getTotalProgress();
  const completedCount = progress.totalCompleted;

  const series9919 = levels.filter((l) => l.series === '9919');
  const series3918 = levels.filter((l) => l.series === '3918');

  return (
    <div className="min-h-screen bg-industrial-950 overflow-auto">
      <div className="fixed inset-0 bg-grid-pattern bg-grid-40 opacity-30 pointer-events-none" />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-tech-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-success-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cpu className="w-10 h-10 text-tech-500" />
            <h1 className="font-display text-4xl font-bold text-white tracking-wider">
              样机装配实训系统
            </h1>
          </div>
          <p className="text-metal-400 text-lg max-w-2xl mx-auto">
            掌握工业样机装配规范，从零件认知到整机装配，循序渐进提升装配技能
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-metal-gradient rounded-xl p-6 border border-metal-700 shadow-metal">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-tech-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-tech-400" />
              </div>
              <span className="text-metal-400 text-sm">总关卡数</span>
            </div>
            <div className="font-display text-3xl font-bold text-white">
              {levels.length}
            </div>
          </div>

          <div className="bg-metal-gradient rounded-xl p-6 border border-metal-700 shadow-metal">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-400" />
              </div>
              <span className="text-metal-400 text-sm">已完成</span>
            </div>
            <div className="font-display text-3xl font-bold text-white">
              {completedCount}
            </div>
          </div>

          <div className="bg-metal-gradient rounded-xl p-6 border border-metal-700 shadow-metal">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-warning-400" />
              </div>
              <span className="text-metal-400 text-sm">完成进度</span>
            </div>
            <div className="font-display text-3xl font-bold text-white">
              {Math.round(totalProgress)}%
            </div>
          </div>

          <div className="bg-metal-gradient rounded-xl p-6 border border-metal-700 shadow-metal">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-industrial-500/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-industrial-400" />
              </div>
              <span className="text-metal-400 text-sm">产品系列</span>
            </div>
            <div className="font-display text-3xl font-bold text-white">
              2
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-metal-400">整体进度</span>
            <span className="text-sm font-display font-semibold text-tech-400">
              {completedCount} / {levels.length} 关
            </span>
          </div>
          <div className="h-2 bg-metal-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-tech-500 to-success-500 rounded-full"
              style={{ boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-tech-500 rounded-full" />
            <h2 className="font-display text-2xl font-bold text-white">9919 系列 - 消费电子</h2>
            <span className="px-3 py-1 text-xs font-display font-semibold rounded-full bg-tech-500/20 text-tech-400">
              入门级
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series9919.map((level, index) => (
              <LevelCard key={level.id} level={level} index={index} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-success-500 rounded-full" />
            <h2 className="font-display text-2xl font-bold text-white">3918 系列 - 精密仪器</h2>
            <span className="px-3 py-1 text-xs font-display font-semibold rounded-full bg-success-500/20 text-success-400">
              进阶级
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series3918.map((level, index) => (
              <LevelCard key={level.id} level={level} index={index + series9919.length} />
            ))}
          </div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 text-center text-metal-600 text-sm"
        >
          <p>工业设计样机装配培训系统 · 规范操作 · 精准装配</p>
        </motion.footer>
      </div>
    </div>
  );
}
