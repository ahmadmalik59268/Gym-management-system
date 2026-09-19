import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useGym } from '../../context/GymContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGym();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const iconConfig = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
        };

        const borderClasses = {
          success: 'border-l-4 border-l-emerald-500',
          error: 'border-l-4 border-l-rose-500',
          warning: 'border-l-4 border-l-amber-500',
          info: 'border-l-4 border-l-blue-500',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 bg-white rounded-lg shadow-lg border border-slate-200 text-slate-800 text-sm transform transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              borderClasses[toast.type]
            }`}
          >
            <div className="flex items-center gap-3">
              {iconConfig[toast.type]}
              <p className="font-medium text-slate-800 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
