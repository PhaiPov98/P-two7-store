'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => toast(title, message, 'success'), [toast]);
  const error = useCallback((title: string, message?: string) => toast(title, message, 'error'), [toast]);
  const info = useCallback((title: string, message?: string) => toast(title, message, 'info'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-emerald-950/50'
                : t.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-100 shadow-red-950/50'
                : 'bg-dark-850/90 border-blue-500/30 text-slate-100 shadow-blue-950/50'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-white">{t.title}</p>
              {t.message && <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
