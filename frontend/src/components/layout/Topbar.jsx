import { Bell, ChevronDown, LogOut, Search } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"

function Topbar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { showToast } = useToast()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const roleName = user?.role?.name || "Tanpa role"
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  const handleLogout = async () => {
    try {
      await logout()
      showToast({ type: "success", message: "Logout berhasil." })
      navigate("/login", { replace: true })
    } catch {
      showToast({ type: "error", message: "Logout gagal." })
    }
  }

  return (
    <header className="topbar">
      <div>
        <p className="topbar-title">Inventory Control System</p>
        <p className="topbar-date">Monitoring stok, EOQ, dan ROP</p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-icon" aria-label="Pencarian">
          <Search size={19} />
        </div>
        <div className="topbar-icon" aria-label="Notifikasi">
          <Bell size={19} />
        </div>
        <div className="user-menu">
          <button
            className="topbar-user"
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            <div className="user-avatar" aria-label={user?.name || "User"}>
              {initials}
            </div>
            <div>
              <p>{user?.name || "User"}</p>
              <span>{roleName}</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {dropdownOpen ? (
            <div className="user-dropdown">
              <p>{user?.name || "User"}</p>
              <span>{user?.email || "-"}</span>
              <strong>{roleName}</strong>
              <button type="button" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Topbar
