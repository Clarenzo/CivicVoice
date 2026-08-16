import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Search, Clock, CheckCircle, AlertCircle, XCircle, ArrowRight } from "lucide-react"
import { complaintsApi } from "../lib/api"
import { format } from "date-fns"

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  SUBMITTED: { color: "text-blue-600", bg: "bg-blue-100", icon: Clock },
  UNDER_REVIEW: { color: "text-yellow-600", bg: "bg-yellow-100", icon: AlertCircle },
  IN_PROGRESS: { color: "text-orange-600", bg: "bg-orange-100", icon: Clock },
  PENDING_INFO: { color: "text-purple-600", bg: "bg-purple-100", icon: AlertCircle },
  ESCALATED: { color: "text-red-600", bg: "bg-red-100", icon: AlertCircle },
  RESOLVED: { color: "text-green-600", bg: "bg-green-100", icon: CheckCircle },
  CLOSED: { color: "text-gray-600", bg: "bg-gray-100", icon: CheckCircle },
  REJECTED: { color: "text-red-600", bg: "bg-red-100", icon: XCircle },
}

export default function TrackComplaintPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("tracking") || "")

  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ["complaint", trackingNumber],
    queryFn: () => complaintsApi.track(trackingNumber).then(res => res.data),
    enabled: trackingNumber.length >= 10,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Track Your Complaint</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Enter Your Tracking Number</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
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
        {isLoading && (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Searching for your complaint...</p>
          </div>
        )}

        {error && (
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
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="text-2xl font-bold text-gray-900">{complaint.trackingNumber}</p>
                </div>
                <div className={`px-4 py-2 rounded-full ${statusConfig[complaint.status]?.bg || "bg-gray-100"}`}>
                  <span className={`font-medium ${statusConfig[complaint.status]?.color || "text-gray-600"}`}>
                    {complaint.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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
              <div className="space-y-6">
                {complaint.statusHistory?.map((item: any, index: number) => {
                  const StatusIcon = statusConfig[item.status]?.icon || Clock
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${statusConfig[item.status]?.bg || "bg-gray-100"} flex items-center justify-center`}>
                          <StatusIcon className={`w-5 h-5 ${statusConfig[item.status]?.color || "text-gray-600"}`} />
                        </div>
                        {index < (complaint.statusHistory?.length || 0) - 1 && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {item.status.replace("_", " ")}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(item.createdAt), "PPp")}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-gray-600">{item.note}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/submit")}
                className="btn-secondary flex-1"
              >
                Submit New Complaint
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn-primary flex-1"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
