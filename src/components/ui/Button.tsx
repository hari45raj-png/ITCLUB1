import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'navy' | 'dark' | 'secondary' | 'accent' | 'gradient' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 min-h-[42px] gap-2 rounded-lg', // Accessible touch target
    lg: 'text-base px-5 py-2.5 min-h-[46px] gap-2.5 rounded-xl',
  };

  const variantStyles = {
    // Primary: Modern refined Instagram-inspired gradient accent button
    primary:
      'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:opacity-95 active:opacity-90 focus-visible:ring-pink-500 shadow-xs font-semibold',
    // Solid dark charcoal / near-black button
    navy:
      'bg-[#0F1419] text-white hover:bg-neutral-800 active:bg-neutral-900 focus-visible:ring-neutral-900 shadow-xs font-semibold',
    dark:
      'bg-[#0F1419] text-white hover:bg-neutral-800 active:bg-neutral-900 focus-visible:ring-neutral-900 shadow-xs font-semibold',
    // Secondary: Clean white with neutral border and dark text
    secondary:
      'bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-neutral-400 border border-neutral-200 shadow-2xs font-medium',
    accent:
      'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:opacity-95 focus-visible:ring-pink-500 shadow-xs font-semibold',
    gradient:
      'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:opacity-95 focus-visible:ring-pink-500 shadow-xs font-semibold',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-xs font-medium',
    outline:
      'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-pink-500 font-medium',
    ghost:
      'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:ring-neutral-400 font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span className="truncate">{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
