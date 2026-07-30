import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-lg bg-bg-card border border-border-subtle p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
