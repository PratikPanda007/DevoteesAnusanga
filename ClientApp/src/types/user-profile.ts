export interface UserProfile {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    missionDescription: string;
    avatarUrl: string | null;
    socialLinks: string; // JSON string (parse later)
    isPublic: boolean;
    roleId: number;
    agreedToTermsAt: string | null;
    createdAt: string;
    updatedAt: string;
}
