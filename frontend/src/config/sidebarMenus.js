import {
  BarChart3,
  Boxes,
  Building2,
  CalendarClock,
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

const allRoles = ["super_admin", "admin_gudang", "manager_gudang"]

export const sidebarMenus = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: allRoles,
  },
  {
    label: "User",
    path: "/users",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    label: "Hub",
    path: "/hubs",
    icon: Building2,
    roles: ["super_admin"],
  },
  {
    label: "Kategori",
    path: "/categories",
    icon: Tags,
    roles: ["super_admin"],
  },
  {
    label: "Shift",
    path: "/shifts",
    icon: CalendarClock,
    roles: ["super_admin"],
  },
  {
    label: "Supplier",
    path: "/suppliers",
    icon: Factory,
    roles: allRoles,
  },
  {
    label: "Produk",
    path: "/products",
    icon: Package,
    roles: allRoles,
  },
  {
    label: "Inventaris",
    path: "/inventories",
    icon: Boxes,
    roles: allRoles,
  },
  {
    label: "Transaksi Stok",
    path: "/stock-transactions",
    icon: Repeat,
    roles: allRoles,
  },
  {
    label: "EOQ",
    path: "/eoq",
    icon: BarChart3,
    roles: allRoles,
  },
  {
    label: "ROP",
    path: "/rop",
    icon: Gauge,
    roles: allRoles,
  },
  {
    label: "Rekomendasi",
    path: "/purchase-recommendations",
    icon: Lightbulb,
    roles: allRoles,
  },
  {
    label: "Laporan Persediaan",
    path: "/reports/inventory",
    icon: FileText,
    roles: allRoles,
  },
  {
    label: "Laporan EOQ & ROP",
    path: "/reports/eoq-rop",
    icon: FileText,
    roles: allRoles,
  },
]

export const superAdminOnlyRoutes = [
  "/users",
  "/hubs",
  "/categories",
  "/shifts",
]
