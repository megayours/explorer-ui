'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  isLoading: boolean;
  hasMore: boolean;
  onPageChange: (direction: 'next' | 'previous') => Promise<void>;
}

export function PaginationControls({
  page,
  isLoading,
  hasMore,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange('previous')}
        disabled={isLoading || page === 1}
        className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 
                 hover:border-zinc-600/50 transition-all duration-300 text-white
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {isLoading ? (
        <div className="w-16 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="w-16 text-center">
          <span className="text-sm font-medium text-zinc-400">Page {page}</span>
        </div>
      )}

      <button
        onClick={() => onPageChange('next')}
        disabled={isLoading || !hasMore}
        className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 
                 hover:border-zinc-600/50 transition-all duration-300 text-white
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
} 