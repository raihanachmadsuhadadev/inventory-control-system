import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import NeumorphicCard from "../../components/ui/NeumorphicCard"
import { useToast } from "../../context/ToastContext"
import AppLayout from "../../layouts/AppLayout"
import api from "../../lib/api"

const statusLabels = {
  all: "Semua Status",
  critical: "Kritis",
  safe: "Aman",
}

function statusBadge(status) {
  return (
    <span
      className={`status-badge ${
        status === "critical" ? "status-critical" : "status-safe"
      }`}
    >
      {statusLabels[status] || "Aman"}
    </span>
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID")
}

function InventoryReport() {
  const { showToast } = useToast()
  const [rows, setRows] = useState([])
  const [hubs, setHubs] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    hub_id: "",
    category_id: "",
    status: "all",
  })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOptions = async () => {
      const [hubResponse, categoryResponse] = await Promise.all([
        api.get("/hubs"),
        api.get("/categories"),
      ])

      setHubs(hubResponse.data?.data || [])
      setCategories(categoryResponse.data?.data || [])
    }

    fetchOptions().catch(() => null)
  }, [])

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError("")
        const params = {
          hub_id: filters.hub_id || undefined,
          category_id: filters.category_id || undefined,
          status: filters.status === "all" ? undefined : filters.status,
        }
        const response = await api.get("/reports/inventory", { params })
        setRows(response.data?.data || [])
      } catch (fetchError) {
        const message =
          fetchError.response?.data?.message ||
          "Gagal memuat laporan persediaan."
        setError(message)
        showToast({ type: "error", message })
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [filters])

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    if (!keyword) {
      return rows
    }

    return rows.filter((row) =>
      [
        row.product?.code,
        row.product?.name,
        row.product?.category?.name,
        row.product?.supplier?.name,
        row.hub?.name,
      ]
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
          <h1 className="page-title">Laporan Persediaan</h1>
          <p className="page-description">
            Lihat kondisi stok per produk, kategori, supplier, dan hub.
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
              placeholder="Cari laporan persediaan..."
              type="search"
            />
          </div>
          <select
            className="neo-input toolbar-select"
            value={filters.hub_id}
            onChange={(event) =>
              setFilters((current) => ({ ...current, hub_id: event.target.value }))
            }
          >
            <option value="">Semua Hub</option>
            {hubs.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name}
              </option>
            ))}
          </select>
          <select
            className="neo-input toolbar-select"
            value={filters.category_id}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category_id: event.target.value,
              }))
            }
          >
            <option value="">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="neo-input toolbar-select"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="all">Semua Status</option>
            <option value="safe">Aman</option>
            <option value="critical">Kritis</option>
          </select>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : filteredRows.length === 0 ? (
          <div className="empty-state">Tidak ada data laporan persediaan.</div>
        ) : (
          <div className="table-wrap">
            <table className="stock-table master-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Supplier</th>
                  <th>Hub</th>
                  <th>Current Stock</th>
                  <th>Available Stock</th>
                  <th>Minimum Stock</th>
                  <th>Status</th>
                  <th>Update Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.product?.name || "-"}</td>
                    <td>{row.product?.category?.name || "-"}</td>
                    <td>{row.product?.supplier?.name || "-"}</td>
                    <td>{row.hub?.name || "-"}</td>
                    <td>{formatNumber(row.current_stock)}</td>
                    <td>{formatNumber(row.available_stock)}</td>
                    <td>{formatNumber(row.minimum_stock)}</td>
                    <td>{statusBadge(row.status)}</td>
                    <td>
                      {row.last_updated_at
                        ? new Date(row.last_updated_at).toLocaleString("id-ID")
                        : "-"}
                    </td>
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

export default InventoryReport
