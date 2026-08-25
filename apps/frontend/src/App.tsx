import { Routes, Route } from "react-router-dom"
import { useAuthStore } from "./store/authStore"

// Public Pages
import HomePage from "./pages/HomePage"
import SubmitComplaintPage from "./pages/SubmitComplaintPage"
import TrackComplaintPage from "./pages/TrackComplaintPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

// Citizen Pages
import DashboardLayout from "./components/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import MyComplaintsPage from "./pages/MyComplaintsPage"
import ComplaintDetailPage from "./pages/ComplaintDetailPage"

// Admin Pages
import AdminLayout from "./components/AdminLayout"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import AdminComplaintDetailPage from "./pages/AdminComplaintDetailPage"

// Helper component to redirect unauthenticated users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <HomePage />
  }

  return <>{children}</>
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // Determine if user is admin
  const isAdmin = !!user?.role && ["SYSTEM_ADMIN", "AGENCY_ADMIN", "DEPARTMENT_ADMIN", "HANDLER"].includes(user.role)

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/submit" element={<SubmitComplaintPage />} />
      <Route path="/track" element={<TrackComplaintPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Citizen Dashboard Routes */}
      < Route path="/dashboard" element={
        <ProtectedRoute>
          {isAdmin ? <AdminLayout /> : <DashboardLayout />}
        </ProtectedRoute>
      }>
        <Route index element={isAdmin ? <AdminDashboardPage /> : <DashboardPage />} />
        <Route path="complaints" element={isAdmin ? <AdminDashboardPage /> : <MyComplaintsPage />} />
        <Route path="complaints/:id" element={isAdmin ? <AdminComplaintDetailPage /> : <ComplaintDetailPage />} />
      </Route>

      {/* Admin Dashboard Routes (clean /admin prefix) */}
      <Route path="/admin" element={
        isAuthenticated && isAdmin ? <AdminLayout /> : <HomePage />
      }>
        <Route index element={<AdminDashboardPage />} />
        <Route path="complaints/:id" element={<AdminComplaintDetailPage />} />
        <Route path="analytics" element={<ComingSoon title="Analytics" />} />
        <Route path="users" element={<ComingSoon title="User Management" />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
      </Route>

      {/* Catch all → Home */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

// Placeholder for pages not yet implemented
function ComingSoon({ title } : { title: string }) {
  return (
    <div className="text-center py-16">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">This feature is coming soon.</p>
    </div>
  )
}

export default App
