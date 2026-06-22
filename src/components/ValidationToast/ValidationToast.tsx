import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { ValidationResult } from '@/types';
import { useEffect, useState } from 'react';

interface ValidationToastProps {
  results: ValidationResult[];
  visible: boolean;
  onClose: () => void;
}

export default function ValidationToast({ results, visible, onClose }: ValidationToastProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, results]);

  const hasErrors = results.some((r) => !r.passed);
  const firstError = results.find((r) => !r.passed);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`
          fixed top-6 left-1/2 -translate-x-1/2 z-50
          max-w-md w-full px-4
        `}
      >
        <div
          className={`
            relative rounded-xl border-2 overflow-hidden shadow-2xl
            ${hasErrors ? 'bg-warning-500/10 border-warning-500/50' : 'bg-success-500/10 border-success-500/50'}
          `}
        >
          <div
            className={`
              absolute top-0 left-0 right-0 h-1
              ${hasErrors ? 'bg-warning-500' : 'bg-success-500'}
            `}
          />

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${hasErrors ? 'bg-warning-500/20' : 'bg-success-500/20'}
                `}
              >
                {hasErrors ? (
                  <AlertTriangle className="w-5 h-5 text-warning-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-success-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className={`
                    font-display font-semibold text-base mb-1
                    ${hasErrors ? 'text-warning-400' : 'text-success-400'}
                  `}
                >
                  {hasErrors ? '装配校验未通过' : '装配校验通过'}
                </h4>

                {firstError && (
                  <p className="text-sm text-metal-300 mb-2">
                    {firstError.message}
                  </p>
                )}

                {firstError?.hint && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-black/20">
                    <Info className="w-4 h-4 text-tech-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-metal-400">{firstError.hint}</p>
                  </div>
                )}

                {hasErrors && firstError?.errorType && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-metal-500">错误类型:</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-warning-500/20 text-warning-400">
                      {firstError.errorType === 'order' && '顺序错误'}
                      {firstError.errorType === 'position' && '位置偏差'}
                      {firstError.errorType === 'snap' && '卡扣错位'}
                      {firstError.errorType === 'space' && '间距异常'}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-metal-500" />
              </button>
            </div>
          </div>

          <div className="h-1 bg-black/20">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className={`
                h-full
                ${hasErrors ? 'bg-warning-500' : 'bg-success-500'}
              `}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
