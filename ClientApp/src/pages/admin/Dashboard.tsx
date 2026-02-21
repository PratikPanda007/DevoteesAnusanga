import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
    Shield,
    Users,
    Megaphone,
    Check,
    Loader2,
    UserCheck,
    UserX,
    Clock,
} from "lucide-react";

import { fetchDashboardData, AdminDashboard } from "@/lib/admin-dashboard-api";
import { useAuth } from "../../lib/auth-context";

const Dashboard = () => {
    const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin, isSuperAdmin } = useAuth();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await fetchDashboardData();
            setDashboard(data);
        } catch (error) {
            console.error("Failed to load dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !dashboard) {
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
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {isSuperAdmin ?
                                            dashboard.totalUsers
                                            : Math.max(0, dashboard.totalUsers - 2) }
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Members
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {isSuperAdmin ?
                                            dashboard.publicProfiles
                                            : Math.max(0, dashboard.publicProfiles - 2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Public Profiles
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <UserX className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {isSuperAdmin ?
                                            dashboard.privateProfiles
                                            : Math.max(0, dashboard.privateProfiles - 2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Private Profiles
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Announcement Stats */}
                <h2 className="text-lg font-medium mb-4">Announcements</h2>
                <div className="grid sm:grid-cols-4 gap-4">
                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Megaphone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {dashboard.totalAnnouncements}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Announcements
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {dashboard.pendingAnnouncements}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Pending Review
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {dashboard.approvedAnnouncements}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Approved
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <UserX className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {dashboard.rejectedAnnouncements}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Rejected
                                    </p>
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