import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import NeumorphicButton from "../components/ui/NeumorphicButton"
import NeumorphicCard from "../components/ui/NeumorphicCard"
import { useToast } from "../context/ToastContext"
import AppLayout from "../layouts/AppLayout"
import api from "../lib/api"

const configs = {
  category: {
    title: "Detail Kategori",
    endpoint: "/categories",
    backTo: "/categories",
    fields: [
      ["Nama", "name"],
      ["Kode", "code"],
      ["Deskripsi", "description"],
      ["Status", (item) => (item.is_active ? "Aktif" : "Nonaktif")],
    ],
  },
  hub: {
    title: "Detail Hub",
    endpoint: "/hubs",
    backTo: "/hubs",
    fields: [
      ["Nama", "name"],
      ["Kode", "code"],
      ["Alamat", "address"],
      ["Deskripsi", "description"],
      ["Status", (item) => (item.is_active ? "Aktif" : "Nonaktif")],
    ],
  },
  shift: {
    title: "Detail Shift",
    endpoint: "/shifts",
    backTo: "/shifts",
    fields: [
      ["Nama", "name"],
      ["Kode", "code"],
      ["Jam Mulai", "start_time"],
      ["Jam Selesai", "end_time"],
      ["Deskripsi", "description"],
      ["Status", (item) => (item.is_active ? "Aktif" : "Nonaktif")],
    ],
  },
  supplier: {
    title: "Detail Supplier",
    endpoint: "/suppliers",
    backTo: "/suppliers",
    fields: [
      ["Kode", "code"],
      ["Nama", "name"],
      ["Kontak", "contact_person"],
      ["Telepon", "phone"],
      ["Email", "email"],
      ["Alamat", "address"],
      ["Lead Time", (item) => item.lead_time_days ? `${item.lead_time_days} hari` : "-"],
      ["Deskripsi", "description"],
      ["Status", (item) => (item.is_active ? "Aktif" : "Nonaktif")],
    ],
  },
  product: {
    title: "Detail Produk",
    endpoint: "/products",
    backTo: "/products",
    fields: [
      ["Kode", "code"],
      ["Nama", "name"],
      ["Kategori", (item) => item.category?.name],
      ["Supplier", (item) => item.supplier?.name],
      ["Satuan", "unit"],
      ["Minimum Stok", "minimum_stock"],
      ["Deskripsi", "description"],
      ["Status", (item) => (item.is_active ? "Aktif" : "Nonaktif")],
    ],
  },
  inventory: {
    title: "Detail Inventaris",
    endpoint: "/inventories",
    backTo: "/inventories",
    fields: [
      ["Produk", (item) => item.product?.name],
      ["Kode Produk", (item) => item.product?.code],
      ["Kategori", (item) => item.product?.category?.name],
      ["Supplier", (item) => item.product?.supplier?.name],
      ["Hub", (item) => item.hub?.name],
      ["Current Stock", "current_stock"],
      ["Reserved Stock", "reserved_stock"],
      ["Available Stock", "available_stock"],
      ["Update Terakhir", (item) => formatDate(item.last_updated_at)],
    ],
  },
  stockTransaction: {
    title: "Detail Transaksi Stok",
    endpoint: "/stock-transactions",
    backTo: "/stock-transactions",
    fields: [
      ["Tanggal", (item) => formatDate(item.created_at)],
      ["Produk", (item) => item.product?.name],
      ["Hub", (item) => item.hub?.name],
      ["Tipe", "type"],
      ["Quantity", "quantity"],
      ["Stok Sebelum", "stock_before"],
      ["Stok Setelah", "stock_after"],
      ["Catatan", "notes"],
      ["Dibuat Oleh", (item) => item.creator?.name],
    ],
  },
  eoq: {
    title: "Detail EOQ",
    endpoint: "/eoq-calculations",
    backTo: "/eoq",
    fields: [
      ["Produk", (item) => item.product?.name],
      ["Annual Demand", "annual_demand"],
      ["Ordering Cost", "ordering_cost"],
      ["Holding Cost", "holding_cost"],
      ["Hasil EOQ", "eoq_result"],
      ["Dihitung Oleh", (item) => item.calculator?.name],
      ["Tanggal Hitung", (item) => formatDate(item.calculated_at)],
    ],
  },
  rop: {
    title: "Detail ROP",
    endpoint: "/rop-calculations",
    backTo: "/rop",
    fields: [
      ["Produk", (item) => item.product?.name],
      ["Hub", (item) => item.hub?.name],
      ["Daily Demand", "daily_demand"],
      ["Lead Time", (item) => `${item.lead_time_days} hari`],
      ["Safety Stock", "safety_stock"],
      ["Current Stock", "current_stock"],
      ["ROP", "rop_result"],
      ["Status", (item) => statusLabel(item.stock_status)],
      ["Dihitung Oleh", (item) => item.calculator?.name],
      ["Tanggal Hitung", (item) => formatDate(item.calculated_at)],
    ],
  },
  recommendation: {
    title: "Detail Rekomendasi Pemesanan",
    endpoint: "/purchase-recommendations",
    backTo: "/purchase-recommendations",
    fields: [
      ["Produk", (item) => item.product?.name],
      ["Hub", (item) => item.hub?.name],
      ["Stok Saat Ini", "current_stock"],
      ["ROP", "rop_value"],
      ["Rekomendasi Qty", "recommended_quantity"],
      ["Status", (item) => recommendationStatus(item.status)],
      ["Catatan", "notes"],
      ["Diverifikasi Oleh", (item) => item.verifier?.name],
      ["Diverifikasi Pada", (item) => formatDate(item.verified_at)],
      ["Dibuat Pada", (item) => formatDate(item.created_at)],
    ],
  },
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("id-ID") : "-"
}

function statusLabel(status) {
  return { safe: "Aman", reorder: "Perlu Pesan", critical: "Kritis" }[status] || "-"
}

function recommendationStatus(status) {
  return { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" }[status] || "-"
}

function valueOf(item, accessor) {
  if (typeof accessor === "function") {
    return accessor(item) || "-"
  }

  return item?.[accessor] ?? "-"
}

function DetailPage({ type }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const config = configs[type]
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await api.get(`${config.endpoint}/${id}`)
        setItem(response.data?.data || null)
      } catch (fetchError) {
        const message = fetchError.response?.data?.message || "Gagal memuat detail data."
        setError(message)
        showToast({ type: "error", message })
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [config.endpoint, id, showToast])

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Detail</p>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-description">Informasi lengkap data terpilih.</p>
        </div>
        <NeumorphicButton onClick={() => navigate(config.backTo)}>
          <ArrowLeft size={18} />
          Kembali
        </NeumorphicButton>
      </section>

      <NeumorphicCard>
        {error ? <p className="form-error">{error}</p> : null}
        {loading ? (
          <div className="empty-state">Memuat detail...</div>
        ) : !item ? (
          <div className="empty-state">Data tidak ditemukan.</div>
        ) : (
          <div className="detail-grid">
            {config.fields.map(([label, accessor]) => (
              <div key={label} className="detail-item">
                <span>{label}</span>
                <strong>{valueOf(item, accessor)}</strong>
              </div>
            ))}
            <div className="detail-item">
              <span>Created At</span>
              <strong>{formatDate(item.created_at)}</strong>
            </div>
            <div className="detail-item">
              <span>Updated At</span>
              <strong>{formatDate(item.updated_at)}</strong>
            </div>
          </div>
        )}
      </NeumorphicCard>
    </AppLayout>
  )
}

export default DetailPage
