import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Part } from '@/types';
import { useAssemblyStore } from '@/store/useAssemblyStore';

interface PartLibraryProps {
  parts: Part[];
  assemblyOrder: string[];
  currentStep: number;
  onPartSelect: (part: Part) => void;
}

export default function PartLibrary({
  parts,
  assemblyOrder,
  currentStep,
  onPartSelect,
}: PartLibraryProps) {
  const { placedParts } = useAssemblyStore();

  const categories = [...new Set(parts.map((p) => p.category))];

  const getPartStatus = (part: Part): 'placed' | 'current' | 'locked' => {
    const placed = placedParts.get(part.id);
    if (placed && placed.isCorrect) return 'placed';
    if (part.order === currentStep + 1) return 'current';
    if (part.order > currentStep + 1) return 'locked';
    return 'current';
  };

  const getPartColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'border-success-500/50 bg-success-500/10';
      case 'current':
        return 'border-tech-500/50 bg-tech-500/10 hover:border-tech-400';
      case 'locked':
        return 'border-metal-700 bg-metal-800/50 opacity-50';
      default:
        return 'border-metal-700 bg-metal-800';
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-72 bg-metal-gradient border-r border-metal-700 flex flex-col h-full shadow-metal"
    >
      <div className="p-4 border-b border-metal-700">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-tech-400" />
          <h2 className="font-display text-lg font-semibold text-white">零件库</h2>
        </div>
        <p className="text-xs text-metal-500 mt-1">共 {parts.length} 个零件 · 第 {currentStep + 1}/{assemblyOrder.length} 步</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((category) => {
          const categoryParts = parts.filter((p) => p.category === category);
          const currentCategoryParts = categoryParts
            .map((p) => ({ part: p, order: assemblyOrder.indexOf(p.id) + 1 }))
            .sort((a, b) => a.order - b.order);

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-tech-500 rounded-full" />
                <h3 className="text-xs font-semibold text-metal-400 uppercase tracking-wider">
                  {category}
                </h3>
                <span className="text-xs text-metal-600">({categoryParts.length})</span>
              </div>

              <div className="space-y-2">
                {currentCategoryParts.map(({ part, order }) => {
                  const status = getPartStatus(part);
                  const isClickable = status !== 'locked';

                  return (
                    <motion.div
                      key={part.id}
                      whileHover={isClickable ? { scale: 1.02 } : {}}
                      whileTap={isClickable ? { scale: 0.98 } : {}}
                      onClick={() => isClickable && onPartSelect(part)}
                      className={`
                        relative p-3 rounded-lg border
                        transition-all duration-200
                        ${getPartColor(status)}
                        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: part.geometry.color + '40' }}
                        >
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: part.geometry.color }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">
                              {part.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-metal-500">
                              第 {order} 步
                            </span>
                          </div>
                        </div>

                        {status === 'placed' && (
                          <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
                        )}
                        {status === 'current' && (
                          <div className="w-6 h-6 rounded-full bg-tech-500/20 border border-tech-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-tech-400">{order}</span>
                          </div>
                        )}
                        {status === 'locked' && (
                          <div className="w-6 h-6 rounded-full bg-metal-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-metal-500">{order}</span>
                          </div>
                        )}
                      </div>

                      {status === 'current' && (
                        <motion.div
                          layoutId="current-step-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-tech-500 rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-metal-700 bg-metal-800/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-metal-500">装配进度</span>
          <span className="font-display font-semibold text-tech-400">
            {currentStep} / {assemblyOrder.length}
          </span>
        </div>
        <div className="h-1.5 bg-metal-700 rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-tech-500 to-success-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / assemblyOrder.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
