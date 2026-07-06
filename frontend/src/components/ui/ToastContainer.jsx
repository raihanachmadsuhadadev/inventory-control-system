import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react"
import { useToast } from "../../context/ToastContext"

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || Info

        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={18} />
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => removeToast(toast.id)}
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastContainer
