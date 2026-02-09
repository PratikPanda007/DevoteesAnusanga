import api from './http';

/* =======================
   TYPES
======================= */

export interface VerifyOtpResponse {
    resetToken: string;
}

/* =======================
   API CALLS
======================= */

export const requestPasswordOtp = async (email: string) => {
    await api.post('/api/auth/forgot-password-request', { email });
};

export const verifyPasswordOtp = async (
    email: string,
    otp: string
): Promise<VerifyOtpResponse> => {
    const res = await api.post('/api/auth/forgot-password/verify', {
        email,
        otp,
    });

    return res.data;
};

export const resetPassword = async (
    resetToken: string,
    newPassword: string
) => {
    await api.post('/api/auth/forgot-password/reset', {
        resetToken,
        newPassword,
    });
};
