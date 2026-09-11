import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-neutral-300' : ''
      } ${className}`}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-neutral-900 font-semibold">
          {header}
        </div>
      )}
      <div className="p-5 sm:p-6 text-neutral-900">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 text-xs text-neutral-500">
          {footer}
        </div>
      )}
    </div>
  );
};
