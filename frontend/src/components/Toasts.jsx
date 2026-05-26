import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000); // Auto-dismiss after 4 seconds
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const themes = {
    success: 'bg-emerald-50/95 border border-emerald-100 text-emerald-900 shadow-emerald-100/50',
    error: 'bg-rose-50/95 border border-rose-100 text-rose-900 shadow-rose-100/50',
    info: 'bg-blue-50/95 border border-blue-100 text-blue-900 shadow-blue-100/50'
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-xs max-w-sm w-80 pointer-events-auto transform transition-all duration-300 animate-slide-in ${themes[toast.type] || themes.info}`}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-medium leading-5 font-sans">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-black/5 transition-colors shrink-0"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastsContainer({ toasts, onCloseToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onCloseToast} />
      ))}
    </div>
  );
}
