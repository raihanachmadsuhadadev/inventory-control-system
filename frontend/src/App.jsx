import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import RoleRoute from "./components/auth/RoleRoute"
import { useAuth } from "./context/AuthContext"
import Categories from "./pages/Categories"
import Dashboard from "./pages/Dashboard"
import DetailPage from "./pages/DetailPage"
import Eoq from "./pages/Eoq"
import Hubs from "./pages/Hubs"
import Inventories from "./pages/Inventories"
import Login from "./pages/Login"
import Products from "./pages/Products"
import PurchaseRecommendations from "./pages/PurchaseRecommendations"
import EoqRopReport from "./pages/reports/EoqRopReport"
import InventoryReport from "./pages/reports/InventoryReport"
import Rop from "./pages/Rop"
import Shifts from "./pages/Shifts"
import StockTransactions from "./pages/StockTransactions"
import Suppliers from "./pages/Suppliers"
import UsersPlaceholder from "./pages/UsersPlaceholder"

function App() {
  const { isAuthenticated, loading } = useAuth()

  const homeRoute = loading ? (
    <main className="auth-loading">
      <div className="neo-card compact">Memeriksa sesi...</div>
    </main>
  ) : (
    <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
  )
  const superAdminOnly = (children) => (
    <ProtectedRoute>
      <RoleRoute roles={["super_admin"]}>{children}</RoleRoute>
    </ProtectedRoute>
  )

  return (
    <Routes>
      <Route path="/" element={homeRoute} />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={superAdminOnly(<Categories />)}
      />
      <Route path="/categories/:id" element={superAdminOnly(<DetailPage type="category" />)} />
      <Route
        path="/hubs"
        element={superAdminOnly(<Hubs />)}
      />
      <Route path="/hubs/:id" element={superAdminOnly(<DetailPage type="hub" />)} />
      <Route
        path="/shifts"
        element={superAdminOnly(<Shifts />)}
      />
      <Route path="/shifts/:id" element={superAdminOnly(<DetailPage type="shift" />)} />
      <Route path="/users" element={superAdminOnly(<UsersPlaceholder />)} />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <Suppliers />
          </ProtectedRoute>
        }
      />
      <Route path="/suppliers/:id" element={<ProtectedRoute><DetailPage type="supplier" /></ProtectedRoute>} />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route path="/products/:id" element={<ProtectedRoute><DetailPage type="product" /></ProtectedRoute>} />
      <Route
        path="/inventories"
        element={
          <ProtectedRoute>
            <Inventories />
          </ProtectedRoute>
        }
      />
      <Route path="/inventories/:id" element={<ProtectedRoute><DetailPage type="inventory" /></ProtectedRoute>} />
      <Route
        path="/stock-transactions"
        element={
          <ProtectedRoute>
            <StockTransactions />
          </ProtectedRoute>
        }
      />
      <Route path="/stock-transactions/:id" element={<ProtectedRoute><DetailPage type="stockTransaction" /></ProtectedRoute>} />
      <Route
        path="/eoq"
        element={
          <ProtectedRoute>
            <Eoq />
          </ProtectedRoute>
        }
      />
      <Route path="/eoq/:id" element={<ProtectedRoute><DetailPage type="eoq" /></ProtectedRoute>} />
      <Route
        path="/rop"
        element={
          <ProtectedRoute>
            <Rop />
          </ProtectedRoute>
        }
      />
      <Route path="/rop/:id" element={<ProtectedRoute><DetailPage type="rop" /></ProtectedRoute>} />
      <Route
        path="/purchase-recommendations"
        element={
          <ProtectedRoute>
            <PurchaseRecommendations />
          </ProtectedRoute>
        }
      />
      <Route path="/purchase-recommendations/:id" element={<ProtectedRoute><DetailPage type="recommendation" /></ProtectedRoute>} />
      <Route
        path="/reports/inventory"
        element={
          <ProtectedRoute>
            <InventoryReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/eoq-rop"
        element={
          <ProtectedRoute>
            <EoqRopReport />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
