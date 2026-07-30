import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-subtle rounded-lg bg-bg-card/50">
      {icon ? (
        <div className="mb-4 text-txt-muted">{icon}</div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center mb-4 text-txt-muted font-mono text-base">
          ø
        </div>
      )}
      <h3 className="text-sm font-semibold text-txt-primary mb-1">{title}</h3>
      <p className="text-xs text-txt-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
