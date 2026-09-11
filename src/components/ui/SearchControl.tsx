import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface SearchControlProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  filterActive?: boolean;
  categories?: { id: string; label: string }[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}

export const SearchControl: React.FC<SearchControlProps> = ({
  value,
  onChange,
  placeholder = 'Search IT Club members, projects, events, notices, question papers...',
  onFilterClick,
  showFilterButton = false,
  filterActive = false,
  categories,
  activeCategory,
  onCategoryChange,
  className = '',
}) => {
  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white pl-10 pr-20 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 min-h-[42px]"
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {showFilterButton && (
            <button
              type="button"
              onClick={onFilterClick}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterActive
                  ? 'bg-[#0F1419] text-white border-[#0F1419]'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Category Pills for multi-domain search filtering */}
      {categories && categories.length > 0 && onCategoryChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F1419] text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
