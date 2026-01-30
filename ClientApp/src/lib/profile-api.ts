// src/lib/profile-api.ts
import api from "@/lib/http";

/* ==========================
   Upload Profile Avatar
========================== */
export const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
        "/api/User/upload-avatar",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data as { avatarUrl: string };
};

/* ==========================
   Update Profile Details
========================== */
/* ======================
   PROFILE
====================== */
export const getMyProfile = async () => {
    const res = await api.get("/api/User/profile");
    return res.data;
};

export const createProfile = async (profileData: any) => {
    const res = await api.post("/api/User/profile", profileData);
    return res.data;
};

export const updateProfile = async (profileData: any) => {
    const res = await api.put("/api/User/profile", profileData);
    return res.data;
};

export const deleteMyProfile = async () => {
    const res = await api.delete("/api/User/profile");
    return res.data;
};