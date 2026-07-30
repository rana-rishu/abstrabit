import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-txt-secondary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`h-9 w-full rounded bg-bg-input px-3 py-1.5 text-sm text-txt-primary placeholder:text-txt-muted border border-border-subtle focus:border-border-strong focus:outline-none transition-colors ${
            error ? 'border-red-800 bg-red-950/20' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
