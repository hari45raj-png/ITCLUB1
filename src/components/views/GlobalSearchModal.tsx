/**
 * St. Mary's English School - IT Club Platform
 * Global Search UI Foundation
 * 
 * PROMPT 5: Global Search Dialog Pattern
 * 
 * Specification:
 * - Search overlay across all public content domains:
 *   Members, Projects, Events, Notices, Resources, Question Papers
 * - Category filters
 * - Keyboard accessible (Esc to close)
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { SearchControl } from '../ui/SearchControl';
import { Badge } from '../ui/Badge';
import { Users, Calendar, Bell, BookOpen, FileQuestion, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (section: string) => void;
}

const SEARCH_DOMAINS = [
  { id: 'all', label: 'All Results' },
  { id: 'members', label: 'Members' },
  { id: 'events', label: 'Events' },
  { id: 'notices', label: 'Notices' },
  { id: 'resources', label: 'Resources' },
  { id: 'question-papers', label: 'Question Papers' },
];

const MOCK_INDEX = [
  {
    id: 's-1',
    title: 'Aarav Sharma — President',
    domain: 'members',
    section: 'members',
    description: 'Class 12-A • Algorithmic Computing & Full-Stack Architecture',
    icon: Users,
  },
  {
    id: 's-2',
    title: 'Inter-School Hackathon & Algorithmic Challenge 2026',
    domain: 'events',
    section: 'events',
    description: 'Oct 15, 2026 • Senior Computer Lab',
    icon: Calendar,
  },
  {
    id: 's-3',
    title: 'Class 10 Pre-Board Computer Applications Model Question Paper',
    domain: 'question-papers',
    section: 'resources',
    description: 'CBSE curriculum format with code solutions and model answer keys',
    icon: FileQuestion,
  },
  {
    id: 's-4',
    title: 'Schedule for Annual IT Club Executive Council Elections',
    domain: 'notices',
    section: 'notices',
    description: 'Urgent notice regarding nomination submissions for 2026-27',
    icon: Bell,
  },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = MOCK_INDEX.filter((item) => {
    const matchesDomain = activeCategory === 'all' || item.domain === activeCategory;
    const matchesQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase());
    return matchesDomain && matchesQuery;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Platform" maxWidth="md">
      <div className="space-y-4">
        <SearchControl
          value={query}
          onChange={setQuery}
          placeholder="Search by topic, keyword, or student name..."
          categories={SEARCH_DOMAINS}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Results List */}
        <div className="space-y-2 pt-2 max-h-[360px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate && onNavigate(item.section);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#9B1B1B]/10 group-hover:text-[#9B1B1B] transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#9B1B1B] transition-colors truncate">
                        {item.title}
                      </h4>
                      <Badge variant="default" size="xs">
                        {item.domain}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#9B1B1B] shrink-0 mt-1" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
