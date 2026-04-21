import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = sessionStorage.getItem('admin_auth') === 'true'
  return isAuthenticated ? children : <Navigate to="/admin" replace />
}
