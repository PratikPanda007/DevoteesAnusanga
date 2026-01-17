import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/mock-api';
import { MockAnnouncement, MockProfile } from '@/lib/mock-data';
import { toast } from 'sonner';
import {
  Megaphone,
  Check,
  X,
  Loader2,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementWithProfile extends MockAnnouncement {
  profiles?: {
    name: string | null;
  };
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: announcementsData } = await api.getAllAnnouncements();
    const userIds = announcementsData.map((a) => a.user_id);
    const { data: profilesData } = await api.getProfilesForUserIds(userIds);

    const profilesMap = new Map(profilesData.map((p) => [p.user_id, { name: p.name }]));

    const announcementsWithProfiles = announcementsData.map((a) => ({
      ...a,
      profiles: profilesMap.get(a.user_id),
    }));

    setAnnouncements(announcementsWithProfiles);
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    await api.updateAnnouncementStatus(id, status);
    toast.success(`Announcement ${status === 'approved' ? 'approved' : 'rejected'}.`);
    fetchData();
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    setProcessingId(id);
    await api.deleteAnnouncement(id);
    toast.success('Announcement deleted.');
    fetchData();
    setProcessingId(null);
  };

  const pendingAnnouncements = announcements.filter((a) => a.status === 'pending');
  const approvedAnnouncements = announcements.filter((a) => a.status === 'approved');
  const rejectedAnnouncements = announcements.filter((a) => a.status === 'rejected');

  const renderAnnouncementCard = (announcement: AnnouncementWithProfile) => (
    <Card key={announcement.id} className="elevated-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{announcement.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>by {announcement.profiles?.name || 'Unknown'}</span>
              <span>•</span>
              <span className="capitalize">{announcement.category}</span>
            </CardDescription>
          </div>
          <Badge
            variant={
              announcement.status === 'approved'
                ? 'default'
                : announcement.status === 'rejected'
                ? 'destructive'
                : 'secondary'
            }
            className="capitalize shrink-0"
          >
            {announcement.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {announcement.content}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
          </span>
          <div className="flex gap-2">
            {announcement.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleAction(announcement.id, 'approved')}
                  disabled={processingId === announcement.id}
                >
                  {processingId === announcement.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(announcement.id, 'rejected')}
                  disabled={processingId === announcement.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(announcement.id)}
              disabled={processingId === announcement.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
            <Megaphone className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Announcements
            </h1>
          </div>
          <p className="text-muted-foreground">
            Moderate and manage community announcements
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingAnnouncements.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingAnnouncements.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <Check className="h-4 w-4" />
              Approved ({approvedAnnouncements.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <X className="h-4 w-4" />
              Rejected ({rejectedAnnouncements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAnnouncements.length === 0 ? (
              <Card className="elevated-card">
                <CardContent className="py-12 text-center">
                  <Check className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending announcements.</p>
                </CardContent>
              </Card>
            ) : (
              pendingAnnouncements.map(renderAnnouncementCard)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedAnnouncements.length === 0 ? (
              <Card className="elevated-card">
                <CardContent className="py-12 text-center">
                  <Megaphone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No approved announcements.</p>
                </CardContent>
              </Card>
            ) : (
              approvedAnnouncements.map(renderAnnouncementCard)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedAnnouncements.length === 0 ? (
              <Card className="elevated-card">
                <CardContent className="py-12 text-center">
                  <X className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No rejected announcements.</p>
                </CardContent>
              </Card>
            ) : (
              rejectedAnnouncements.map(renderAnnouncementCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Announcements;
