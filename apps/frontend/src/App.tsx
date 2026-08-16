import { Routes, Route } from "react-router-dom"
import { useAuthStore } from "./store/authStore"

// Public Pages
import HomePage from "./pages/HomePage"
import SubmitComplaintPage from "./pages/SubmitComplaintPage"
import TrackComplaintPage from "./pages/TrackComplaintPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

// Protected Pages
//import DashboardLayout from "./components/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import MyComplaintsPage from "./pages/MyComplaintsPage"

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/submit" element={<SubmitComplaintPage />} />
      <Route path="/track" element={<TrackComplaintPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <HomePage />}>
        <Route index element={<DashboardPage />} />
        <Route path="complaints" element={<MyComplaintsPage />} />
      </Route>
    </Routes>
  )
}

export default App
