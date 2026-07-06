import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  Building2,
  Clock,
  Package,
  ShoppingCart,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import NeumorphicButton from "../components/ui/NeumorphicButton"
import NeumorphicCard from "../components/ui/NeumorphicCard"
import { useToast } from "../context/ToastContext"
import AppLayout from "../layouts/AppLayout"
import api from "../lib/api"

const summaryConfig = [
  { key: "total_products", label: "Total Produk", icon: Package },
  { key: "total_suppliers", label: "Total Supplier", icon: Building2 },
  { key: "total_inventory_stock", label: "Total Stok", icon: Archive },
  { key: "critical_stock_count", label: "Stok Kritis", icon: AlertTriangle },
  { key: "reorder_recommendation_count", label: "Perlu Pemesanan", icon: ShoppingCart },
  { key: "pending_recommendation_count", label: "Rekomendasi Pending", icon: Clock },
]

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID")
}

function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [summary, setSummary] = useState({})
  const [criticalStocks, setCriticalStocks] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError("")
        const [summaryResponse, criticalResponse, reorderResponse] =
          await Promise.all([
            api.get("/dashboard/summary"),
            api.get("/dashboard/critical-stock"),
            api.get("/dashboard/reorder-alerts"),
          ])

        setSummary(summaryResponse.data?.data || {})
        setCriticalStocks(criticalResponse.data?.data || [])
        setRecommendations(reorderResponse.data?.data || [])
      } catch (fetchError) {
        const message =
          fetchError.response?.data?.message ||
          "Gagal memuat ringkasan dashboard."
        setError(message)
        showToast({ type: "error", message })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="page-title">Ringkasan Inventaris</h1>
          <p className="page-description">
            Pantau total stok, stok kritis, dan rekomendasi pemesanan pending
            dari data API terbaru.
          </p>
        </div>
        <NeumorphicButton onClick={() => navigate("/reports/inventory")}>
          Lihat Laporan
          <ArrowUpRight size={18} />
        </NeumorphicButton>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="summary-grid" aria-label="Ringkasan inventaris">
        {summaryConfig.map((item) => {
          const Icon = item.icon

          return (
            <NeumorphicCard key={item.key} className="summary-card compact">
              <div className="summary-top">
                <p className="summary-label">{item.label}</p>
                <div className="summary-icon">
                  <Icon size={21} />
                </div>
              </div>
              <p className="summary-value">
                {loading ? "..." : formatNumber(summary[item.key])}
              </p>
            </NeumorphicCard>
          )
        })}
      </section>

      <section className="content-grid">
        <NeumorphicCard>
          <div className="page-header">
            <div>
              <h2 className="neo-card-title">Stok Kritis</h2>
              <p className="neo-card-muted">
                Inventory dengan stok saat ini di bawah atau sama dengan minimum stok.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Memuat data...</div>
          ) : criticalStocks.length === 0 ? (
            <div className="empty-state">Tidak ada stok kritis.</div>
          ) : (
            <div className="table-wrap">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Supplier</th>
                    <th>Hub</th>
                    <th>Stok</th>
                    <th>Minimum</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalStocks.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td>{item.product?.name || "-"}</td>
                      <td>{item.product?.category?.name || "-"}</td>
                      <td>{item.product?.supplier?.name || "-"}</td>
                      <td>{item.hub?.name || "-"}</td>
                      <td>{formatNumber(item.current_stock)}</td>
                      <td>{formatNumber(item.product?.minimum_stock)}</td>
                      <td>
                        <span className="status-badge status-critical">
                          Kritis
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeumorphicCard>

        <NeumorphicCard>
          <h2 className="neo-card-title">Rekomendasi Pending</h2>
          <p className="neo-card-muted">
            Rekomendasi pemesanan yang masih menunggu verifikasi.
          </p>

          {loading ? (
            <div className="empty-state">Memuat data...</div>
          ) : recommendations.length === 0 ? (
            <div className="empty-state">Tidak ada rekomendasi pending.</div>
          ) : (
            <div className="recommendation-list">
              {recommendations.slice(0, 5).map((item) => (
                <article key={item.id} className="recommendation-item">
                  <h3>{item.product?.name || "-"}</h3>
                  <p className="neo-card-muted">
                    {item.hub?.name || "Tanpa hub"} - stok{" "}
                    {formatNumber(item.current_stock)} / ROP{" "}
                    {formatNumber(item.rop_value)}
                  </p>
                  <div className="recommendation-meta">
                    <span className="meta-pill">
                      Pesan {formatNumber(item.recommended_quantity)}
                    </span>
                    <span className="meta-pill">Pending</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </NeumorphicCard>
      </section>
    </AppLayout>
  )
}

export default Dashboard
