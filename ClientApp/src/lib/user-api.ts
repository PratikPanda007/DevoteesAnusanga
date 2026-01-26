import api from './http';
import { UserProfile } from '../types/user-profile';

export interface UserDetailsResponse {
    userDetails: {
        id: string;
        email: string;
        name: string;
        userRoleID: number;
        roleName: string;
        isActive: boolean;
    };
    userProfile: UserProfile | null;
}

export const fetchMyProfile = async (): Promise<UserDetailsResponse> => {
    const { data } = await api.get('/api/User/UserDetails');
    return data;
};
