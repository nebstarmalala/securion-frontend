import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPerPage = 15 } = options;

  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback((totalPages: number) => {
    setPage(totalPages);
  }, []);

  const changePerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when changing items per page
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPerPage(initialPerPage);
  }, [initialPage, initialPerPage]);

  return {
    page,
    perPage,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePerPage,
    reset,
  };
}
