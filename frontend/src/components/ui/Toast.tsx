import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  progress: number;
  isPaused: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const ToastItem: React.FC<{ 
  toast: Toast; 
  onRemove: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}> = ({ toast, onRemove, onPause, onResume }) => {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": 
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success": return "bg-green-500/95 border-green-400/50 shadow-green-500/20";
      case "error": return "bg-red-500/95 border-red-400/50 shadow-red-500/20";
      case "warning": return "bg-yellow-500/95 border-yellow-400/50 shadow-yellow-500/20";
      case "info": return "bg-blue-500/95 border-blue-400/50 shadow-blue-500/20";
    }
  };

  return (
    <div
      className={`${getColors(toast.type)} border rounded-xl shadow-xl backdrop-blur-md text-white overflow-hidden transform transition-all duration-300 hover:scale-105 animate-in slide-in-from-right-full fade-in`}
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => onResume(toast.id)}
    >
      <div className="px-4 py-3 flex items-center gap-3 relative">
        <div className="flex-shrink-0">
          {getIcon(toast.type)}
        </div>
        <span className="text-sm font-medium flex-1">{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
      {!toast.isPaused && (
        <div className="h-1 bg-white/30">
          <div 
            className="h-full bg-white/80 transition-all duration-100 ease-linear"
            style={{ width: `${toast.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, progress: 100, isPaused: false }]);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      setToasts((prev) => {
        const toast = prev.find(t => t.id === id);
        if (!toast || toast.isPaused) return prev;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.max(0, 100 - (elapsed / duration) * 100);
        
        if (progress <= 0) {
          clearInterval(interval);
          return prev.filter((t) => t.id !== id);
        }
        
        return prev.map(t => t.id === id ? { ...t, progress } : t);
      });
    }, 50);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pauseToast = useCallback((id: string) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, isPaused: true } : t));
  }, []);

  const resumeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, isPaused: false } : t));
  }, []);

  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error", 5000), [showToast]);
  const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ 
              animationDelay: `${index * 100}ms`,
              transform: `translateY(${index * 4}px)`,
            }}
          >
            <ToastItem 
              toast={toast} 
              onRemove={removeToast}
              onPause={pauseToast}
              onResume={resumeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// also export provider as 'Toast' for compatibility with index barrel
export { ToastProvider as Toast };
