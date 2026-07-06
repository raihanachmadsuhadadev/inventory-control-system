import { Check, Eye, RefreshCw, Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import NeumorphicButton from "../components/ui/NeumorphicButton"
import NeumorphicCard from "../components/ui/NeumorphicCard"
import Pagination from "../components/ui/Pagination"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import usePagination from "../hooks/usePagination"
import AppLayout from "../layouts/AppLayout"
import api from "../lib/api"

const statusMap = {
  pending: { label: "Menunggu", className: "status-order" },
  approved: { label: "Disetujui", className: "status-safe" },
  rejected: { label: "Ditolak", className: "status-critical" },
}

function statusBadge(status) {
  const config = statusMap[status] || statusMap.pending

  return <span className={`status-badge ${config.className}`}>{config.label}</span>
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID")
}

function PurchaseRecommendations() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const canGenerate = ["super_admin", "admin_gudang"].includes(user?.role?.slug)
  const canVerify = ["super_admin", "manager_gudang"].includes(user?.role?.slug)
  const [recommendations, setRecommendations] = useState([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get("/purchase-recommendations")
      setRecommendations(response.data?.data || [])
    } catch (fetchError) {
      const message =
        fetchError.response?.data?.message ||
        "Gagal memuat rekomendasi pemesanan."
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const filteredRecommendations = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    return recommendations.filter((item) => {
      const matchesStatus = status === "all" || item.status === status
      const searchable = [
        item.product?.code,
        item.product?.name,
        item.hub?.name,
        item.status,
        item.verifier?.name,
        item.notes,
      ]
        .join(" ")
        .toLowerCase()

      return matchesStatus && (!keyword || searchable.includes(keyword))
    })
  }, [recommendations, search, status])
  const { paginatedItems: paginatedRecommendations, paginationProps } =
    usePagination(filteredRecommendations, [search, status])

  const handleGenerate = async () => {
    try {
      setProcessing(true)
      setError("")
      const response = await api.post("/purchase-recommendations/generate")
      setSummary(response.data?.data || null)
      showToast({ type: "success", message: "Rekomendasi berhasil digenerate." })
      await fetchRecommendations()
    } catch (generateError) {
      const message =
        generateError.response?.data?.message ||
        "Gagal generate rekomendasi pemesanan."
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setProcessing(false)
    }
  }

  const handleVerify = async (item, action) => {
    const note = window.prompt(
      action === "approve"
        ? "Catatan persetujuan (opsional)"
        : "Alasan penolakan (opsional)",
      item.notes || "",
    )

    if (note === null) {
      return
    }

    try {
      setProcessing(true)
      setError("")
      await api.put(`/purchase-recommendations/${item.id}/${action}`, {
        notes: note,
      })
      showToast({
        type: "success",
        message:
          action === "approve"
            ? "Rekomendasi berhasil disetujui."
            : "Rekomendasi berhasil ditolak.",
      })
      await fetchRecommendations()
    } catch (verifyError) {
      const message =
        verifyError.response?.data?.message ||
        "Gagal memproses rekomendasi pemesanan."
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Rekomendasi</p>
          <h1 className="page-title">Rekomendasi Pemesanan</h1>
          <p className="page-description">
            Buat dan verifikasi rekomendasi pemesanan dari stok aktual, ROP,
            dan EOQ terbaru.
          </p>
        </div>
        {canGenerate ? (
          <NeumorphicButton
            variant="primary"
            onClick={handleGenerate}
            disabled={processing}
          >
            <RefreshCw size={18} />
            {processing ? "Memproses..." : "Generate Rekomendasi"}
          </NeumorphicButton>
        ) : null}
      </section>

      {summary ? (
        <section className="summary-grid">
          <NeumorphicCard className="summary-card compact">
            <p className="summary-label">Dibuat</p>
            <p className="summary-value">{summary.created}</p>
          </NeumorphicCard>
          <NeumorphicCard className="summary-card compact">
            <p className="summary-label">Diperbarui</p>
            <p className="summary-value">{summary.updated}</p>
          </NeumorphicCard>
          <NeumorphicCard className="summary-card compact">
            <p className="summary-label">Dilewati</p>
            <p className="summary-value">{summary.skipped}</p>
          </NeumorphicCard>
        </section>
      ) : null}

      <NeumorphicCard>
        <div className="master-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari rekomendasi..."
              type="search"
            />
          </div>
          <select
            className="neo-input toolbar-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="empty-state">Belum ada rekomendasi pemesanan.</div>
        ) : (
          <div className="table-wrap">
            <table className="stock-table master-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>Hub</th>
                  <th>Stok Saat Ini</th>
                  <th>ROP</th>
                  <th>Rekomendasi Qty</th>
                  <th>Status</th>
                  <th>Diverifikasi Oleh</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecommendations.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString("id-ID")}</td>
                    <td>{item.product?.name || "-"}</td>
                    <td>{item.hub?.name || "-"}</td>
                    <td>{formatNumber(item.current_stock)}</td>
                    <td>{formatNumber(item.rop_value)}</td>
                    <td>{formatNumber(item.recommended_quantity)}</td>
                    <td>{statusBadge(item.status)}</td>
                    <td>{item.verifier?.name || "-"}</td>
                    <td>{item.notes || "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          aria-label={`Detail ${item.product?.name}`}
                          onClick={() => navigate(`/purchase-recommendations/${item.id}`)}
                          type="button"
                        >
                          <Eye size={16} />
                        </button>
                        {canVerify && item.status === "pending" ? (
                          <>
                          <button
                            aria-label={`Setujui ${item.product?.name}`}
                            onClick={() => handleVerify(item, "approve")}
                            type="button"
                            disabled={processing}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            aria-label={`Tolak ${item.product?.name}`}
                            onClick={() => handleVerify(item, "reject")}
                            type="button"
                            disabled={processing}
                          >
                            <X size={16} />
                          </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination {...paginationProps} />
          </div>
        )}
      </NeumorphicCard>
    </AppLayout>
  )
}

export default PurchaseRecommendations
