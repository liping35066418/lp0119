import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Clock, AlertTriangle, Settings } from 'lucide-react';
import { getLevelById } from '@/data/levels';
import { useAssemblyStore } from '@/store/useAssemblyStore';
import { useProgressStore } from '@/store/useProgressStore';
import { getCurrentStep } from '@/engine/validationEngine';
import AssemblyScene from './AssemblyScene';
import PartLibrary from '@/components/PartLibrary/PartLibrary';
import ConstraintPanel from '@/components/ConstraintPanel/ConstraintPanel';
import ValidationToast from '@/components/ValidationToast/ValidationToast';
import { ValidationResult, Part } from '@/types';

export default function Assembly() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const level = getLevelById(levelId || '');
  const { resetAssembly, placedParts, errorCount, startTime, setComplete } = useAssemblyStore();
  const { completeLevel } = useProgressStore();
  const [showToast, setShowToast] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    resetAssembly();
  }, [levelId, resetAssembly]);

  useEffect(() => {
    if (startTime) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime]);

  const currentStep = level ? getCurrentStep(level, placedParts) : 0;

  const handleValidation = (results: ValidationResult[]) => {
    setValidationResults(results);
    setShowToast(true);
  };

  const handleAssemblyComplete = () => {
    setComplete(true);
    if (level && startTime) {
      const time = Math.floor((Date.now() - startTime) / 1000);
      completeLevel(level.id, time, errorCount);
    }
    setTimeout(() => {
      navigate(`/success/${levelId}`);
    }, 1000);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleReset = () => {
    resetAssembly();
    setElapsedTime(0);
  };

  const handlePartSelect = (part: Part) => {
    console.log('Selected part:', part.name);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!level) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-industrial-950">
        <p className="text-metal-400">关卡不存在</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-industrial-950 overflow-hidden">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-14 bg-metal-gradient border-b border-metal-700 flex items-center justify-between px-4 z-20 shadow-metal"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-metal-700/50 hover:bg-metal-600/50 text-metal-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </button>

          <div className="h-6 w-px bg-metal-700" />

          <div>
            <h1 className="font-display text-lg font-semibold text-white">{level.name}</h1>
            <p className="text-xs text-metal-500">{level.series} 系列</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-tech-400" />
            <span className="font-display text-lg font-semibold text-white">
              {formatTime(elapsedTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-400" />
            <span className="font-display text-lg font-semibold text-white">
              {errorCount}
            </span>
            <span className="text-xs text-metal-500">次错误</span>
          </div>

          <div className="h-6 w-px bg-metal-700" />

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-metal-700/50 hover:bg-metal-600/50 text-metal-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">重置</span>
          </button>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        <PartLibrary
          parts={level.parts}
          assemblyOrder={level.assemblyOrder}
          currentStep={currentStep}
          onPartSelect={handlePartSelect}
        />

        <div className="flex-1 relative">
          <AssemblyScene
            level={level}
            onValidation={handleValidation}
            onAssemblyComplete={handleAssemblyComplete}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className="bg-metal-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-metal-700">
              <div className="flex items-center gap-3">
                <span className="text-xs text-metal-400">装配进度</span>
                <div className="w-32 h-2 bg-metal-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-tech-500 to-success-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / level.assemblyOrder.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-display font-semibold text-tech-400">
                  {currentStep}/{level.assemblyOrder.length}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 left-4">
            <div className="bg-metal-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-metal-700">
              <p className="text-xs text-metal-400">当前步骤</p>
              <p className="font-display text-sm font-semibold text-white">
                {currentStep < level.assemblyOrder.length
                  ? level.parts.find((p) => p.id === level.assemblyOrder[currentStep])?.name
                  : '全部完成'}
              </p>
            </div>
          </div>
        </div>

        <ConstraintPanel level={level} currentStep={currentStep} />
      </div>

      <ValidationToast
        results={validationResults}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
