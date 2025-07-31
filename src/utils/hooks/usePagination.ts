import { useState } from "react";
import type { PaginationProps } from "antd";

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
  onAfterPageChange?: () => void;
}

interface DeleteAndHandlePaginationProps {
  dataLength: number;
  onDelete: () => Promise<void>;
  fetchData: () => void;
}

export function usePagination(options?: UsePaginationOptions) {
  const [curPage, setCurPage] = useState(options?.initialPage ?? 1);
  const [perPage, setPerPage] = useState(options?.initialPerPage ?? 10);
  const pageSizeOptions = [10, 20, 40, 80, 100];

  const onPageChange = (page: number) => {
    setCurPage(page);
    options?.onAfterPageChange?.();
  };

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    _,
    pageSize
  ) => {
    setPerPage(pageSize);
    options?.onAfterPageChange?.();
  };

  const deleteAndHandlePagination = async ({
    dataLength,
    onDelete,
    fetchData,
  }: DeleteAndHandlePaginationProps) => {
    await onDelete();

    const remaining = dataLength - 1;

    if (remaining === 0 && curPage > 1) {
      setCurPage(curPage - 1);
    } else {
      fetchData();
    }
  };

  return {
    curPage,
    perPage,
    pageSizeOptions,
    setCurPage,
    setPerPage,
    onPageChange,
    onShowSizeChange,
    deleteAndHandlePagination,
  };
}
