import NeumorphicButton from "./NeumorphicButton"
import Modal from "./Modal"

function ConfirmDialog({
  open,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini?",
  description = "Data yang dihapus tidak dapat dikembalikan.",
  confirmLabel = "Ya, Hapus",
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm-content">
        <p>{message}</p>
        <span>{description}</span>
      </div>
      <div className="form-actions">
        <NeumorphicButton type="button" onClick={onCancel}>
          Batal
        </NeumorphicButton>
        <NeumorphicButton
          type="button"
          variant="primary"
          disabled={loading}
          onClick={onConfirm}
        >
          {loading ? "Menghapus..." : confirmLabel}
        </NeumorphicButton>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
