import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function RoleRoute({ roles, children }) {
  const { loading, user } = useAuth()
  const roleSlug = user?.role?.slug

  if (loading) {
    return (
      <main className="auth-loading">
        <div className="neo-card compact">Memeriksa akses...</div>
      </main>
    )
  }

  if (!roleSlug || !roles.includes(roleSlug)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleRoute
