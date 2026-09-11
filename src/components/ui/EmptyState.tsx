import React from 'react';
import { Database } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-neutral-600 mb-3.5 ring-4 ring-neutral-100 border border-neutral-200/80 shadow-2xs">
        {icon || <Database className="w-5 h-5 text-neutral-400" />}
      </div>
      <h4 className="text-base font-semibold text-neutral-900 tracking-tight">{title}</h4>
      <p className="mt-1 text-sm text-neutral-500 max-w-md leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
