import api from "./http";

/* ===============================
   TYPES (Match your backend DTOs)
================================= */

export interface CreateAnnouncement {
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
}

export interface ReviewAnnouncement {
    announcementId: string;
    status: number; // 0 = pending, 1 = approved, 2 = rejected
    remarks?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    imageUrl: string;
    createdBy: string;
    createdOn: string;
    approvalStatus: number;
    approvedBy?: string;
    approvedOn?: string;
}

/* ===============================
   API CALLS
================================= */

// Create Announcement
//export const createAnnouncement = async (
//    data: CreateAnnouncement
//) => {
//    const response = await api.post("/api/announcements", data);
//    return response.data;
//};

export const createAnnouncement = async (
    data: CreateAnnouncement
) => {
    const formData = new FormData();

    formData.append("Title", data.title);
    formData.append("Content", data.content);
    formData.append("Category", data.category);

    if (data.imageUrl) {
        formData.append("ImageUrl", data.imageUrl);
    }

    const response = await api.post(
        "/api/announcements",
        formData,
    );

    return response.data;
};

export const uploadAnnouncementImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
        "/api/announcements/upload-image",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data.imageUrl;
};

// Get Approved Announcements (Public View)
export const getApprovedAnnouncements = async () => {
    const response = await api.get<Announcement[]>(
        "/api/announcements/"
    );
    return response.data;
};

// Get Pending Announcements (Admin Only)
export const getPendingAnnouncements = async () => {
    const response = await api.get<Announcement[]>(
        "/api/announcements/pending"
    );
    return response.data;
};

// Review Announcement (Admin Approve/Reject)
export const reviewAnnouncement = async (
    data: ReviewAnnouncement
) => {
    const response = await api.put(
        "/api/announcements/review",
        data
    );
    return response.data;
};

// Get Announcement By Id
export const getAnnouncementById = async (id: string) => {
    const response = await api.get<Announcement>(
        `/api/announcements/${id}`
    );
    return response.data;
};
