import { ClipboardList } from "lucide-react"
import { NavLink } from "react-router-dom"
import { sidebarMenus } from "../../config/sidebarMenus"
import { useAuth } from "../../context/AuthContext"

function Sidebar() {
  const { loading, user } = useAuth()
  const roleSlug = user?.role?.slug
  const visibleMenus = roleSlug
    ? sidebarMenus.filter((item) => item.roles.includes(roleSlug))
    : []

  return (
    <aside className="sidebar" aria-label="Menu utama">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <ClipboardList size={24} strokeWidth={2.3} />
        </div>
        <div>
          <p className="brand-title">Inventory</p>
          <p className="brand-subtitle">EOQ & ROP</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {loading && !roleSlug ? (
          <span className="sidebar-loading">Memuat menu...</span>
        ) : null}

        {!loading && visibleMenus.length === 0 ? (
          <span className="sidebar-loading">Menu tidak tersedia</span>
        ) : null}

        {visibleMenus.map((item) => {
          const Icon = item.icon

          return (
            <NavLink key={item.label} className="sidebar-link" to={item.path}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
