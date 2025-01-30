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
    <div className="flex items-center justify-between px-2 py-3">
      <button
        onClick={() => onPageChange('previous')}
        disabled={page === 1 || isLoading}
        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
          ${page === 1 || isLoading
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer'
          }`}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-secondary" />
        ) : (
          <span className="text-sm font-medium text-text-primary">Page {page}</span>
        )}
      </div>

      <button
        onClick={() => onPageChange('next')}
        disabled={!hasMore || isLoading}
        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
          ${!hasMore || isLoading
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer'
          }`}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
} 