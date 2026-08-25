import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { MessageSquare, FileText, LogOut, Settings, Users, BarChart3, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { authApi } from '../lib/api'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, refreshToken, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Ignore network errors on logout
    }
    logout()
    navigate('/')
  }

  const navItems = [
    { to: "/admin", icon: FileText, label: "All Complaints", end: true },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin.settings", icon: Settings, label: "Settings" },
  ]

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path)

  const sidebarWidth = sidebarOpen ? "w-64" : "w-20"
  const contentMargin = sidebarOpen ? "ml-64" : "ml-20"

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 ${sidebarWidth} bg-gray-900 transition-all duration-300 z-50
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className='flex items-center justify-between gap-2 px-4 py-5 border-b border-gray-800 h-16'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0'>
              <MessageSquare className='w-6 h-6 text-white' />
            </div>
            {sidebarOpen && (
              <div className='min-w-0'>
                <span className='text-lg font-bold text-white block truncate'>CivicVoice</span>
                <span className='text-xs text-gray-400 block'>Admin Portal</span>
              </div>
            )}
          </div>
          <button
            className='lg:hidden text-gray-400 hover:text-white p-1'
            onClick={() => setMobileOpen(false)}
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <div className='hidden lg:flex justify-end px-3 py-2'>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft className='w-4 h-4' /> : <ChevronRight className='w-4 h-4' />}
          </button>
        </div>

        {/* Nav */}
        <nav className='mt-2 px-3 space-y-1'>
          <p className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${!sidebarOpen && "lg:hidden"}`}>
            Management
          </p>
          {navItems.slice(0, 2).map(({ to, icon: Icon, label, end }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(to, end)
                    ? "bg-primary-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              title = {!sidebarOpen ? label : undefined}
            >
              <Icon className='w-5 h-5 flex-shrink-0' />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}

          <p className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 ${!sidebarOpen && "lg:hidden"}`}>
            Settings
          </p>
          {navItems.slice(2).map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(to)
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              title = {!sidebarOpen ? label : undefined}
            >
              <Icon className='w-5 h-5 flex-shrink-0' />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen && "lg:justify-center"}`}>
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                {sidebarOpen && (
                    <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{user?.name}</p>
                        <p className="text-gray-400 text-xs capitalize">{user?.role?.replace(/_/g, ' ').toLowerCase()}</p>
                    </div>
                )}
              </div>
              <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full
                      ${!sidebarOpen && "lg:justify-center lg:px-2"}`}
                  title={!sidebarOpen ? "Sign Out" : undefined}
              >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span>Sign Out</span>}
              </button>
          </div>
      </aside>

      {/* Main Content */}
      <div className={`${contentMargin} min-h-screen transition-all duration-300`}>
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                  <button
                      className="lg:hidden text-gray-600 hover:text-gray-900 p-1"
                      onClick={() => setMobileOpen(true)}
                  >
                      <Menu className="w-6 h-6" />
                  </button>
                  <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">Admin Portal</h1>
               </div>
               <div className="flex items-center gap-3">
                   <Link to="/" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900">
                        View Public Portal
                   </Link>
                   {/* User greeting */}
                   <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 border-l border-gray-200 pl-3">
                       <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                           <span className="text-white text-xs font-medium">{user?.name?.[0]?.toUpperCase()}</span>
                       </div>
                       <span className="font-medium">{user?.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                    >
                      Logout
                    </button>
               </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
