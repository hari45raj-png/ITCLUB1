/**
 * St. Mary's English School - IT Club Platform
 * Gallery Card Foundation
 * 
 * PROMPT 5: Academic Media & Event Gallery Presentation
 * 
 * Features:
 * - Proper aspect ratio container (16:9 or 4:3)
 * - Category / Event tag
 * - Lightbox view trigger
 * - Mobile responsive sizing
 */

import React from 'react';
import { Image as ImageIcon, ZoomIn, Calendar } from 'lucide-react';

export interface GalleryItemData {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  eventDate?: string;
  description?: string;
}

export interface GalleryCardProps {
  item: GalleryItemData;
  onOpenLightbox?: (item: GalleryItemData) => void;
  className?: string;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  item,
  onOpenLightbox,
  className = '',
}) => {
  return (
    <div
      onClick={() => onOpenLightbox && onOpenLightbox(item)}
      className={`group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col ${className}`}
    >
      {/* 16:9 Image container */}
      <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-8 h-8 stroke-1" />
            <span className="text-[10px] mt-1">SMES Media</span>
          </div>
        )}

        {/* Category tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs px-2 py-0.5 rounded-md">
            {item.category}
          </span>
        </div>

        {/* Hover zoom overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="p-2 rounded-full bg-white/90 text-slate-800 shadow-sm">
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Caption & Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <h4 className="font-bold text-neutral-900 text-sm leading-snug group-hover:text-pink-600 transition-colors truncate">
          {item.title}
        </h4>
        {item.eventDate && (
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{item.eventDate}</span>
          </p>
        )}
      </div>
    </div>
  );
};
