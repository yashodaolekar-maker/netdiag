import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

interface AlertBannerProps {
  id?: string;
  key?: any;
  type: AlertType;
  title: string;
  description: string;
  isVisible: boolean;
  onDismiss?: () => void;
}

const styles: Record<AlertType, { bg: string; border: string; text: string; iconColor: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    icon: <CheckCircle className="w-5 h-5 shrink-0" />
  },
  warning: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    icon: <AlertTriangle className="w-5 h-5 shrink-0" />
  },
  error: {
    bg: 'bg-rose-50/90',
    border: 'border-rose-200',
    text: 'text-rose-800',
    iconColor: 'text-rose-500',
    icon: <AlertCircle className="w-5 h-5 shrink-0" />
  },
  info: {
    bg: 'bg-blue-50/90',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    icon: <Info className="w-5 h-5 shrink-0" />
  }
};

export default function AlertBanner({
  type,
  title,
  description,
  isVisible,
  onDismiss
}: AlertBannerProps) {
  const currentStyle = styles[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`border ${currentStyle.border} ${currentStyle.bg} ${currentStyle.text} p-4 rounded-xl shadow-sm flex items-start gap-3.5 relative overflow-hidden`}
        >
          {/* Subtle accent vertical strip */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentStyle.iconColor} bg-current`} />

          <div className={`${currentStyle.iconColor} mt-0.5`}>
            {currentStyle.icon}
          </div>

          <div className="flex-1 pr-4">
            <h4 className="font-display font-semibold text-sm tracking-tight mb-0.5">{title}</h4>
            <p className="font-sans text-xs opacity-90 leading-relaxed font-normal">{description}</p>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              type="button"
              className="p-1 -mr-1 rounded-lg hover:bg-slate-900/5 transition-colors cursor-pointer text-slate-500 hover:text-slate-900 focus:outline-none"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
