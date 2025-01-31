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

  // Reset state when queryKey changes
  useEffect(() => {
    activeQueryKeyRef.current = queryKeyString;
    setPage(1);
    setPages([]);
    setIsLastPage(false);
    console.log('Paginator state reset for new query key:', queryKeyString);
  }, [queryKeyString]);

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const currentKey = activeQueryKeyRef.current;
      console.log('Fetching first page for query key:', currentKey);
      
      const result = await fetchFirstPage();
      
      // Check if we're still handling the same query key
      if (activeQueryKeyRef.current !== currentKey) {
        console.log('Abandoning stale query result for key:', currentKey);
        return null as unknown as Paginator<T>;
      }

      setPages([result]);
      setPage(1);
      setIsLastPage(!result.data.length || result.data.length < 10);
      return result;
    },
    ...options
  });

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
      queryClient.cancelQueries(queryKey);
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