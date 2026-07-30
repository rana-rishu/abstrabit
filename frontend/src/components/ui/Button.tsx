import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded';

  const variantStyles = {
    primary: 'bg-accent-primary text-accent-dark hover:bg-neutral-200 active:bg-neutral-300 font-semibold',
    secondary: 'bg-bg-hover text-txt-primary hover:bg-neutral-700 border border-border-subtle',
    outline: 'border border-border-strong text-txt-primary hover:bg-bg-hover',
    ghost: 'text-txt-secondary hover:text-txt-primary hover:bg-bg-hover',
    danger: 'bg-red-950 text-red-200 border border-red-800 hover:bg-red-900',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};
