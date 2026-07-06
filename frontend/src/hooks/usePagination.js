import { useEffect, useMemo, useState } from "react"

function usePagination(items, resetKeys = [], initialPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const resetSignature = resetKeys.map((key) => String(key ?? "")).join("|")
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [resetSignature])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize

    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return {
    paginatedItems,
    paginationProps: {
      page,
      pageSize,
      totalItems: items.length,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    },
  }
}

export default usePagination
