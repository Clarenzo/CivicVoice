import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { FileText, Eye, Trash2, Search } from "lucide-react"
import toast from "react-hot-toast"
import { complaintsApi } from "../lib/api"
import { format } from "date-fns"

export default function MyComplaintsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: () => complaintsApi.getAll().then(res => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => complaintsApi.delete(id),
    onSuccess: () => {
      toast.success("Complaint moved to trash")
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete complaint")
    },
  })

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this complaint? It will be moved to trash for 30 days.")) {
      deleteMutation.mutate(id)
    }
  }

  // Filter complaints based on search
  const filteredComplaints = data?.complaints?.filter((c: any) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      c.trackingNumber?.toLowerCase().includes(search) ||
      c.title?.toLowerCase().includes(search)
    )
  }) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
          <p className="text-gray-600">View and track all your submitted complaints</p>
        </div>
        <Link to="/submit" className="btn-primary">
          New Complaint
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tracking number or title..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="font-medium">{filteredComplaints.length} complaints</span>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Tracking #</th>
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Priority</th>
                  <th className="pb-3 font-medium text-gray-500">Priority</th>
                  <th className="pb-3 font-medium text-gray-500">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComplaints.map((complaint: any) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/dashboard/complaints/${complaint.id}`)}
                  >
                    <td className="py-4">
                      <span className="font-mono text-primary-600">
                        {complaint.trackingNumber}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {complaint.title}
                      </p>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        complaint.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                        complaint.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700" :
                        complaint.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
                        complaint.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-700" :
                        complaint.status === "CLOSED" ? "bg-gray-100 text-gray-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`text-sm ${
                        complaint.priority === "CRITICAL" ? "text-red-600 font-medium" :
                        complaint.priority === "HIGH" ? "text-orange-600" :
                        complaint.priority === "MEDIUM" ? "text-yellow-600" :
                        "text-gray-600"
                      }`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">
                      {format(new Date(complaint.createdAt), "PPP")}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/dashboard/complaints/${complaint.id}`)
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(complaint.id, e)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No complaints found" : "No complaints found"}
            </h4>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search term"
                : "You haven't submitted any complaints yet"}
            </p>
            {!searchTerm && (
              <Link to="/submit" className="btn-primary">
                Submit Your First Complaint
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
