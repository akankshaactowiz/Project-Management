// hooks/usePagination.js
import { useState, useMemo } from "react";

export default function usePagination(data = [], defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // reset to first page
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
  };
}
