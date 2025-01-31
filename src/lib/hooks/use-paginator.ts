import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Paginator } from '@megayours/sdk';
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function usePaginator<T>(
  queryKey: readonly unknown[],
  fetchFirstPage: () => Promise<Paginator<T>>,
  options?: Omit<UseQueryOptions<Paginator<T>, Error>, 'queryKey' | 'queryFn'>
) {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<Paginator<T>[]>([]);
  const [isLastPage, setIsLastPage] = useState(false);
  const queryKeyString = JSON.stringify(queryKey);
  const activeQueryKeyRef = useRef(queryKeyString);
  const isInitializedRef = useRef(false);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();

  // Add query key change debug
  useEffect(() => {
    const hasChanged = queryKeyString !== activeQueryKeyRef.current;
    console.log('Paginator query key changed:', {
      newKey: queryKey,
      oldKey: JSON.parse(activeQueryKeyRef.current),
      changed: hasChanged,
      isInitialized: isInitializedRef.current,
      enabled: options?.enabled
    });

    // Only reset if we've already initialized and the key actually changed
    if (isInitializedRef.current && hasChanged) {
      // Clear any pending reset
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      // Debounce the reset to prevent rapid resets during initialization
      resetTimeoutRef.current = setTimeout(() => {
        console.log('Paginator state reset for new query key:', queryKeyString);
        activeQueryKeyRef.current = queryKeyString;
        setPage(1);
        setPages([]);
        setIsLastPage(false);
      }, 100); // Small delay to debounce resets
    } else if (!isInitializedRef.current) {
      activeQueryKeyRef.current = queryKeyString;
    }

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [queryKeyString, options?.enabled]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const currentKey = activeQueryKeyRef.current;
      console.log('Fetching first page for query key:', currentKey, {
        enabled: options?.enabled,
        queryKey,
        isInitialized: isInitializedRef.current
      });
      
      const result = await fetchFirstPage();
      console.log('Fetch result for query key:', currentKey, {
        hasData: !!result?.data?.length,
        dataLength: result?.data?.length
      });
      
      // Check if we're still handling the same query key
      if (activeQueryKeyRef.current !== currentKey) {
        console.log('Abandoning stale query result for key:', currentKey);
        return null as unknown as Paginator<T>;
      }

      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
      }

      setPages([result]);
      setPage(1);
      setIsLastPage(!result.data.length || result.data.length < 10);
      return result;
    },
    enabled: options?.enabled !== false && !isInitializedRef.current, // Only enable if not initialized and enabled is true
    ...options
  });

  // Force refetch when enabled changes to true
  useEffect(() => {
    if (options?.enabled && !isInitializedRef.current) {
      console.log('Forcing refetch due to enabled state change:', {
        queryKey,
        enabled: options?.enabled,
        isInitialized: isInitializedRef.current
      });
      void query.refetch();
    }
  }, [options?.enabled, queryKey]);

  const fetchNextPage = async () => {
    const currentPaginator = pages[pages.length - 1];
    if (currentPaginator && !isLastPage) {
      const nextPage = await currentPaginator.fetchNext();
      if (nextPage) {
        const isLast = !nextPage.data.length || nextPage.data.length < 10;
        setIsLastPage(isLast);
        setPages([...pages, nextPage]);
        setPage(p => p + 1);
      }
    }
  };

  const fetchPreviousPage = async () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const currentPaginator = pages[page - 1];
  const hasNextPage = !isLastPage && currentPaginator?.data.length === 10;
  const hasPreviousPage = page > 1;

  // Add query cancellation on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      queryClient.cancelQueries({ queryKey });
    };
  }, [queryKeyString]);

  return {
    ...query,
    data: currentPaginator,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    pageIndex: page
  };
} 