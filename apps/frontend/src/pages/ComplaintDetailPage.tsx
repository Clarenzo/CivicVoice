import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import {
    ArrowLeft, Clock, User, MapPin, Calendar,
    MessageSquare, Send, ChevronDown, CheckCircle
} from "lucide-react"
import { complaintsApi } from "@/lib/api"
import { format } from "date-fns"

const STATUS_OPTIONS = [
    { value: "SUBMITTED", label: "Submitted", color: "bg-blue-100 text-blue-700" },
    { value: "UNDER_REVIEW", label: "Under Review", color: "bg-yellow-100 text-yellow-700" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-orange-100 text-orange-700" },
    { value: "PENDING_INFO", label: "Pending info", color: "bg-purple-100 text-pruple-700" },
    { value: "ESCALATED", label: "Escalated", color: "bg-red-100 text-red-700" },
    { value: "RESOLVED", label: "Resolved", color: "bg-green-100 text-green-700" },
    { value: "CLOSED", label: "Closed", color: "bg-gray-100 text-gray-700" },
    { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-700" },
]

const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
]

export default function ComplaintDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [newNote, setNewNote] = useState("")
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState("")
    const [resolution, setResolution] = useState("")

    const { data: complaint, isLoading, error } = useQuery({
        queryKey: ["complaint", id],
        queryFn: () => complaintsApi.getById(id!).then(res => res.data),
        enabled: !!id,
    })

    const updateStatusMutation = useMutation({
        mutationFn: (data: { status: string; note?: string; resolution?: string }) =>
            complaintsApi.updateStatus(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["complaint", id] })
            toast.success("Status updated successfully")
            setSelectedStatus("")
            setResolution("")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update status")
        },
    })

    const handleStatusUpdate = () => {
        if (!selectedStatus) {
            toast.error("Please select a status")
            return
        }
        updateStatusMutation.mutate({
            status: selectedStatus,
            note: newNote || undefined,
            resolution: resolution || undefined,
        })
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        )
    }

    if (error || !complaint) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Complaint Not Found</h2>
                <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist.</p>
                <button onClick={() => navigate(-1)} className="btn-secondary">
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
                        <p className="text-gray-500 font-mono">{complaint.trackingNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            STATUS_OPTIONS.find(s => s.value === complaint.status)?.color || "bg-gray-100"
                        }`}>
                            {complaint.status.replace("_", " ")}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            complaint.priority === "CRITICAL" ? "bg-red-100 text-red-700" :
                            complaint.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                            complaint.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                        }`}>
                            {complaint.priority}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    {/* Description */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                    </div>

                    {/* Status Update */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">UpdateStatus</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="input-field appearance-none pr-10"
                                    >
                                        <option value="">Select status...</option>
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {(selectedStatus === "RESOLVED" || selectedStatus === "CLOSED") && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Resolution Notes
                                    </label>
                                    <textarea
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        rows={3}
                                        className="input-field"
                                        placeholder="Describe how the issue was resolved..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Internal Note (Optional)
                                </label>
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    rows={2}
                                    className="input-field"
                                    placeholder="Add a note about this status change..."
                                />
                            </div>

                            <button
                                onClick={handleStatusUpdate}
                                disabled={!selectedStatus || updateStatusMutation.isPending}
                                className="btn-primary flex items-center gap-2"
                            >
                                {updateStatusMutation.isPending ? (
                                    <>Updating...</>
                                ): (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Update Status
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Status History */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">Status History</h2>
                        <div className="space-y-4">
                            {complaint.statusHistory?.map((item: any, index: number) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            STATUS_OPTIONS.find(s => s.value === item.status)?.color || "bg-gray-100"
                                        }`}>
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        {index < complaint.statusHistory.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900">
                                                {STATUS_OPTIONS.find(s => s.value === item.status)?.label || item.status}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {format(new Date(item.createdAt), "PPp")}
                                            </span>
                                        </div>
                                        {item.note && (
                                            <p className="text-gray-600 text-sm">{item.note}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            by {item.changedBy?.name || "System"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            </div>
                            <p className="text-sm text-gray-500">Submitted By</p>
                            <p className="font-medium text-gray-900">
                                {complaint.isAnonymous ? "Anonymous" : complaint.submitterName || complaint.citizen?.name || "Unknown"}
                            </p>
                        </div>
                    </div>

                    {complaint.submitterEmail && (
                        <div className="flex items-start gap-3">
                            <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Contact</p>
                                <p className="text-gray-900">{complaint.submitterEmail}</p>
                                {complaint.submitterPhone && (
                                    <p className="text-gray-600">{complaint.submitterPhone}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {complaint.location && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="text-gray-900">{complaint.location}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500">Submitted</p>
                            <p className="text-gray-900">{format(new Date(complaint.createdAt), "PPP")}</p>
                        </div>
                    </div>

                    {complaint.category && (
                        <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="font-medium text-gray-900">{complaint.category.name}</p>
                        </div>
                    )}

                    {complaint.department && (
                        <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p className="font-medium text-gray-900">{complaint.department.name}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Assignment</h3>
                {complaint.assignedTo ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                                {complaint.assignedTo.name?.[0]?.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{complaint.assignedTo.name}</p>
                            <p className="text-sm text-gray-500">Assigned Handler</p>
                        </div>
                    </div>
                ): (
                    <div className="text-center py-4">
                        <p className="text-gray-500 mb-2">Not assigned</p>
                        <button className="btn-secondary text-sm">
                            Assign to Self
                        </button>
                    </div>
                )}
            </div>

            {/* Attachments */}
            {complaint.attachments?.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                    <div className="space-y-2">
                        {complaint.attachments.map((att: any) => (
                            <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
                            >
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-primary-600 truncate">
                                    {att.originalName}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}