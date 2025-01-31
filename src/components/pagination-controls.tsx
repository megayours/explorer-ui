'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  isLoading: boolean;
  hasMore: boolean;
  onPageChange: (direction: 'next' | 'previous') => Promise<void>;
  variant?: 'default' | 'subtle';
}

export function PaginationControls({
  page,
  isLoading,
  hasMore,
  onPageChange,
  variant = 'default',
}: PaginationControlsProps) {
  if (variant === 'subtle') {
    return (
      <div className="flex items-center gap-2 text-text-secondary">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange('previous')}
            disabled={page === 1 || isLoading}
            className="p-1 rounded-md hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm min-w-[2rem] text-center">{page}</span>
          <button
            onClick={() => onPageChange('next')}
            disabled={!hasMore || isLoading}
            className="p-1 rounded-md hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={() => onPageChange('previous')}
        disabled={page === 1 || isLoading}
        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90
                 border border-border transition-all duration-300 text-sm font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <button
        onClick={() => onPageChange('next')}
        disabled={!hasMore || isLoading}
        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90
                 border border-border transition-all duration-300 text-sm font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
} 