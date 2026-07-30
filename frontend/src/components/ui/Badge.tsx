import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    default: 'bg-bg-hover text-txt-secondary border-border-subtle',
    outline: 'border border-border-strong text-txt-primary bg-transparent',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    error: 'bg-red-950/60 text-red-300 border-red-800/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
