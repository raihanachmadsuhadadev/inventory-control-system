import { ChevronLeft, ChevronRight } from "lucide-react"

const defaultPageSizeOptions = [10, 25, 50]

function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = defaultPageSizeOptions,
}) {
  if (totalItems === 0) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <div className="pagination-bar">
      <p className="pagination-summary">
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>

      <div className="pagination-controls">
        <label className="pagination-size">
          <span>Per halaman</span>
          <select
            className="neo-input pagination-select"
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value))
              onPageChange(1)
            }}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="pagination-pages">
          <button
            aria-label="Halaman sebelumnya"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <ChevronLeft size={17} />
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            aria-label="Halaman berikutnya"
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
