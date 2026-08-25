import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { FileText, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { complaintsApi } from "../lib/api"
import { format } from "date-fns"

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: () => complaintsApi.getMy().then(res => res.data),
  })

  const stats = {
    total: data?.pagination?.total || 0,
    submitted: data?.complaints?.filter((c: any) => c.status === "SUBMITTED").length || 0,
    inProgress: data?.complaints?.filter((c: any) => c.status === "IN_PROGRESS").length || 0,
    resolved: data?.complaints?.filter((c: any) => ["RESOLVED", "CLOSED"].includes(c.status)).length || 0,
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
        <p className="text-gray-600">Here"s an overview of your complaints</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
          <Link to="/dashboard/complaints" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : data?.complaints?.length > 0 ? (
          <div className="space-y-4">
            {data.complaints.slice(0, 5).map((complaint: any) => (
              <Link
                key={complaint.id}
                to={`/dashboard/complaints/${complaint.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{complaint.title}</p>
                  <p className="text-sm text-gray-500">
                    {complaint.trackingNumber} • {format(new Date(complaint.createdAt), "PPP")}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  complaint.status === "RESOLVED" || complaint.status === "CLOSED" ? "bg-green-100 text-green-700" :
                  complaint.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700" :
                  complaint.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
                  complaint.status === "UNDER_REVIEW" || complaint.status === "PENDING_INFO" ? "bg-yellow-100 text-yellow-700" :
                  complaint.status === "ESCALATED" || complaint.status === "REJECTED" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {complaint.status.replace(/_/g, " ")}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h4>
            <p className="text-gray-600 mb-4">Start by submitting your first complaint</p>
            <Link to="/submit" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Submit Complaint
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
