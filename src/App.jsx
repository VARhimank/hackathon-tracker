import { BrowserRouter, Routes, Route } from "react-router-dom"
import RegistrationPage from "./pages/RegistrationPage"
import QRDisplayPage from "./pages/QRDisplayPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import ScannerPage from "./pages/ScannerPage"
import DashboardPage from "./pages/DashboardPage"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/qr/:id" element={<QRDisplayPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/scanner"
          element={
            <ProtectedRoute>
              <ScannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
