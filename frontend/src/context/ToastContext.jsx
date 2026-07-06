import { createContext, useCallback, useContext, useMemo, useState } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type = "info", message }) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, type, message }])
      window.setTimeout(() => removeToast(id), 3600)
    },
    [removeToast],
  )

  const value = useMemo(
    () => ({ toasts, showToast, removeToast }),
    [removeToast, showToast, toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast harus dipakai di dalam ToastProvider")
  }

  return context
}
