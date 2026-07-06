import { ArrowRight, Boxes, ChartNoAxesCombined, PackageCheck } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import NeumorphicButton from "../components/ui/NeumorphicButton"
import NeumorphicInput from "../components/ui/NeumorphicInput"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

const demoAccounts = [
  "superadmin@inventory.test",
  "password",
]

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState("superadmin@inventory.test")
  const [password, setPassword] = useState("password")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await login(email, password)
      showToast({ type: "success", message: "Login berhasil." })
      navigate("/dashboard", { replace: true })
    } catch (loginError) {
      const message =
        loginError.response?.data?.message ||
        "Login gagal. Periksa koneksi API dan kredensial."
      setError(message)
      showToast({ type: "error", message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Inventory login">
        <div className="login-brand-panel">
          <div className="login-brand-pattern" aria-hidden="true" />
          <div className="login-brand-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="login-brand-content">
            <div className="login-brand-mark">
              <Boxes size={30} />
            </div>
            <p className="login-brand-label">Inventory Platform</p>
            <h1>Inventory Control System</h1>
            <p>
              Sistem manajemen inventaris berbasis EOQ dan ROP untuk menjaga
              stok tetap terukur, rapi, dan siap dipantau.
            </p>
          </div>

          <div className="login-brand-metrics" aria-label="Platform highlights">
            <div>
              <PackageCheck size={20} />
              <span>Stock Control</span>
            </div>
            <div>
              <ChartNoAxesCombined size={20} />
              <span>EOQ & ROP</span>
            </div>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-card">
            <p className="eyebrow">Masuk ke Sistem</p>
            <h2 className="login-title">Login Account</h2>
            <p className="login-subtitle">
              Gunakan kredensial pengguna untuk mengakses dashboard inventaris.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <NeumorphicInput
                id="email"
                label="Email"
                placeholder="admin@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <NeumorphicInput
                id="password"
                label="Password"
                placeholder="Masukkan password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {error ? <p className="form-error">{error}</p> : null}
              <div className="login-actions">
                <NeumorphicButton
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                >
                  {submitting ? "Memproses..." : "Masuk"}
                  <ArrowRight size={18} />
                </NeumorphicButton>
              </div>
            </form>

            <p className="login-demo-note">
              Demo: <strong>{demoAccounts[0]}</strong> / {demoAccounts[1]}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
