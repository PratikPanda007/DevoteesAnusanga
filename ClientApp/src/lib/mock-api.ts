// Mock API service - replace these methods with real fetch() calls to your .NET backend

import {
  mockProfiles,
  mockAnnouncements,
  mockCountries,
  mockRoles,
  MockProfile,
  MockAnnouncement,
  MockCountry,
  MockRole,
  ROLE_IDS,
} from './mock-data';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory data stores (will reset on page refresh)
let profiles = [...mockProfiles];
let announcements = [...mockAnnouncements];

export const api = {
  // ============ PROFILES ============
  
  getProfiles: async (filters?: { country?: string; isPublic?: boolean }): Promise<{ data: MockProfile[]; error: null }> => {
    await delay(300);
    
    let result = [...profiles];
    
    if (filters?.country && filters.country !== 'all') {
      result = result.filter(p => p.country === filters.country);
    }
    
    if (filters?.isPublic !== undefined) {
      result = result.filter(p => p.is_public === filters.isPublic);
    }
    
    // Sort by city
    result.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
    
    return { data: result, error: null };
  },

  getProfileByUserId: async (userId: string): Promise<{ data: MockProfile | null; error: null }> => {
    await delay(200);
    const profile = profiles.find(p => p.user_id === userId);
    return { data: profile || null, error: null };
  },

  createProfile: async (profileData: Partial<MockProfile>): Promise<{ data: MockProfile; error: null }> => {
    await delay(300);
    
    const newProfile: MockProfile = {
      id: `profile-${Date.now()}`,
      user_id: profileData.user_id || '',
      name: profileData.name || null,
      email: profileData.email || null,
      phone: profileData.phone || null,
      country: profileData.country || '',
      city: profileData.city || null,
      mission_description: profileData.mission_description || null,
      avatar_url: profileData.avatar_url || null,
      social_links: profileData.social_links || null,
      is_public: profileData.is_public ?? true,
      role_id: profileData.role_id || ROLE_IDS.DEVOTEE,
      agreed_to_terms_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    profiles.push(newProfile);
    return { data: newProfile, error: null };
  },

  updateProfile: async (userId: string, profileData: Partial<MockProfile>): Promise<{ data: MockProfile | null; error: null }> => {
    await delay(300);
    
    const index = profiles.findIndex(p => p.user_id === userId);
    if (index !== -1) {
      profiles[index] = {
        ...profiles[index],
        ...profileData,
        updated_at: new Date().toISOString(),
      };
      return { data: profiles[index], error: null };
    }
    
    return { data: null, error: null };
  },

  deleteProfile: async (profileId: string): Promise<{ error: null }> => {
    await delay(300);
    profiles = profiles.filter(p => p.id !== profileId);
    return { error: null };
  },

  deleteProfileByUserId: async (userId: string): Promise<{ error: null }> => {
    await delay(300);
    profiles = profiles.filter(p => p.user_id !== userId);
    return { error: null };
  },

  // ============ ANNOUNCEMENTS ============

  getAnnouncements: async (status?: 'pending' | 'approved' | 'rejected'): Promise<{ data: MockAnnouncement[]; error: null }> => {
    await delay(300);
    
    let result = [...announcements];
    
    if (status) {
      result = result.filter(a => a.status === status);
    }
    
    // Sort by created_at descending
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return { data: result, error: null };
  },

  getAllAnnouncements: async (): Promise<{ data: MockAnnouncement[]; error: null }> => {
    await delay(300);
    const result = [...announcements].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { data: result, error: null };
  },

  createAnnouncement: async (announcementData: Partial<MockAnnouncement>): Promise<{ data: MockAnnouncement; error: null }> => {
    await delay(300);
    
    const newAnnouncement: MockAnnouncement = {
      id: `ann-${Date.now()}`,
      user_id: announcementData.user_id || '',
      title: announcementData.title || '',
      content: announcementData.content || '',
      category: announcementData.category || 'other',
      status: announcementData.status || 'pending',
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    announcements.push(newAnnouncement);
    return { data: newAnnouncement, error: null };
  },

  updateAnnouncementStatus: async (id: string, status: 'approved' | 'rejected'): Promise<{ error: null }> => {
    await delay(300);
    
    const index = announcements.findIndex(a => a.id === id);
    if (index !== -1) {
      announcements[index] = {
        ...announcements[index],
        status,
        updated_at: new Date().toISOString(),
      };
    }
    
    return { error: null };
  },

  deleteAnnouncement: async (id: string): Promise<{ error: null }> => {
    await delay(300);
    announcements = announcements.filter(a => a.id !== id);
    return { error: null };
  },

  // ============ COUNTRIES ============

  getCountries: async (): Promise<{ data: MockCountry[]; error: null }> => {
    await delay(200);
    const sorted = [...mockCountries].sort((a, b) => a.name.localeCompare(b.name));
    return { data: sorted, error: null };
  },

  // ============ ROLES ============

  getRoles: async (): Promise<{ data: MockRole[]; error: null }> => {
    await delay(200);
    return { data: [...mockRoles], error: null };
  },

  updateUserRole: async (profileId: string, roleId: number): Promise<{ data: MockProfile | null; error: null }> => {
    await delay(300);
    
    const index = profiles.findIndex(p => p.id === profileId);
    if (index !== -1) {
      profiles[index] = {
        ...profiles[index],
        role_id: roleId,
        updated_at: new Date().toISOString(),
      };
      return { data: profiles[index], error: null };
    }
    
    return { data: null, error: null };
  },

  // ============ FILE UPLOAD ============

    uploadAvatar: async (userId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/profile/${userId}/avatar`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        return res.json(); // { url: string }
    },

  // ============ HELPERS ============

  getProfilesForUserIds: async (userIds: string[]): Promise<{ data: MockProfile[]; error: null }> => {
    await delay(200);
    const result = profiles.filter(p => userIds.includes(p.user_id));
    return { data: result, error: null };
  },

  // Get all data for export
  getAllData: async () => {
    await delay(300);
    return {
      countries: mockCountries,
      roles: mockRoles,
      profiles: profiles,
      announcements: announcements,
    };
  },
};
