import { Calculator, Eye, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import NeumorphicButton from "../components/ui/NeumorphicButton"
import NeumorphicCard from "../components/ui/NeumorphicCard"
import NeumorphicInput from "../components/ui/NeumorphicInput"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import AppLayout from "../layouts/AppLayout"
import api from "../lib/api"

const initialForm = {
  product_id: "",
  hub_id: "",
  daily_demand: "",
  lead_time_days: "",
  safety_stock: "",
}

const statusMap = {
  safe: { label: "Aman", className: "status-safe" },
  reorder: { label: "Perlu Pesan", className: "status-order" },
  critical: { label: "Kritis", className: "status-critical" },
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID")
}

function Rop() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const canCalculate = ["super_admin", "admin_gudang"].includes(user?.role?.slug)
  const [calculations, setCalculations] = useState([])
  const [products, setProducts] = useState([])
  const [hubs, setHubs] = useState([])
  const [form, setForm] = useState(initialForm)
  const [lastResult, setLastResult] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      const [calculationResponse, productResponse, hubResponse] =
        await Promise.all([
          api.get("/rop-calculations"),
          api.get("/products"),
          api.get("/hubs"),
        ])

      setCalculations(calculationResponse.data?.data || [])
      setProducts(productResponse.data?.data || [])
      setHubs(hubResponse.data?.data || [])
    } catch (fetchError) {
      const message =
        fetchError.response?.data?.message ||
        "Gagal memuat data perhitungan ROP."
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredCalculations = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    if (!keyword) {
      return calculations
    }

    return calculations.filter((item) =>
      [item.product?.code, item.product?.name, item.hub?.name, item.calculator?.name]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    )
  }, [calculations, search])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!canCalculate) {
      return
    }

    try {
      setSaving(true)
      setError("")
      const response = await api.post("/rop-calculations", {
        product_id: form.product_id,
        hub_id: form.hub_id || null,
        daily_demand: Number(form.daily_demand),
        lead_time_days: Number(form.lead_time_days),
        safety_stock: Number(form.safety_stock),
      })

      setLastResult(response.data?.data || null)
      setForm(initialForm)
      showToast({ type: "success", message: "Perhitungan ROP berhasil disimpan." })
      await fetchData()
    } catch (saveError) {
      const validationErrors = saveError.response?.data?.errors
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null

      const message =
        firstValidationError ||
        saveError.response?.data?.message ||
        "Gagal menghitung ROP."
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setSaving(false)
    }
  }

  const renderStatus = (status) => {
    const statusConfig = statusMap[status] || statusMap.safe

    return (
      <span className={`status-badge ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    )
  }

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Perhitungan</p>
          <h1 className="page-title">ROP</h1>
          <p className="page-description">
            Hitung titik pemesanan kembali berdasarkan demand harian, lead time,
            safety stock, dan stok aktual.
          </p>
        </div>
      </section>

      <section className="calculation-grid">
        {canCalculate ? (
          <NeumorphicCard className="master-form-card">
            <h2 className="neo-card-title">Form Perhitungan ROP</h2>
            <form className="master-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="product_id">Produk</label>
                <select
                  id="product_id"
                  className="neo-input"
                  value={form.product_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      product_id: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Pilih produk</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="hub_id">Hub</label>
                <select
                  id="hub_id"
                  className="neo-input"
                  value={form.hub_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      hub_id: event.target.value,
                    }))
                  }
                >
                  <option value="">Tanpa hub</option>
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
              </div>

              <NeumorphicInput
                id="daily_demand"
                label="Daily Demand"
                min="1"
                type="number"
                value={form.daily_demand}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    daily_demand: event.target.value,
                  }))
                }
                required
              />
              <NeumorphicInput
                id="lead_time_days"
                label="Lead Time Days"
                min="0"
                type="number"
                value={form.lead_time_days}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lead_time_days: event.target.value,
                  }))
                }
                required
              />
              <NeumorphicInput
                id="safety_stock"
                label="Safety Stock"
                min="0"
                type="number"
                value={form.safety_stock}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    safety_stock: event.target.value,
                  }))
                }
                required
              />
              <NeumorphicButton type="submit" variant="primary" disabled={saving}>
                <Calculator size={18} />
                {saving ? "Menghitung..." : "Hitung ROP"}
              </NeumorphicButton>
            </form>
          </NeumorphicCard>
        ) : null}

        <NeumorphicCard>
          <h2 className="neo-card-title">Hasil ROP Terakhir</h2>
          {lastResult ? (
            <div className="result-card">
              <span>{lastResult.product?.name}</span>
              <strong>{formatNumber(lastResult.rop_result)}</strong>
              <p>Current stock: {formatNumber(lastResult.current_stock)}</p>
              {renderStatus(lastResult.stock_status)}
            </div>
          ) : (
            <div className="empty-state">Belum ada hasil baru dari sesi ini.</div>
          )}
        </NeumorphicCard>
      </section>

      <NeumorphicCard>
        <div className="master-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari riwayat ROP..."
              type="search"
            />
          </div>
          {!canCalculate ? (
            <span className="readonly-note">Mode lihat saja</span>
          ) : null}
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : filteredCalculations.length === 0 ? (
          <div className="empty-state">Belum ada riwayat ROP.</div>
        ) : (
          <div className="table-wrap">
            <table className="stock-table master-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>Hub</th>
                  <th>Daily Demand</th>
                  <th>Lead Time</th>
                  <th>Safety Stock</th>
                  <th>Current Stock</th>
                  <th>ROP</th>
                  <th>Status</th>
                  <th>Dihitung Oleh</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalculations.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.calculated_at).toLocaleString("id-ID")}</td>
                    <td>{item.product?.name || "-"}</td>
                    <td>{item.hub?.name || "-"}</td>
                    <td>{formatNumber(item.daily_demand)}</td>
                    <td>{item.lead_time_days} hari</td>
                    <td>{formatNumber(item.safety_stock)}</td>
                    <td>{formatNumber(item.current_stock)}</td>
                    <td>{formatNumber(item.rop_result)}</td>
                    <td>{renderStatus(item.stock_status)}</td>
                    <td>{item.calculator?.name || "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => navigate(`/rop/${item.id}`)}>
                          <Eye size={16} />
                        </button>
                      </div>
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

export default Rop
