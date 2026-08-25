import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import {
    ArrowLeft, Clock, User, MapPin, Calendar,
    MessageSquare, CheckCircle, XCircle, FileText, Trash2, AlertTriangle
} from "lucide-react"
import { complaintsApi } from "../lib/api"
import { format } from "date-fns"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    SUBMITTED:    { label: "Submitted",    color: "text-blue-700",   bg: "bg-blue-100",   icon: Clock },
    UNDER_REVIEW: { label: "Under Review", color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
    IN_PROGRESS:  { label: "In Progress",  color: "text-orange-700", bg: "bg-orange-100", icon: Clock },
    PENDING_INFO: { label: "Pending Info", color: "text-purple-700", bg: "bg-purple-100", icon: AlertTriangle },
    ESCALATED:    { label: "Escalated",    color: "text-red-700",    bg: "bg-red-100",    icon: AlertTriangle },
    RESOLVED:     { label: "Resolved",     color: "text-green-700",  bg: "bg-green-100",  icon: CheckCircle },
    CLOSED:       { label: "Closed",       color: "text-gray-700",   bg: "bg-gray-100",   icon: CheckCircle },
    REJECTED:     { label: "Rejected",     color: "text-red-700",    bg: "bg-red-100",    icon: XCircle },
}

const PRIORITY_CONFIG: Record<string, { label: string; classes: string }> = {
    LOW:      { label: "Low",      classes: "text-gray-600 bg-gray-100" },
    MEDIUM:   { label: "Medium",   classes: "text-yellow-700 bg-yellow-100" },
    HIGH:     { label: "High",     classes: "text-orange-700 bg-orange-100" },
    CRITICAL: { label: "Critical", classes: "text-red-700 bg-red-100 font-semibold" },
}

export default function ComplaintDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const { data: complaint, isLoading, error } = useQuery({
        queryKey: ["complaint", id],
        queryFn: () => complaintsApi.getById(id!).then(res => res.data),
        enabled: !!id,
    })

    const deleteMutation = useMutation({
        mutationFn: () => complaintsApi.delete(id!),
        onSuccess: () => {
            toast.success("Complaint moved to trash")
            queryClient.invalidateQueries({ queryKey: ["my-complaints"] })
            navigate("/dashboard/complaints")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete complaint")
        },
    })

    const handleDelete = () => {
        deleteMutation.mutate()
        setShowDeleteConfirm(false)
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
            </div>
        )
    }

    if (error || !complaint) {
        return (
            <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Complaint Not Found</h2>
                <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist or you don't have access.</p>
                <Link to="/dashboard/complaints" className="btn-secondary">
                    Back to My Complaints
                </Link>
            </div>
        )
    }

    const statusCfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.SUBMITTED
    const priorityCfg = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.MEDIUM

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate("/dashboard/complaints")}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to My Complaints
                </button>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
                        <p className="text-gray-500 font-mono text-sm mt-1">{complaint.trackingNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityCfg.classes}`}>
                            {priorityCfg.label}
                        </span>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm transition-colors"
                            title="Delete complaint"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Complaint?</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    This will move your complaint to trash. It will be permanently deleted after 30 days.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn-secondary"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
                    </div>

                    {/* Resolution */}
                    {complaint.resolution && (
                        <div className="card border-l-4 border-green-500">
                            <h2 className="text-lg font-semibold mb-2 text-green-800">Resolution</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{complaint.resolution}</p>
                            {complaint.resolvedAt && (
                                <p className="text-sm text-gray-500 mt-3">
                                    Resolved on {format(new Date(complaint.resolvedAt), "PPP")}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Status History / Timeline */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">Status History</h2>
                        {complaint.statusChanges && complaint.statusChanges.length > 0 ? (
                            <div className="space-y-0">
                                {[...complaint.statusChanges].reverse().map((item: any, index: number, arr: any[]) => {
                                    const sCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.SUBMITTED;
                                    const Icon = sCfg.icon;
                                    return (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full ${sCfg.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`w-5 h-5 ${sCfg.color}`} />
                                                </div>
                                                {index < arr.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-5">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">{sCfg.label}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {format(new Date(item.createdAt), "PPp")}
                                                    </span>
                                                </div>
                                                {item.note && (
                                                    <p className="text-gray-600 text-sm">{item.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No status updates yet.</p>
                        )}
                    </div>

                    {/* Attachments */}
                    {complaint.attachments && complaint.attachments.length > 0 && (
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Attachments</h2>
                            <div className="space-y-2">
                                {complaint.attachments.map((att: any) => (
                                    <a
                                        key={att.id}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-primary-600 truncate">
                                            {att.originalName || att.fileName}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500">Submitted</p>
                                    <p className="font-medium text-gray-900">
                                        {format(new Date(complaint.createdAt), "PPP")}
                                    </p>
                                </div>
                            </div>

                            {complaint.location && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium text-gray-900">{complaint.location}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.category && (
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="font-medium text-gray-900">{complaint.category.name}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.department && (
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Department</p>
                                        <p className="font-medium text-gray-900">{complaint.department.name}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.assignedTo && (
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Assigned To</p>
                                        <p className="font-medium text-gray-900">{complaint.assignedTo.name}</p>
                                    </div>
                                </div>
                            )}

                            {complaint.isAnonymous && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-800">
                                        This complaint was submitted anonymously.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Public tracking link */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-3">Track Publicly</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Anyone with your tracking number can view the status without logging in.
                        </p>
                        <Link
                            to={`/track?tracking=${complaint.trackingNumber}`}
                            className="btn-secondary w-full text-center block"
                        >
                            View Public Tracking Page
                        </Link>
                    </div>

                    <Link
                        to="/submit"
                        className="btn-primary w-full text-center block"
                    >
                        Submit New Complaint
                    </Link>
                </div>
            </div>
        </div>
    )
}
