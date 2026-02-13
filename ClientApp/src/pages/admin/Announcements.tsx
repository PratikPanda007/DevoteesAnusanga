import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    getPendingAnnouncements,
    reviewAnnouncement,
} from "@/lib/announcements-api";
import { toast } from "sonner";
import {
    Megaphone,
    Check,
    X,
    Loader2,
    Calendar,
    Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    approvalStatus: number; // 0 = pending, 1 = approved, 2 = rejected
    createdAt: string;
}

const Announcements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const data = await getPendingAnnouncements();
            setAnnouncements(data ?? []);
        } catch (error) {
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: number) => {
        try {
            setProcessingId(id);

            await reviewAnnouncement({
                announcementId: id,
                status: status, // 1 = approve, 2 = reject
            });

            toast.success(
                status === 1
                    ? "Announcement approved"
                    : "Announcement rejected"
            );

            // remove from UI instantly
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    const renderAnnouncementCard = (announcement: Announcement) => (
        <Card key={announcement.id} className="elevated-card">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg">
                            {announcement.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <span className="capitalize">{announcement.category}</span>
                        </CardDescription>
                    </div>

                    <Badge variant="secondary">Pending</Badge>
                </div>
            </CardHeader>

            <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {announcement.content}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(announcement.createdAt), {
                            addSuffix: true,
                        })}
                    </span>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleAction(announcement.id, 1)}
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
                            onClick={() => handleAction(announcement.id, 2)}
                            disabled={processingId === announcement.id}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Reject
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
                            Pending Announcements
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Approve or reject submitted announcements
                    </p>
                </div>

                {announcements.length === 0 ? (
                    <Card className="elevated-card">
                        <CardContent className="py-12 text-center">
                            <Check className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                No pending announcements.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {announcements.map(renderAnnouncementCard)}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Announcements;
