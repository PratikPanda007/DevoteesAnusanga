import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserDetailDialog } from '@/components/admin/UserDetailDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';
import {
    Search,
    Loader2,
    MapPin,
    Eye,
    Trash2,
    Mail,
    Shield,
} from 'lucide-react';
import api from '../../lib/http';

interface UserListDto {
    id: string;
    email: string;
    name: string;
    userRoleID: number;
    roleName: string;
    city: string;
    country: string;
    hasProfile: number;
    isProfilePublic: number | null;
    isActive: boolean;
    created_At: string;
}

export interface UserProfileDto {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    country: string;
    city: string;
    missionDescription: string | null;
    avatarUrl: string | null;
    socialLinks: string | null; // JSON string
    isPublic: boolean;
    roleId: number;
    agreedToTermsAt: string | null;
    createdAt: string;
    updatedAt: string;
}


const roles = [
    { id: 1, name: "Super Admin" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Devotee" },
];

const SearchUsers = () => {
    const [members, setMembers] = useState<UserListDto[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<UserListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

    const [selectedProfile, setSelectedProfile] = useState<UserProfileDto | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMembers(members);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredMembers(
                members.filter(
                    (m) =>
                        m.name?.toLowerCase().includes(query) ||
                        m.email?.toLowerCase().includes(query) ||
                        m.city?.toLowerCase().includes(query) ||
                        m.country?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, members]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/User/list");
            setMembers(response.data);
            setFilteredMembers(response.data);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: string, newRoleId: string) => {
        setUpdatingRoleId(memberId);
        try {
            await api.put(`/api/User/update-role`, {
                userId: memberId,
                roleId: parseInt(newRoleId),
            });

            setMembers(prev =>
                prev.map(m =>
                    m.id === memberId
                        ? { ...m, userRoleID: parseInt(newRoleId) }
                        : m
                )
            );

            const roleName = roles.find(r => r.id === parseInt(newRoleId))?.name;
            toast.success(`Role updated to ${roleName}`);
        } catch {
            toast.error("Failed to update role");
        }
        setUpdatingRoleId(null);
    };

    const handleViewUser = async (userId: string) => {
        try {
            setLoadingProfile(true);

            const response = await api.get(
                `/api/User/Profile`,
                {
                    params: { userId }
                }
            );

            setSelectedProfile(response.data);
            setDialogOpen(true);

        } catch (error) {
            toast.error("Failed to load profile");
            console.error(error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm('Are you sure you want to delete this member profile?')) return;

        setProcessingId(id);
        try {
            await api.delete(`/api/User/${id}`);
            toast.success('Member deleted successfully.');
            fetchMembers();
        } catch {
            toast.error("Failed to delete user");
        }
        setProcessingId(null);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 md:p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Search className="h-8 w-8 text-primary" />
                        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                            Search Users
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Find and manage user profiles
                    </p>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, city, or country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="space-y-3">
                    {filteredMembers.length === 0 ? (
                        <Card className="elevated-card">
                            <CardContent className="py-12 text-center">
                                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredMembers.map((member) => (
                            <Card key={member.id} className="elevated-card hover:shadow-md transition-shadow">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-4">

                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {member.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground truncate">{member.name}</h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {member.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {member.city ? `${member.city}, ` : ''}{member.country}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">

                                            {member.hasProfile === 1 ? (
                                                <Badge variant={member.isProfilePublic === 1 ? 'default' : 'secondary'}>
                                                    {member.isProfilePublic === 1 ? "Public" : "Hidden"}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">No Profile</Badge>
                                            )}

                                            <div className="flex items-center gap-1">
                                                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                                <Select
                                                    value={member.userRoleID.toString()}
                                                    onValueChange={(value) => handleRoleChange(member.id, value)}
                                                    disabled={member.userRoleID === 1}
                                                >
                                                    <SelectTrigger className="h-7 w-24 text-xs">
                                                        {updatingRoleId === member.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <SelectValue />
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                                {role.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {member.hasProfile === 1 ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewUser(member.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    No Profile Found
                                                </span>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteMember(member.id)}
                                                disabled={processingId === member.id}
                                            >
                                                {processingId === member.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>

                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                    Showing {filteredMembers.length} of {members.length} users
                </p>
            </div>

            <UserDetailDialog
                user={selectedProfile}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </AdminLayout>
    );
};

export default SearchUsers;
