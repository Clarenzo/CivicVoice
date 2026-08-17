export declare enum Role {
    CITIZEN = "CITIZEN",
    HANDLER = "HANDLER",
    DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",
    AGENCY_ADMIN = "AGENCY_ADMIN",
    SYSTEM_ADMIN = "SYSTEM_ADMIN"
}
export declare enum ComplaintStatus {
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    IN_PROGRESS = "IN_PROGRESS",
    PENDING_INFO = "PENDING_INFO",
    ESCALATED = "ESCALATED",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
    REJECTED = "REJECTED"
}
export declare enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare const STATUS_LABELS: Record<ComplaintStatus, {
    en: string;
    sw: string;
}>;
export declare const PRIORITY_LABELS: Record<Priority, {
    en: string;
    sw: string;
}>;
export declare const DEFAULT_CATEGORIES: {
    name: string;
    nameSw: string;
}[];
export interface ApiResponse<T> {
    data: T;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const COMPLAINT_TITLE_MIN_LENGTH = 5;
export declare const COMPLAINT_TITLE_MAX_LENGTH = 150;
export declare const COMPLAINT_DESC_MIN_LENGTH = 20;
export declare const COMPLAINT_DESC_MAX_LENGTH = 5000;
export declare const PASSWORD_MIN_LENGTH = 8;
//# sourceMappingURL=index.d.ts.map