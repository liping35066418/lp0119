import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronRight, Check, X, AlertTriangle, Ruler } from 'lucide-react';
import { Level } from '@/types';
import { useAssemblyStore } from '@/store/useAssemblyStore';

interface ConstraintPanelProps {
  level: Level;
  currentStep: number;
}

export default function ConstraintPanel({ level, currentStep }: ConstraintPanelProps) {
  const { placedParts } = useAssemblyStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'order' | 'snap' | 'space'>('order');

  const getOrderStatus = (orderIndex: number) => {
    if (orderIndex < currentStep) return 'completed';
    if (orderIndex === currentStep) return 'current';
    return 'pending';
  };

  const getSnapConstraintStatus = (constraint: typeof level.snapConstraints[0]) => {
    const partA = placedParts.get(constraint.partA);
    const partB = placedParts.get(constraint.partB);
    if (partA?.isCorrect && partB?.isCorrect) return 'completed';
    if (partA?.isCorrect || partB?.isCorrect) return 'partial';
    return 'pending';
  };

  const getSpaceConstraintStatus = (constraint: typeof level.spaceConstraints[0]) => {
    const partA = placedParts.get(constraint.partA);
    const partB = placedParts.get(constraint.partB);
    if (partA?.isCorrect && partB?.isCorrect) return 'completed';
    if (partA?.isCorrect || partB?.isCorrect) return 'partial';
    return 'pending';
  };

  const renderOrderList = () => (
    <div className="space-y-2">
      {level.assemblyOrder.map((partId, index) => {
        const part = level.parts.find((p) => p.id === partId);
        const status = getOrderStatus(index);

        return (
          <motion.div
            key={partId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center gap-3 p-2.5 rounded-lg
              ${status === 'current' ? 'bg-tech-500/10 border border-tech-500/30' : ''}
              ${status === 'completed' ? 'bg-success-500/5' : ''}
              ${status === 'pending' ? 'bg-metal-800/30' : ''}
            `}
          >
            <div
              className={`
                w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                ${status === 'completed' ? 'bg-success-500' : ''}
                ${status === 'current' ? 'bg-tech-500' : ''}
                ${status === 'pending' ? 'bg-metal-700' : ''}
              `}
            >
              {status === 'completed' ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="text-xs font-bold text-white">{index + 1}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`
                  text-sm font-medium truncate
                  ${status === 'completed' ? 'text-metal-400 line-through' : ''}
                  ${status === 'current' ? 'text-white' : ''}
                  ${status === 'pending' ? 'text-metal-500' : ''}
                `}
              >
                {part?.name}
              </p>
              <p className="text-xs text-metal-600">{part?.category}</p>
            </div>

            {status === 'current' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-tech-500"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );

  const renderSnapList = () => (
    <div className="space-y-2">
      {level.snapConstraints.map((constraint, index) => {
        const partA = level.parts.find((p) => p.id === constraint.partA);
        const partB = level.parts.find((p) => p.id === constraint.partB);
        const status = getSnapConstraintStatus(constraint);

        return (
          <motion.div
            key={constraint.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-2.5 rounded-lg bg-metal-800/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`
                  w-5 h-5 rounded flex items-center justify-center
                  ${status === 'completed' ? 'bg-success-500/20' : 'bg-metal-700'}
                `}
              >
                <Ruler
                  className={`w-3 h-3 ${status === 'completed' ? 'text-success-400' : 'text-metal-500'}`}
                />
              </div>
              <span
                className={`
                  text-xs font-medium
                  ${status === 'completed' ? 'text-success-400' : 'text-metal-400'}
                `}
              >
                卡扣对接 #{index + 1}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-metal-500 ml-7">
              <span>{partA?.name}</span>
              <X className="w-3 h-3 text-metal-600" />
              <span>{partB?.name}</span>
            </div>
            <p className="text-xs text-metal-600 ml-7 mt-1">
              容差: {constraint.tolerance} 单位
            </p>
          </motion.div>
        );
      })}
    </div>
  );

  const renderSpaceList = () => (
    <div className="space-y-2">
      {level.spaceConstraints.map((constraint, index) => {
        const partA = level.parts.find((p) => p.id === constraint.partA);
        const partB = level.parts.find((p) => p.id === constraint.partB);
        const status = getSpaceConstraintStatus(constraint);

        return (
          <motion.div
            key={constraint.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-2.5 rounded-lg bg-metal-800/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`
                  w-5 h-5 rounded flex items-center justify-center
                  ${status === 'completed' ? 'bg-success-500/20' : 'bg-metal-700'}
                `}
              >
                <AlertTriangle
                  className={`w-3 h-3 ${status === 'completed' ? 'text-success-400' : 'text-metal-500'}`}
                />
              </div>
              <span
                className={`
                  text-xs font-medium
                  ${status === 'completed' ? 'text-success-400' : 'text-metal-400'}
                `}
              >
                间距约束 #{index + 1}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-metal-500 ml-7">
              <span>{partA?.name}</span>
              <span className="text-metal-600">↔</span>
              <span>{partB?.name}</span>
            </div>
            <p className="text-xs text-metal-500 ml-7 mt-1">
              {constraint.minDistance} ~ {constraint.maxDistance} 单位
            </p>
            <p className="text-xs text-warning-500/70 ml-7 mt-1">
              {constraint.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-72 bg-metal-gradient border-l border-metal-700 flex flex-col h-full shadow-metal"
    >
      <div
        className="p-4 border-b border-metal-700 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-tech-400" />
          <h2 className="font-display text-lg font-semibold text-white">装配图纸约束</h2>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-metal-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-metal-500" />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex border-b border-metal-700">
              {(['order', 'snap', 'space'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex-1 py-2 text-xs font-medium transition-colors
                    ${activeTab === tab
                      ? 'text-tech-400 border-b-2 border-tech-500 bg-tech-500/5'
                      : 'text-metal-500 hover:text-metal-300'
                    }
                  `}
                >
                  {tab === 'order' && '装配顺序'}
                  {tab === 'snap' && '卡扣对接'}
                  {tab === 'space' && '空间间距'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'order' && renderOrderList()}
              {activeTab === 'snap' && renderSnapList()}
              {activeTab === 'space' && renderSpaceList()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
