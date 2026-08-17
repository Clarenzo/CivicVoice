// CivicVoice Shared Types and Constants
// User Roles
export var Role;
(function (Role) {
    Role["CITIZEN"] = "CITIZEN";
    Role["HANDLER"] = "HANDLER";
    Role["DEPARTMENT_ADMIN"] = "DEPARTMENT_ADMIN";
    Role["AGENCY_ADMIN"] = "AGENCY_ADMIN";
    Role["SYSTEM_ADMIN"] = "SYSTEM_ADMIN";
})(Role || (Role = {}));
// Complaint Status
export var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["SUBMITTED"] = "SUBMITTED";
    ComplaintStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ComplaintStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ComplaintStatus["PENDING_INFO"] = "PENDING_INFO";
    ComplaintStatus["ESCALATED"] = "ESCALATED";
    ComplaintStatus["RESOLVED"] = "RESOLVED";
    ComplaintStatus["CLOSED"] = "CLOSED";
    ComplaintStatus["REJECTED"] = "REJECTED";
})(ComplaintStatus || (ComplaintStatus = {}));
// Priority
export var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
    Priority["CRITICAL"] = "CRITICAL";
})(Priority || (Priority = {}));
// Status Labels for UI
export const STATUS_LABELS = {
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
export const PRIORITY_LABELS = {
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
// Form Validation Schemas (can be shared between frontend and backend)
export const COMPLAINT_TITLE_MIN_LENGTH = 5;
export const COMPLAINT_TITLE_MAX_LENGTH = 150;
export const COMPLAINT_DESC_MIN_LENGTH = 20;
export const COMPLAINT_DESC_MAX_LENGTH = 5000;
export const PASSWORD_MIN_LENGTH = 8;
//# sourceMappingURL=index.js.map