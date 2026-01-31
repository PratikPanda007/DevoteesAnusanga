import api from './http';
import { UserProfile } from '../types/user-profile';

export interface UserDetailsResponse {
    userDetails: User;
    userProfile: UserProfile | null;
}

export const fetchMyProfile = async (): Promise<UserDetailsResponse> => {
    const { data } = await api.get('/api/User/UserDetails');
    return data;
};

export const registerUser = async (data: {
    email: string;
    password: string;
    name: string;
}) => {
    const res = await api.post("/api/Auth/register", data);
    return res.data;
};
