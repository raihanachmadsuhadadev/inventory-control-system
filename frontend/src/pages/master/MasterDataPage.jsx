import { Edit2, Plus, Search, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import AppLayout from "../../layouts/AppLayout"
import api from "../../lib/api"
import { useAuth } from "../../context/AuthContext"
import NeumorphicButton from "../../components/ui/NeumorphicButton"
import NeumorphicCard from "../../components/ui/NeumorphicCard"
import NeumorphicInput from "../../components/ui/NeumorphicInput"

const emptyForm = (fields) =>
  fields.reduce(
    (form, field) => ({
      ...form,
      [field.name]: field.type === "checkbox" ? true : "",
    }),
    {},
  )

function MasterDataPage({ title, subtitle, endpoint, fields, columns }) {
  const { user } = useAuth()
  const canManage = user?.role?.slug === "super_admin"
  const [items, setItems] = useState([])
  const [form, setForm] = useState(() => emptyForm(fields))
  const [editingItem, setEditingItem] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formVisible, setFormVisible] = useState(false)

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    if (!keyword) {
      return items
    }

    return items.filter((item) =>
      columns.some((column) =>
        String(item[column.key] || "")
          .toLowerCase()
          .includes(keyword),
      ),
    )
  }, [columns, items, search])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get(endpoint)
      setItems(response.data?.data || [])
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          `Gagal memuat data ${title.toLowerCase()}.`,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  const resetForm = () => {
    setForm(emptyForm(fields))
    setEditingItem(null)
    setFormVisible(false)
  }

  const openCreateForm = () => {
    setForm(emptyForm(fields))
    setEditingItem(null)
    setFormVisible(true)
  }

  const openEditForm = (item) => {
    setEditingItem(item)
    setForm(
      fields.reduce(
        (nextForm, field) => {
          const value = item[field.name]

          return {
            ...nextForm,
            [field.name]:
              field.type === "checkbox"
                ? Boolean(value)
                : field.type === "time" && value
                  ? String(value).slice(0, 5)
                  : value || "",
          }
        },
        {},
      ),
    )
    setFormVisible(true)
  }

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field.name]: field.type === "checkbox" ? value : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!canManage) {
      return
    }

    try {
      setSaving(true)
      setError("")

      const payload = fields.reduce(
        (nextPayload, field) => ({
          ...nextPayload,
          [field.name]: field.type === "checkbox" ? Boolean(form[field.name]) : form[field.name],
        }),
        {},
      )

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, payload)
      } else {
        await api.post(endpoint, payload)
      }

      resetForm()
      await fetchItems()
    } catch (saveError) {
      const validationErrors = saveError.response?.data?.errors
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null

      setError(
        firstValidationError ||
          saveError.response?.data?.message ||
          `Gagal menyimpan data ${title.toLowerCase()}.`,
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!canManage) {
      return
    }

    const confirmed = window.confirm(`Hapus ${item.name}?`)

    if (!confirmed) {
      return
    }

    try {
      setError("")
      await api.delete(`${endpoint}/${item.id}`)
      await fetchItems()
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          `Gagal menghapus data ${title.toLowerCase()}.`,
      )
    }
  }

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Master Data</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{subtitle}</p>
        </div>
        {canManage ? (
          <NeumorphicButton variant="primary" onClick={openCreateForm}>
            <Plus size={18} />
            Tambah
          </NeumorphicButton>
        ) : null}
      </section>

      <section className="master-grid">
        <NeumorphicCard>
          <div className="master-toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Cari ${title.toLowerCase()}...`}
                type="search"
              />
            </div>
            {!canManage ? (
              <span className="readonly-note">Mode lihat saja</span>
            ) : null}
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          {loading ? (
            <div className="empty-state">Memuat data...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">Belum ada data yang cocok.</div>
          ) : (
            <div className="table-wrap">
              <table className="stock-table master-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Status</th>
                    {canManage ? <th>Aksi</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      {columns.map((column) => (
                        <td key={column.key}>{item[column.key] || "-"}</td>
                      ))}
                      <td>
                        <span
                          className={`status-badge ${
                            item.is_active ? "status-safe" : "status-critical"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      {canManage ? (
                        <td>
                          <div className="table-actions">
                            <button
                              aria-label={`Edit ${item.name}`}
                              onClick={() => openEditForm(item)}
                              type="button"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              aria-label={`Hapus ${item.name}`}
                              onClick={() => handleDelete(item)}
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeumorphicCard>

        {formVisible ? (
          <NeumorphicCard className="master-form-card">
            <div className="form-heading">
              <div>
                <h2 className="neo-card-title">
                  {editingItem ? "Edit Data" : "Tambah Data"}
                </h2>
                <p className="neo-card-muted">{title}</p>
              </div>
              <button aria-label="Tutup form" onClick={resetForm} type="button">
                <X size={18} />
              </button>
            </div>

            <form className="master-form" onSubmit={handleSubmit}>
              {fields.map((field) =>
                field.type === "checkbox" ? (
                  <label key={field.name} className="toggle-field">
                    <input
                      checked={Boolean(form[field.name])}
                      onChange={(event) =>
                        handleChange(field, event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>{field.label}</span>
                  </label>
                ) : field.type === "textarea" ? (
                  <div key={field.name} className="field">
                    <label htmlFor={field.name}>{field.label}</label>
                    <textarea
                      id={field.name}
                      className="neo-input textarea-input"
                      value={form[field.name]}
                      onChange={(event) =>
                        handleChange(field, event.target.value)
                      }
                      placeholder={field.placeholder}
                    />
                  </div>
                ) : (
                  <NeumorphicInput
                    key={field.name}
                    id={field.name}
                    label={field.label}
                    type={field.type || "text"}
                    value={form[field.name]}
                    onChange={(event) =>
                      handleChange(field, event.target.value)
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ),
              )}

              <div className="form-actions">
                <NeumorphicButton type="button" onClick={resetForm}>
                  Batal
                </NeumorphicButton>
                <NeumorphicButton
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </NeumorphicButton>
              </div>
            </form>
          </NeumorphicCard>
        ) : null}
      </section>
    </AppLayout>
  )
}

export default MasterDataPage
