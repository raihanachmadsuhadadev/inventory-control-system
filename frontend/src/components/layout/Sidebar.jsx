import {
  BarChart3,
  Boxes,
  Building2,
  CalendarClock,
  ClipboardList,
  Factory,
  FileText,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Package,
  Repeat,
  Tags,
  Users,
} from "lucide-react"
import { NavLink } from "react-router-dom"

const menuItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "User", to: "#", icon: Users },
  { label: "Hub", to: "/hubs", icon: Building2 },
  { label: "Kategori", to: "/categories", icon: Tags },
  { label: "Shift", to: "/shifts", icon: CalendarClock },
  { label: "Supplier", to: "/suppliers", icon: Factory },
  { label: "Produk", to: "/products", icon: Package },
  { label: "Inventaris", to: "/inventories", icon: Boxes },
  { label: "Transaksi Stok", to: "/stock-transactions", icon: Repeat },
  { label: "EOQ", to: "/eoq", icon: BarChart3 },
  { label: "ROP", to: "/rop", icon: Gauge },
  { label: "Rekomendasi", to: "#", icon: Lightbulb },
  { label: "Laporan", to: "#", icon: FileText },
]

function Sidebar() {
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
        {menuItems.map((item) => {
          const Icon = item.icon
          const isPlaceholder = item.to === "#"

          if (isPlaceholder) {
            return (
              <a key={item.label} className="sidebar-link" href={item.to}>
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            )
          }

          return (
            <NavLink key={item.label} className="sidebar-link" to={item.to}>
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
