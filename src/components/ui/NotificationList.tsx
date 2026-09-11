/**
 * St. Mary's English School - IT Club Platform
 * Notification UI Foundation
 * 
 * PROMPT 5: Academic Notification System Patterns
 * 
 * Features:
 * - Unread count badge
 * - Visual read vs unread indicators
 * - Priority/Important circular indicator
 * - Empty state feedback
 */

import React from 'react';
import { Bell, Check, Clock, AlertTriangle, Info, CheckCheck } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority?: 'urgent' | 'normal';
  link?: string;
}

export interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  className = '',
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={`w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${className}`}>
      {/* Header with unread tally */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#9B1B1B]" />
          <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span className="bg-[#9B1B1B] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-[11px] font-semibold text-[#9B1B1B] hover:text-[#801414] inline-flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications scroll list */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-slate-400 space-y-2">
          <Bell className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
          <p className="text-xs">No pending notifications</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 text-xs transition-colors flex items-start gap-3 ${
                item.isRead ? 'bg-white opacity-85' : 'bg-red-50/20'
              }`}
            >
              {/* Status dot / priority icon */}
              <div className="pt-0.5 shrink-0">
                {item.priority === 'urgent' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      item.isRead ? 'bg-slate-300' : 'bg-[#9B1B1B]'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className={`font-bold truncate ${item.isRead ? 'text-slate-800' : 'text-slate-900'}`}>
                    {item.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {item.createdAt}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed line-clamp-2">
                  {item.message}
                </p>
              </div>

              {!item.isRead && onMarkAsRead && (
                <button
                  type="button"
                  onClick={() => onMarkAsRead(item.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
