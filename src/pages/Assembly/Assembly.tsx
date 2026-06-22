import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Clock, AlertTriangle, Play, Pause, SkipBack, SkipForward, BookOpen } from 'lucide-react';
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
  const [tutorialMode, setTutorialMode] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

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
  const tutorialStepCount = level?.assemblyOrder.length || 0;

  useEffect(() => {
    if (isPlaying && tutorialMode && level) {
      playIntervalRef.current = window.setInterval(() => {
        setTutorialStep((prev) => {
          if (prev >= tutorialStepCount - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, tutorialMode, tutorialStepCount, level]);

  const handleToggleTutorial = () => {
    setTutorialMode((prev) => !prev);
    setTutorialStep(0);
    setIsPlaying(false);
  };

  const handlePrevStep = () => {
    setTutorialStep((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (level) {
      setTutorialStep((prev) => Math.min(tutorialStepCount - 1, prev + 1));
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (!level) return;
    if (tutorialStep >= tutorialStepCount - 1) {
      setTutorialStep(0);
    }
    setIsPlaying((prev) => !prev);
  };

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

        <div className="flex-1 relative flex flex-col">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleToggleTutorial}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all
                ${tutorialMode
                  ? 'bg-tech-500/20 border-tech-500/50 text-tech-300'
                  : 'bg-metal-800/80 border-metal-700 text-metal-300 hover:text-white hover:border-metal-600'
                }
              `}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">图纸讲解</span>
              <div className={`
                w-10 h-5 rounded-full relative transition-colors
                ${tutorialMode ? 'bg-tech-500' : 'bg-metal-600'}
              `}>
                <div className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all
                  ${tutorialMode ? 'left-5' : 'left-0.5'}
                `} />
              </div>
            </button>
          </div>

          <AssemblyScene
            level={level}
            onValidation={handleValidation}
            onAssemblyComplete={handleAssemblyComplete}
            tutorialMode={tutorialMode}
            tutorialStep={tutorialStep}
          />

          {!tutorialMode && (
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
          )}

          {!tutorialMode && (
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
          )}

          {tutorialMode && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4">
              <div className="bg-metal-800/90 backdrop-blur-sm rounded-xl border border-metal-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-metal-400 mb-0.5">讲解步骤 {tutorialStep + 1}/{tutorialStepCount}</p>
                    <p className="font-display text-sm font-semibold text-white">
                      {level.assemblyOrder[tutorialStep]
                        ? level.parts.find((p) => p.id === level.assemblyOrder[tutorialStep])?.name
                        : '全部完成'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevStep}
                      disabled={tutorialStep === 0}
                      className="p-2 rounded-lg bg-metal-700/50 text-metal-300 hover:bg-metal-600/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleTogglePlay}
                      className="p-2.5 rounded-xl bg-tech-500 text-white hover:bg-tech-400 transition-colors shadow-glow-cyan"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={tutorialStep >= tutorialStepCount - 1}
                      className="p-2 rounded-lg bg-metal-700/50 text-metal-300 hover:bg-metal-600/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: tutorialStepCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTutorialStep(i);
                        setIsPlaying(false);
                      }}
                      className={`
                        flex-1 h-2 rounded-full transition-all
                        ${i <= tutorialStep
                          ? 'bg-gradient-to-r from-tech-500 to-success-500'
                          : 'bg-metal-700'
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
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
