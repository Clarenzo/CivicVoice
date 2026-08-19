import { useAuthStore } from "../store/authStore"
import { Outlet, Link, useNavigate } from "react-router-dom"
import { MessageSquare, LayoutDashboard, FileText, User, LogOut } from "lucide-react"

export default function DashboardLayout () {
    const { user, logout } = useAuthStore() 
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/")
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
                        <p className="text-xs text-gray-400">Citizen Portal</p>
                    </div>
                </div>

                <nav className="mt-6 px-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/dashboard/complaints"
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                        <FileText className="w-5 h-5" />
                        <span>My Complaints</span>
                    </Link>
                    <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{user?.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">{user?.name}</p>
                            <p className="text-gray-400 text-xs">Citizen</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4"/>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 in-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
                    <h1 className="text-lg font-semibold text-gray-900">My Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Link to="/submit" className="btn-primary text-sm">
                            New Complaint
                        </Link>
                        <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
                            View Portal
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
