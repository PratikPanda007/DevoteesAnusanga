// src/lib/user-api.ts
import api from './http';

export const fetchUserDetails = async (email: string) => {
    const { data } = await api.get('/api/User/UserDetails', {
        params: { UserEmail: email },
    });

    return data;
};
