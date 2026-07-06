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
  annual_demand: "",
  ordering_cost: "",
  holding_cost: "",
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID")
}

function Eoq() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const canCalculate = ["super_admin", "admin_gudang"].includes(user?.role?.slug)
  const [calculations, setCalculations] = useState([])
  const [products, setProducts] = useState([])
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
      const [calculationResponse, productResponse] = await Promise.all([
        api.get("/eoq-calculations"),
        api.get("/products"),
      ])

      setCalculations(calculationResponse.data?.data || [])
      setProducts(productResponse.data?.data || [])
    } catch (fetchError) {
      const message =
        fetchError.response?.data?.message ||
        "Gagal memuat data perhitungan EOQ."
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
      [item.product?.code, item.product?.name, item.calculator?.name]
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
      const response = await api.post("/eoq-calculations", {
        product_id: form.product_id,
        annual_demand: Number(form.annual_demand),
        ordering_cost: Number(form.ordering_cost),
        holding_cost: Number(form.holding_cost),
      })

      setLastResult(response.data?.data || null)
      setForm(initialForm)
      showToast({ type: "success", message: "Perhitungan EOQ berhasil disimpan." })
      await fetchData()
    } catch (saveError) {
      const validationErrors = saveError.response?.data?.errors
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null

      const message =
        firstValidationError ||
        saveError.response?.data?.message ||
        "Gagal menghitung EOQ."
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Perhitungan</p>
          <h1 className="page-title">EOQ</h1>
          <p className="page-description">
            Hitung jumlah pemesanan optimal berdasarkan kebutuhan, biaya pesan,
            dan biaya simpan.
          </p>
        </div>
      </section>

      <section className="calculation-grid">
        {canCalculate ? (
          <NeumorphicCard className="master-form-card">
            <h2 className="neo-card-title">Form Perhitungan EOQ</h2>
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

              <NeumorphicInput
                id="annual_demand"
                label="Kebutuhan Periode"
                min="1"
                type="number"
                value={form.annual_demand}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    annual_demand: event.target.value,
                  }))
                }
                required
              />
              <NeumorphicInput
                id="ordering_cost"
                label="Biaya Pemesanan"
                min="1"
                type="number"
                value={form.ordering_cost}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ordering_cost: event.target.value,
                  }))
                }
                required
              />
              <NeumorphicInput
                id="holding_cost"
                label="Biaya Penyimpanan"
                min="1"
                type="number"
                value={form.holding_cost}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    holding_cost: event.target.value,
                  }))
                }
                required
              />
              <NeumorphicButton type="submit" variant="primary" disabled={saving}>
                <Calculator size={18} />
                {saving ? "Menghitung..." : "Hitung EOQ"}
              </NeumorphicButton>
            </form>
          </NeumorphicCard>
        ) : null}

        <NeumorphicCard>
          <h2 className="neo-card-title">Hasil EOQ Terakhir</h2>
          {lastResult ? (
            <div className="result-card">
              <span>{lastResult.product?.name}</span>
              <strong>{formatNumber(lastResult.eoq_result)}</strong>
              <p>unit per pemesanan optimal</p>
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
              placeholder="Cari riwayat EOQ..."
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
          <div className="empty-state">Belum ada riwayat EOQ.</div>
        ) : (
          <div className="table-wrap">
            <table className="stock-table master-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>Kebutuhan</th>
                  <th>Biaya Pemesanan</th>
                  <th>Biaya Penyimpanan</th>
                  <th>Hasil EOQ</th>
                  <th>Dihitung Oleh</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalculations.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.calculated_at).toLocaleString("id-ID")}</td>
                    <td>{item.product?.name || "-"}</td>
                    <td>{formatNumber(item.annual_demand)}</td>
                    <td>{formatNumber(item.ordering_cost)}</td>
                    <td>{formatNumber(item.holding_cost)}</td>
                    <td>{formatNumber(item.eoq_result)}</td>
                    <td>{item.calculator?.name || "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => navigate(`/eoq/${item.id}`)}>
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

export default Eoq
