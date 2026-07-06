import { ArrowRight, BarChart3, ShieldCheck, Warehouse } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import NeumorphicButton from "../components/ui/NeumorphicButton"
import NeumorphicCard from "../components/ui/NeumorphicCard"
import NeumorphicInput from "../components/ui/NeumorphicInput"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

const demoAccounts = [
  "superadmin@inventory.test / password",
  "admingudang@inventory.test / password",
  "managergudang@inventory.test / password",
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
      <div className="login-grid">
        <NeumorphicCard className="login-panel">
          <div>
            <p className="eyebrow">Inventory Platform</p>
            <h1 className="page-title">Inventory Control System</h1>
            <p className="page-description">
              EOQ & ROP Based Inventory Management
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
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <p className="eyebrow">Ringkasan Sistem</p>
          <h2 className="neo-card-title">Kontrol inventaris lebih terukur</h2>
          <p className="neo-card-muted">
            Fondasi UI ini disiapkan untuk pemantauan stok, rekomendasi
            pemesanan, dan analisis persediaan berbasis EOQ serta ROP.
          </p>

          <div className="demo-card">
            <h3>Akun Demo</h3>
            {demoAccounts.map((account) => (
              <p key={account}>{account}</p>
            ))}
          </div>

          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">
                <Warehouse size={20} />
              </div>
              <div>
                <h3 className="neo-card-title">Monitoring Stok</h3>
                <p className="neo-card-muted">
                  Pantau produk aman, perlu pesan, dan kritis dari satu
                  dashboard.
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="neo-card-title">EOQ & ROP</h3>
                <p className="neo-card-muted">
                  Siap dikembangkan untuk perhitungan kuantitas optimal dan
                  titik pemesanan ulang.
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="neo-card-title">Operasional Rapi</h3>
                <p className="neo-card-muted">
                  Struktur komponen konsisten untuk halaman inventaris
                  berikutnya.
                </p>
              </div>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </main>
  )
}

export default Login
