import { Edit2, Eye, Plus, Search, Trash2, Upload } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../../layouts/AppLayout"
import api from "../../lib/api"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import ImportModal from "../../components/ui/ImportModal"
import Modal from "../../components/ui/Modal"
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

const fullWidthFieldNames = ["description", "address", "notes"]

const fieldClassName = (field) =>
  fullWidthFieldNames.includes(field.name) || field.fullWidth
    ? "field modal-form-field-full"
    : "field"

function MasterDataPage({
  title,
  subtitle,
  endpoint,
  fields,
  columns,
  manageRoles = ["super_admin"],
  detailBasePath,
  templateUrl,
  importUrl,
})
{
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = manageRoles.includes(user?.role?.slug)
  const [items, setItems] = useState([])
  const [form, setForm] = useState(() => emptyForm(fields))
  const [editingItem, setEditingItem] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [formVisible, setFormVisible] = useState(false)
  const [importVisible, setImportVisible] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const canImport = canManage && templateUrl && importUrl

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    if (!keyword) {
      return items
    }

    return items.filter((item) =>
      columns.some((column) => {
        const value = column.render ? column.render(item) : item[column.key]

        return String(value || "")
          .toLowerCase()
          .includes(keyword)
      }),
    )
  }, [columns, items, search])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.get(endpoint)
      setItems(response.data?.data || [])
    } catch (fetchError) {
      const message =
        fetchError.response?.data?.message ||
        `Gagal memuat data ${title.toLowerCase()}.`
      setError(message)
      showToast({ type: "error", message })
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

  const validateForm = () => {
    for (const field of fields) {
      const value = form[field.name]

      if (field.required && (value === "" || value === null || value === undefined)) {
        return `${field.label} wajib diisi.`
      }

      if (field.type === "number" && value !== "" && Number(value) < 0) {
        return `${field.label} tidak boleh negatif.`
      }

      if (
        field.type === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        return "Format email tidak valid."
      }
    }

    return ""
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!canManage) {
      return
    }

    const validationMessage = validateForm()

    if (validationMessage) {
      setError(validationMessage)
      showToast({ type: "warning", message: validationMessage })
      return
    }

    try {
      setSaving(true)
      setError("")

      const payload = fields.reduce(
        (nextPayload, field) => ({
          ...nextPayload,
          [field.name]:
            field.type === "checkbox"
              ? Boolean(form[field.name])
              : form[field.name] === ""
                ? null
                : form[field.name],
        }),
        {},
      )

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, payload)
        showToast({ type: "success", message: "Data berhasil diperbarui." })
      } else {
        await api.post(endpoint, payload)
        showToast({ type: "success", message: "Data berhasil ditambahkan." })
      }

      resetForm()
      await fetchItems()
    } catch (saveError) {
      const validationErrors = saveError.response?.data?.errors
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null

      const message =
        firstValidationError ||
        saveError.response?.data?.message ||
        `Gagal menyimpan data ${title.toLowerCase()}.`
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!canManage) {
      return
    }

    if (!deleteTarget) {
      return
    }

    try {
      setDeleting(true)
      setError("")
      await api.delete(`${endpoint}/${deleteTarget.id}`)
      showToast({ type: "success", message: "Data berhasil dihapus." })
      setDeleteTarget(null)
      await fetchItems()
    } catch (deleteError) {
      const message =
        deleteError.response?.data?.message ||
        `Gagal menghapus data ${title.toLowerCase()}.`
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setDeleting(false)
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
          <div className="page-actions">
            {canImport ? (
              <NeumorphicButton onClick={() => setImportVisible(true)}>
                <Upload size={18} />
                Import Excel
              </NeumorphicButton>
            ) : null}
            <NeumorphicButton variant="primary" onClick={openCreateForm}>
              <Plus size={18} />
              Tambah
            </NeumorphicButton>
          </div>
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
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.render
                            ? column.render(item) || "-"
                            : item[column.key] || "-"}
                        </td>
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
                      <td>
                        <div className="table-actions">
                          {detailBasePath ? (
                            <button
                              aria-label={`Detail ${item.name}`}
                              onClick={() => navigate(`${detailBasePath}/${item.id}`)}
                              type="button"
                            >
                              <Eye size={16} />
                            </button>
                          ) : null}
                          {canManage ? (
                            <>
                            <button
                              aria-label={`Edit ${item.name}`}
                              onClick={() => openEditForm(item)}
                              type="button"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              aria-label={`Hapus ${item.name}`}
                              onClick={() => setDeleteTarget(item)}
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeumorphicCard>

        {formVisible ? (
          <Modal title={editingItem ? "Edit Data" : "Tambah Data"} onClose={resetForm}>
            <form className="master-form modal-form-grid" onSubmit={handleSubmit}>
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
                ) : field.type === "select" ? (
                  <div key={field.name} className={fieldClassName(field)}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <select
                      id={field.name}
                      className="neo-input"
                      value={form[field.name]}
                      onChange={(event) =>
                        handleChange(field, event.target.value)
                      }
                      required={field.required}
                    >
                      <option value="">{field.placeholder || "Pilih data"}</option>
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : field.type === "textarea" ? (
                  <div key={field.name} className={fieldClassName(field)}>
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

              <div className="form-actions modal-form-field-full">
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
          </Modal>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      {importVisible ? (
        <ImportModal
          title={`Import ${title}`}
          templateUrl={templateUrl}
          importUrl={importUrl}
          onClose={() => setImportVisible(false)}
          onSuccess={fetchItems}
        />
      ) : null}
    </AppLayout>
  )
}

export default MasterDataPage
