import { Upload } from "lucide-react"
import { useState } from "react"
import { useToast } from "../../context/ToastContext"
import api from "../../lib/api"
import NeumorphicButton from "./NeumorphicButton"
import Modal from "./Modal"

function ImportModal({ title, templateUrl, importUrl, onClose, onSuccess }) {
  const { showToast } = useToast()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      setFile(null)
      return
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase()

    if (!["csv", "xlsx"].includes(extension)) {
      showToast({ type: "warning", message: "Format file harus .csv atau .xlsx." })
      event.target.value = ""
      setFile(null)
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast({ type: "warning", message: "Ukuran file maksimal 5MB." })
      event.target.value = ""
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      showToast({ type: "warning", message: "File wajib dipilih." })
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("file", file)
      const response = await api.post(importUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const summary = response.data?.data
      setResult(summary)
      showToast({
        type: response.data?.success ? "success" : "warning",
        message: response.data?.message || "Import selesai.",
      })
      onSuccess?.()
    } catch (error) {
      const summary = error.response?.data?.data
      setResult(summary || null)
      showToast({
        type: "error",
        message: error.response?.data?.message || "Gagal import data.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get(templateUrl, { responseType: "blob" })
      const disposition = response.headers["content-disposition"]
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/)
      const filename = filenameMatch?.[1] || "template-import.csv"
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast({ type: "success", message: "Template berhasil diunduh." })
    } catch {
      showToast({ type: "error", message: "Gagal mengunduh template." })
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="import-panel">
        <p className="neo-card-muted">
          Upload file Excel sesuai format template yang disediakan.
        </p>
        {templateUrl ? (
          <p className="import-template-help">
            Gunakan template resmi agar format data sesuai.{" "}
            <button type="button" onClick={handleDownloadTemplate}>
              Download Template Excel
            </button>
          </p>
        ) : null}
        <label className="file-drop">
          <Upload size={20} />
          <span>{file ? file.name : "Pilih file .csv atau .xlsx"}</span>
          <input accept=".csv,.xlsx" type="file" onChange={handleFileChange} />
        </label>

        {result ? (
          <div className="import-result">
            <span>Created: {result.created || 0}</span>
            <span>Updated: {result.updated || 0}</span>
            <span>Skipped: {result.skipped || 0}</span>
            {result.errors?.length ? (
              <div className="import-errors">
                {result.errors.map((error) => (
                  <p key={`${error.row}-${error.message}`}>
                    Row {error.row}: {error.message}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="form-actions">
          <NeumorphicButton type="button" onClick={onClose}>
            Tutup
          </NeumorphicButton>
          <NeumorphicButton
            type="button"
            variant="primary"
            disabled={loading}
            onClick={handleUpload}
          >
            {loading ? "Mengupload..." : "Upload"}
          </NeumorphicButton>
        </div>
      </div>
    </Modal>
  )
}

export default ImportModal
