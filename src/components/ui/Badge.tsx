import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'navy'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'published'
  | 'draft'
  | 'archived'
  | 'active'
  | 'inactive'
  | 'upcoming'
  | 'completed'
  | 'leadership'
  | 'member';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs sm:text-sm font-medium',
  };

  const variantStyles: Record<BadgeVariant, { container: string; dotColor?: string }> = {
    default: {
      container: 'bg-neutral-100 text-neutral-700 border border-neutral-200/80',
      dotColor: 'bg-neutral-400',
    },
    primary: {
      container: 'bg-pink-50 text-pink-700 border border-pink-200/70 font-semibold',
      dotColor: 'bg-pink-500',
    },
    navy: {
      container: 'bg-[#0F1419] text-white border border-neutral-800 font-medium',
      dotColor: 'bg-white',
    },
    success: {
      container: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-medium',
      dotColor: 'bg-emerald-500',
    },
    warning: {
      container: 'bg-amber-50 text-amber-900 border border-amber-200/70 font-medium',
      dotColor: 'bg-amber-500',
    },
    error: {
      container: 'bg-rose-50 text-rose-800 border border-rose-200/70 font-medium',
      dotColor: 'bg-rose-500',
    },
    info: {
      container: 'bg-sky-50 text-sky-800 border border-sky-200/70 font-medium',
      dotColor: 'bg-sky-500',
    },
    // Lifecycle Content States
    published: {
      container: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-medium',
      dotColor: 'bg-emerald-500',
    },
    draft: {
      container: 'bg-neutral-100 text-neutral-700 border border-neutral-200/80 font-medium',
      dotColor: 'bg-neutral-400',
    },
    archived: {
      container: 'bg-neutral-100 text-neutral-500 border border-neutral-200/60 line-through opacity-75',
      dotColor: 'bg-neutral-400',
    },
    active: {
      container: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-medium',
      dotColor: 'bg-emerald-500',
    },
    inactive: {
      container: 'bg-neutral-100 text-neutral-600 border border-neutral-200/60',
      dotColor: 'bg-neutral-400',
    },
    upcoming: {
      container: 'bg-purple-50 text-purple-800 border border-purple-200/70 font-medium',
      dotColor: 'bg-purple-500',
    },
    completed: {
      container: 'bg-neutral-100 text-neutral-700 border border-neutral-200/70',
      dotColor: 'bg-neutral-400',
    },
    // Leadership & Member Hierarchy
    leadership: {
      container: 'bg-[#0F1419] text-white border border-neutral-800 font-semibold tracking-tight shadow-2xs',
      dotColor: 'bg-pink-400',
    },
    member: {
      container: 'bg-neutral-100 text-neutral-800 border border-neutral-200 font-medium',
      dotColor: 'bg-neutral-400',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 justify-center font-medium rounded-full whitespace-nowrap leading-none ${sizeStyles[size]} ${currentVariant.container} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dotColor || 'bg-current'}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
