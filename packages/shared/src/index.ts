// CivicVoice Shared Types and Constants

// User Roles
export enum Role {
  CITIZEN = "CITIZEN",
  HANDLER = "HANDLER",
  DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",
  AGENCY_ADMIN = "AGENCY_ADMIN",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
}

// Complaint Status
export enum ComplaintStatus {
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING_INFO = "PENDING_INFO",
  ESCALATED = "ESCALATED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

// Priority
export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// Status Labels for UI
export const STATUS_LABELS: Record<ComplaintStatus, { en: string; sw: string }> = {
  [ComplaintStatus.SUBMITTED]: { en: "Submitted", sw: "Imetumwa" },
  [ComplaintStatus.UNDER_REVIEW]: { en: "Under Review", sw: "Inachunguzwa" },
  [ComplaintStatus.IN_PROGRESS]: { en: "In Progress", sw: "Inaendelea" },
  [ComplaintStatus.PENDING_INFO]: { en: "Pending Information", sw: "Inasubiri Maelezo" },
  [ComplaintStatus.ESCALATED]: { en: "Escalated", sw: "Imepevyushwa" },
  [ComplaintStatus.RESOLVED]: { en: "Resolved", sw: "Imemalizika" },
  [ComplaintStatus.CLOSED]: { en: "Closed", sw: "Imefungwa" },
  [ComplaintStatus.REJECTED]: { en: "Rejected", sw: "Imekataliwa" },
};

// Priority Labels
export const PRIORITY_LABELS: Record<Priority, { en: string; sw: string }> = {
  [Priority.LOW]: { en: "Low", sw: "Ya Chini" },
  [Priority.MEDIUM]: { en: "Medium", sw: "Wastani" },
  [Priority.HIGH]: { en: "High", sw: "Juu" },
  [Priority.CRITICAL]: { en: "Critical", sw: "Mbali ya Mwisho" },
};

// Default Categories (can be customized per deployment)
export const DEFAULT_CATEGORIES = [
  { name: "Infrastructure", nameSw: "Miundombinu" },
  { name: "Health Services", nameSw: "Huduma za Afya" },
  { name: "Education", nameSw: "Elimu" },
  { name: "Public Safety", nameSw: "Usalama wa Umma" },
  { name: "Water & Sanitation", nameSw: "Maji na Usafi" },
  { name: "Transportation", nameSw: "Usafiri" },
  { name: "Revenue & Taxation", nameSw: "Mapato na Kodi" },
  { name: "Other", nameSw: "Nyingine" },
];

// API Response Types
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

// Form Validation Schemas (can be shared between frontend and backend)
export const COMPLAINT_TITLE_MIN_LENGTH = 5;
export const COMPLAINT_TITLE_MAX_LENGTH = 150;
export const COMPLAINT_DESC_MIN_LENGTH = 20;
export const COMPLAINT_DESC_MAX_LENGTH = 5000;
export const PASSWORD_MIN_LENGTH = 8;
