import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Search, Clock, CheckCircle, AlertCircle, XCircle, ArrowLeft } from "lucide-react"
import { complaintsApi } from "../lib/api"
import { useAuthStore } from "../store/authStore"
import { format } from "date-fns"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  SUBMITTED: { label: "Submitted", color: "text-blue-700", bg: "bg-blue-100", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "text-yellow-700", bg: "bg-yellow-100", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", color: "text-orange-700", bg: "bg-orange-100", icon: Clock },
  PENDING_INFO: { label: "Pending Info", color: "text-purple-700", bg: "bg-purple-100", icon: AlertCircle },
  ESCALATED: { label: "Escalated", color: "text-red-700", bg: "bg-red-100", icon: AlertCircle },
  RESOLVED: { label: "Resolved", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "text-gray-700", bg: "bg-gray-100", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-100", icon: XCircle },
}

export default function TrackComplaintPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("tracking") || "")
  const [submittedTracking, setSubmittedTracking] = useState(searchParams.get("tracking") || "")

  // Determine where "Back" should go
  const isAdmin = !!user?.role && ["SYSTEM_ADMIN", "AGENCY_ADMIN", "DEPARTMENT_ADMIN", "HANDLER"].includes(user.role)
  const dashboardPath = isAdmin ? "/admin" : "/dashboard"

  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ["complaint", "track", submittedTracking],
    queryFn: () => complaintsApi.track(submittedTracking).then(res => res.data),
    enabled: submittedTracking.length >= 10,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number")
      return
    }
    setSubmittedTracking(trackingNumber.trim().toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 p-1 flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 truncate">Track Your Complaint</h1>
          </div>
          {isAuthenticated ? (
            <Link to={dashboardPath} className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
              ← Dashboard
            </Link>
          ) : (
            <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
              ← Home
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:py-8 py-8">
        {/* Search Form */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Enter Your Tracking Number</h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="e.g., CV-2026-000001"
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        {isLoading && submittedTracking && (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Searching for your complaint...</p>
          </div>
        )}

        {error && submittedTracking && !isLoading && (
          <div className="card text-center py-12">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complaint Not Found</h3>
            <p className="text-gray-600">
              We couldn"t find a complaint with that tracking number. Please verify and try again.
            </p>
          </div>
        )}

        {complaint && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="text-2xl font-bold text-gray-900 break-all">{complaint.trackingNumber}</p>
                </div>
                <div className={`px-4 py-2 rounded-full self-start ${STATUS_CONFIG[complaint.status]?.bg || "bg-gray-100"}`}>
                  <span className={`font-medium ${STATUS_CONFIG[complaint.status]?.color || "text-gray-600"}`}>
                    {STATUS_CONFIG[complaint.status]?.label || complaint.status(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Title</p>
                  <p className="font-medium text-gray-900">{complaint.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Submitted</p>
                  <p className="text-gray-900">{format(new Date(complaint.createdAt), "PPP")}</p>
                </div>
                {complaint.category && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="text-gray-900">{complaint.category.name}</p>
                  </div>
                )}
                {complaint.department && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="text-gray-900">{complaint.department.name}</p>
                  </div>
                )}
              </div>

              {complaint.resolution && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">Resolution</h4>
                  <p className="text-green-700">{complaint.resolution}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-6">Status History</h3>
              <div className="space-y-0">
                {complaint.statusChanges?.map((item: any, index: number, arr: any[]) => {
                  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.SUBMITTED
                  const StatusIcon = cfg.icon
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 z-10`}>
                          <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        {index < arr.length - 1 && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {cfg.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(item.createdAt), "PPp")}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-gray-600 text-sm">{item.note}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/submit")}
                className="btn-secondary flex-1"
              >
                Submit New Complaint
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="btn-primary flex-1"
                >
                  Return to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/")}
                  className="btn-primary flex-1"
                >
                  Return Home
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
