import React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, id, className = '', ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`flex items-start gap-2.5 ${className}`}>
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className="w-4 h-4 rounded-sm border-slate-300 text-[#9B1B1B] focus:ring-[#9B1B1B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            {...props}
          />
        </div>
        <div className="text-xs sm:text-sm">
          <label htmlFor={inputId} className="font-medium text-slate-800 cursor-pointer select-none">
            {label}
          </label>
          {helperText && <p className="text-slate-500 text-xs mt-0.5">{helperText}</p>}
          {error && <p className="text-rose-600 text-xs font-medium mt-0.5">{error}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
