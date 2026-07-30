import React from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const typeStyles = {
    success: 'bg-emerald-950 border-emerald-800 text-emerald-200',
    error: 'bg-red-950 border-red-800 text-red-200',
    info: 'bg-bg-card border-border-strong text-txt-primary',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center justify-between px-4 py-3 rounded border text-xs font-medium shadow-lg max-w-md ${typeStyles[type]}`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-txt-muted hover:text-txt-primary focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
};
