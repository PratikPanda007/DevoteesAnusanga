import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/mock-api';
import { MockProfile, MockAnnouncement } from '@/lib/mock-data';
import {
  Shield,
  Users,
  Megaphone,
  Check,
  Loader2,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';

const Dashboard = () => {
  const [members, setMembers] = useState<MockProfile[]>([]);
  const [announcements, setAnnouncements] = useState<MockAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: membersData } = await api.getProfiles();
    const { data: announcementsData } = await api.getAllAnnouncements();
    setMembers(membersData);
    setAnnouncements(announcementsData);
    setLoading(false);
  };

  const pendingAnnouncements = announcements.filter((a) => a.status === 'pending');
  const approvedAnnouncements = announcements.filter((a) => a.status === 'approved');
  const publicMembers = members.filter((m) => m.is_public);
  const hiddenMembers = members.filter((m) => !m.is_public);

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
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Overview of your community statistics
          </p>
        </div>

        {/* Member Stats */}
        <h2 className="text-lg font-medium mb-4">Members</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{members.length}</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{publicMembers.length}</p>
                  <p className="text-sm text-muted-foreground">Public Profiles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <UserX className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{hiddenMembers.length}</p>
                  <p className="text-sm text-muted-foreground">Hidden Profiles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcement Stats */}
        <h2 className="text-lg font-medium mb-4">Announcements</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{announcements.length}</p>
                  <p className="text-sm text-muted-foreground">Total Announcements</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold/20">
                  <Clock className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{pendingAnnouncements.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sage-light">
                  <Check className="h-5 w-5 text-sage-dark" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{approvedAnnouncements.length}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
