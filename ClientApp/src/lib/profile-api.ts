// lib/profile-api.ts (or wherever you keep API calls)
import api from "@/lib/http";

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

    return res.data; // { avatarUrl }
};
