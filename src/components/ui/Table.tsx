import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  priority?: 'high' | 'medium' | 'low'; // High always shown on mobile, medium on tablet, low on desktop
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  isLoading = false,
  onRowClick,
  className = '',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-slate-100/80 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="w-full bg-white rounded-xl border border-slate-200 p-6">{emptyState}</div>;
  }

  return (
    <div className={`w-full overflow-hidden bg-white rounded-xl border border-neutral-200 shadow-2xs ${className}`}>
      {/* Contained horizontal scroll boundary to prevent page-level overflow */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {columns.map((col) => {
                const priorityClass =
                  col.priority === 'low'
                    ? 'hidden lg:table-cell'
                    : col.priority === 'medium'
                    ? 'hidden sm:table-cell'
                    : '';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 font-bold ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${priorityClass} ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.map((item) => {
              const rowKey = keyExtractor(item);
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors hover:bg-neutral-50/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => {
                    const priorityClass =
                      col.priority === 'low'
                        ? 'hidden lg:table-cell'
                        : col.priority === 'medium'
                        ? 'hidden sm:table-cell'
                        : '';

                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-neutral-800 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${priorityClass} ${col.className || ''}`}
                      >
                        {col.render ? col.render(item) : ((item as any)[col.key] ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
