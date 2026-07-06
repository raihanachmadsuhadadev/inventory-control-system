import { Eye, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import NeumorphicCard from "../components/ui/NeumorphicCard"
import { useToast } from "../context/ToastContext"
import AppLayout from "../layouts/AppLayout"
import api from "../lib/api"

function stockStatus(item) {
  const minimumStock = item.product?.minimum_stock || 0

  return item.current_stock <= minimumStock ? "Kritis" : "Aman"
}

function Inventories() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [inventories, setInventories] = useState([])
  const [hubs, setHubs] = useState([])
  const [search, setSearch] = useState("")
  const [hubId, setHubId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")
        const [inventoryResponse, hubResponse] = await Promise.all([
          api.get("/inventories"),
          api.get("/hubs"),
        ])

        setInventories(inventoryResponse.data?.data || [])
        setHubs(hubResponse.data?.data || [])
      } catch (fetchError) {
        const message =
          fetchError.response?.data?.message || "Gagal memuat data inventaris."
        setError(message)
        showToast({ type: "error", message })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredInventories = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    return inventories.filter((item) => {
      const matchesHub = hubId ? String(item.hub_id) === hubId : true
      const searchable = [
        item.product?.code,
        item.product?.name,
        item.product?.category?.name,
        item.product?.supplier?.name,
        item.hub?.name,
      ]
        .join(" ")
        .toLowerCase()

      return matchesHub && (!keyword || searchable.includes(keyword))
    })
  }, [hubId, inventories, search])

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Stok Barang</p>
          <h1 className="page-title">Inventaris</h1>
          <p className="page-description">
            Pantau stok per produk dan hub sebagai dasar transaksi, EOQ, dan ROP.
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
              placeholder="Cari produk, kategori, supplier, atau hub..."
              type="search"
            />
          </div>
          <select
            className="neo-input toolbar-select"
            value={hubId}
            onChange={(event) => setHubId(event.target.value)}
          >
            <option value="">Semua Hub</option>
            {hubs.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : filteredInventories.length === 0 ? (
          <div className="empty-state">Belum ada data inventaris.</div>
        ) : (
          <div className="table-wrap">
            <table className="stock-table master-table">
              <thead>
                <tr>
                  <th>Kode Produk</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Supplier</th>
                  <th>Hub</th>
                  <th>Current Stock</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                  <th>Update Terakhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventories.map((item) => {
                  const status = stockStatus(item)

                  return (
                    <tr key={item.id}>
                      <td>{item.product?.code || "-"}</td>
                      <td>{item.product?.name || "-"}</td>
                      <td>{item.product?.category?.name || "-"}</td>
                      <td>{item.product?.supplier?.name || "-"}</td>
                      <td>{item.hub?.name || "-"}</td>
                      <td>{item.current_stock}</td>
                      <td>{item.available_stock}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            status === "Kritis" ? "status-critical" : "status-safe"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        {item.last_updated_at
                          ? new Date(item.last_updated_at).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => navigate(`/inventories/${item.id}`)}>
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </NeumorphicCard>
    </AppLayout>
  )
}

export default Inventories
