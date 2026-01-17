import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserDetailDialog } from '@/components/admin/UserDetailDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/mock-api';
import { MockProfile, MockRole } from '@/lib/mock-data';
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

const SearchUsers = () => {
  const [members, setMembers] = useState<MockProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MockProfile[]>([]);
  const [roles, setRoles] = useState<MockRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<MockProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

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
    const [profilesRes, rolesRes] = await Promise.all([
      api.getProfiles(),
      api.getRoles(),
    ]);
    setMembers(profilesRes.data);
    setFilteredMembers(profilesRes.data);
    setRoles(rolesRes.data);
    setLoading(false);
  };

  const handleRoleChange = async (memberId: string, newRoleId: string) => {
    setUpdatingRoleId(memberId);
    const { data } = await api.updateUserRole(memberId, parseInt(newRoleId));
    if (data) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role_id: parseInt(newRoleId) } : m));
      const roleName = roles.find(r => r.id === parseInt(newRoleId))?.name || 'Unknown';
      toast.success(`Role updated to ${roleName}`);
    } else {
      toast.error('Failed to update role');
    }
    setUpdatingRoleId(null);
  };

  const getRoleBadgeVariant = (roleId: number) => {
    switch (roleId) {
      case 3: return 'destructive';
      case 2: return 'default';
      default: return 'secondary';
    }
  };

  const handleViewUser = (user: MockProfile) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member profile?')) return;

    setProcessingId(id);
    await api.deleteProfile(id);
    toast.success('Member deleted successfully.');
    fetchMembers();
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

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, city, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results */}
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
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{member.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {member.city ? `${member.city}, ` : ''}{member.country}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={member.is_public ? 'default' : 'secondary'}>
                        {member.is_public ? 'Public' : 'Hidden'}
                      </Badge>
                      
                      {/* Role Selector */}
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        <Select
                          value={member.role_id.toString()}
                          onValueChange={(value) => handleRoleChange(member.id, value)}
                          disabled={updatingRoleId === member.id}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUser(member)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
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
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </AdminLayout>
  );
};

export default SearchUsers;
