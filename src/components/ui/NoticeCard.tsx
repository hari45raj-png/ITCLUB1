/**
 * St. Mary's English School - IT Club Platform
 * Notice Card Foundation
 * 
 * PROMPT 5: Academic Circular & Notice Presentation
 * 
 * Features:
 * - Priority status (Urgent, General, Academic)
 * - Published date & Pin indicator
 * - Attachment count badge
 */

import React from 'react';
import { Badge } from './Badge';
import { Bell, Pin, Paperclip, Calendar, ArrowRight } from 'lucide-react';

export interface NoticeData {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  isPinned?: boolean;
  priority?: 'urgent' | 'general' | 'academic';
  hasAttachments?: boolean;
  attachmentCount?: number;
}

export interface NoticeCardProps {
  notice: NoticeData;
  onViewNotice?: (notice: NoticeData) => void;
  className?: string;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onViewNotice,
  className = '',
}) => {
  const formattedDate = new Date(notice.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-2xs transition-all ${
        notice.isPinned
          ? 'border-pink-200 bg-pink-50/10'
          : 'border-neutral-200 hover:border-neutral-300'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {notice.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              <Pin className="w-3 h-3" />
              <span>PINNED</span>
            </span>
          )}
          <Badge
            variant={
              notice.priority === 'urgent'
                ? 'error'
                : notice.priority === 'academic'
                ? 'info'
                : 'default'
            }
            size="xs"
          >
            {notice.priority || 'General'}
          </Badge>
        </div>

        <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </span>
      </div>

      <h4 className="font-bold text-neutral-900 text-sm leading-snug mb-1.5 hover:text-pink-600 transition-colors">
        {notice.title}
      </h4>

      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
        {notice.content}
      </p>

      <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        {notice.hasAttachments ? (
          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Paperclip className="w-3 h-3 text-neutral-400" />
            <span>{notice.attachmentCount || 1} Document Attached</span>
          </span>
        ) : (
          <span />
        )}

        {onViewNotice && (
          <button
            type="button"
            onClick={() => onViewNotice(notice)}
            className="text-xs font-semibold text-neutral-900 hover:text-pink-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Read Notice</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
