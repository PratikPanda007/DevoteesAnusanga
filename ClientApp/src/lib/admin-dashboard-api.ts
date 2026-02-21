import api from "./http";

/* ===============================
   TYPES (Match your backend DTOs)
================================= */

export interface AdminDashboard {
    totalUsers: number;
    publicProfiles: number;
    privateProfiles: number;
    totalAnnouncements?: number;
    pendingAnnouncements?: number;
    approvedAnnouncements?: number;
    rejectedAnnouncements?: number;
}

/* ===============================
   API CALLS
================================= */

export const fetchDashboardData = async () => {
    const response = await api.get<AdminDashboard>(
        "/api/User/get-dashboard-data",
    );

    return response.data;
};
