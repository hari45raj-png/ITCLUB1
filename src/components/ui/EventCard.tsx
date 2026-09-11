/**
 * St. Mary's English School - IT Club Platform
 * Event Card Foundation
 * 
 * PROMPT 5: Academic Event Presentation
 * 
 * Features:
 * - Clean date block (month + day)
 * - Academic venue & time badges
 * - Status pills (Upcoming, Completed)
 * - Zero excessive promotional clutter
 */

import React from 'react';
import { Badge } from './Badge';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

export interface EventData {
  id: string;
  title: string;
  date: string; // ISO date string
  time?: string;
  venue?: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  category?: string;
}

export interface EventCardProps {
  event: EventData;
  onViewDetails?: (event: EventData) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  className = '',
}) => {
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <div
      className={`bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs hover:border-neutral-300 hover:shadow-xs transition-all flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* Date block with clean modern typography */}
        <div className="w-13 h-14 rounded-lg bg-neutral-50 border border-neutral-200/80 flex flex-col items-center justify-center shrink-0 text-center">
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider leading-none">
            {month}
          </span>
          <span className="text-xl font-extrabold text-neutral-900 leading-none mt-1">
            {day}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              {event.category || 'Academic Workshop'}
            </span>
            <Badge variant={event.status === 'upcoming' ? 'upcoming' : 'completed'} size="xs">
              {event.status}
            </Badge>
          </div>

          <h4 className="font-bold text-neutral-900 text-base leading-snug truncate">
            {event.title}
          </h4>

          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>

      {/* Meta details & link */}
      <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-3 text-[11px]">
          {event.time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{event.time}</span>
            </span>
          )}
          {event.venue && (
            <span className="flex items-center gap-1 truncate max-w-[140px]">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span className="truncate">{event.venue}</span>
            </span>
          )}
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(event)}
            className="text-xs font-semibold text-neutral-900 hover:text-pink-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
