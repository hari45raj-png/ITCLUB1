import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  count = 1,
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const items = Array.from({ length: count });

  return (
    <div className="space-y-2.5 w-full">
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-slate-200/80 ${variantStyles[variant]} ${className}`}
        />
      ))}
    </div>
  );
};
