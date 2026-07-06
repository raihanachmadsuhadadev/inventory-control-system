import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import NeumorphicCard from "../../components/ui/NeumorphicCard"
import { useToast } from "../../context/ToastContext"
import AppLayout from "../../layouts/AppLayout"
import api from "../../lib/api"

const statusMap = {
  safe: { label: "Aman", className: "status-safe" },
  reorder: { label: "Perlu Pesan", className: "status-order" },
  critical: { label: "Kritis", className: "status-critical" },
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID")
}

function statusBadge(status) {
  if (!status) {
    return "-"
  }

  const config = statusMap[status] || statusMap.safe

  return <span className={`status-badge ${config.className}`}>{config.label}</span>
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("id-ID") : "-"
}

function EoqRopReport() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await api.get("/reports/eoq-rop")
        setRows(response.data?.data || [])
      } catch (fetchError) {
        const message =
          fetchError.response?.data?.message ||
          "Gagal memuat laporan EOQ & ROP."
        setError(message)
        showToast({ type: "error", message })
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    if (!keyword) {
      return rows
    }

    return rows.filter((row) =>
      [row.product?.code, row.product?.name, row.status]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    )
  }, [rows, search])

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Laporan</p>
          <h1 className="page-title">Laporan EOQ & ROP</h1>
          <p className="page-description">
            Lihat hasil perhitungan EOQ dan ROP terbaru per produk.
          </p>
        </div>
      </section>

      <NeumorphicCard>
        <div className="master-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari produk atau status..."
              type="search"
            />
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : filteredRows.length === 0 ? (
          <div className="empty-state">Tidak ada data laporan EOQ & ROP.</div>
        ) : (
          <div className="table-wrap">
            <table className="stock-table master-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>EOQ Terakhir</th>
                  <th>ROP Terakhir</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Tanggal EOQ</th>
                  <th>Tanggal ROP</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.product?.id}>
                    <td>{row.product?.name || "-"}</td>
                    <td>{formatNumber(row.latest_eoq?.eoq_result)}</td>
                    <td>{formatNumber(row.latest_rop?.rop_result)}</td>
                    <td>{formatNumber(row.current_stock)}</td>
                    <td>{statusBadge(row.status)}</td>
                    <td>{formatDate(row.eoq_calculated_at)}</td>
                    <td>{formatDate(row.rop_calculated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NeumorphicCard>
    </AppLayout>
  )
}

export default EoqRopReport
