import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { MessageSquare, LayoutDashboard, FileText, LogOut, Settings, Users, BarChart3 } from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">CivicVoice</span>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>

        <nav className="mt-6 px-3">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Overview
          </p>
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/complaints"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>All Complaints</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </Link>

          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
            Settings
          </p>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user?.name}</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              View Public Portal
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
