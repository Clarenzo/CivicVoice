import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { FileText, Clock, CheckCircle, AlertCircle, Search, Eye, RefreshCw } from "lucide-react"
import { complaintsApi } from "../lib/api"
import { format } from "date-fns"

const STATUS_COLORS: Record<string, { bg: string, text: string }> = {
    SUBMITTED: { bg: "bg-blue-100", text: "text-blue-700" },
    UNDER_REVIEW: { bg: "bg-yellow-100", text: "text-yellow-700" },
    IN_PROGRESS: { bg: "bg-orange-100", text: "text-orange-700" },
    PENDING_INFO: { bg: "bg-purple-100", text: "text-purple-700" },
    ESCALATED: { bg: "bg-red-100", text: "text-red-700" },
    RESOLVED: { bg: "bg-green-100", text: "text-green-700" },
    CLOSED: { bg: "bg-gray-100", text: "text-gray-700" },
    REJECTED: { bg: "bg-red-100", text: "text-red-700" },
}

export default function AdminDashboardPage() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [page, setPage] = useState(1)

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: () => complaintsApi.getStats().then(res => res.data),
    })

    // Fetch all complaints with filters
    const { data: complaintsData, isLoading, refetch } = useQuery({
        queryKey: ["admin-complaints", searchTerm, statusFilter, page],
        queryFn: () => complaintsApi.getAll({
            search: searchTerm || undefined,
            status: statusFilter || undefined,
            page,
            limit: 20,
        }).then(res => res.data),
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        refetch()
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                <p className="text-gray-600">Manage all complaints from citizens</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("")}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Complaints</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>

                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("SUBMITTED")}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">New</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.submitted || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("IN_PROGRESS")}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">In Progress</p>
                            <p className="text-3xl font-bold text-orange-600">{stats?.inProgress || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("RESOLVED")}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Resolved</p>
                            <p className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card mb-6">
                <div className="flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by tracking number, title, email, or name..."
                                className="input-field pl-10"
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="input-field"
                        >
                            <option value="">All Status</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="PENDING_INFO">Pending Info</option>
                            <option value="ESCALATED">Escalated</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        <button onClick={() => refetch()} className="btn-secondary p-2" title="Refresh">
                            <RefreshCw className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">All Complaints</h3>
                    <span className="text-gray-500">
                        {complaintsData?.pagination?.total || 0} total
                    </span>
                </div>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                ): complaintsData?.complaints?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-200">
                                    <th className="pb-3 font-medium text-gray-500">Tracking #</th>
                                    <th className="pb-3 font-medium text-gray-500">Title</th>
                                    <th className="pb-3 font-medium text-gray-500">Submitter</th>
                                    <th className="pb-3 font-medium text-gray-500">Status</th>
                                    <th className="pb-3 font-medium text-gray-500">Priority</th>
                                    <th className="pb-3 font-medium text-gray-500">Date</th>
                                    <th className="pb-3 font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {complaintsData.complaints.map((complaint: any) => (
                                    <tr key={complaint.id} className="hover:bg-gray-50">
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
                                            <p className="text-gray-900">
                                                {complaint.isAnonymous ? "Anonymous" : complaint.submitterName || complaint.citizen?.name || "Unknown"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {complaint.submitterEmail || complaint.citizen?.email || ""}
                                            </p>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[complaint.status]?.bg} ${STATUS_COLORS[complaint.status]?.text}`}>
                                                {complaint.status.replace(/_/g, " ")}
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
                                        <td className="py-4 text-gray-600 text-sm">
                                            {format(new Date(complaint.createdAt), "PP")}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ):(
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h4>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter
                                ? "Try adjusting your search or filter criteria"
                                : "No complaints have been submitted yet"}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {complaintsData?.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <p className="text-sm text-gray-500">
                            Page {complaintsData.pagination.page} of {complaintsData.pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled = {page === 1}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled = {page >= complaintsData.pagination.totalPages}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}