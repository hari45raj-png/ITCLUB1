import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 overflow-x-auto no-scrollbar ${
        variant === 'underline'
          ? 'border-b border-slate-200'
          : variant === 'enclosed'
          ? 'bg-slate-100 p-1 rounded-xl border border-slate-200/80'
          : 'gap-2'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        let buttonClasses = '';
        if (variant === 'underline') {
          buttonClasses = `px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            isActive
              ? 'border-[#9B1B1B] text-[#9B1B1B]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`;
        } else if (variant === 'enclosed') {
          buttonClasses = `px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            isActive
              ? 'bg-white text-[#9B1B1B] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`;
        } else {
          buttonClasses = `px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer ${
            isActive
              ? 'bg-[#9B1B1B] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`;
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`flex items-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? variant === 'pills'
                      ? 'bg-white/20 text-white'
                      : 'bg-red-50 text-[#9B1B1B]'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
