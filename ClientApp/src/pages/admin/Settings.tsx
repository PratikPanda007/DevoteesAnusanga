import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Bell, Shield, Globe, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoApproveAnnouncements: false,
    publicDirectory: true,
    maintenanceMode: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated');
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Configure application settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for new announcements
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Moderation */}
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Moderation
              </CardTitle>
              <CardDescription>
                Configure content moderation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoApprove">Auto-approve Announcements</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve all new announcements
                  </p>
                </div>
                <Switch
                  id="autoApprove"
                  checked={settings.autoApproveAnnouncements}
                  onCheckedChange={() => handleToggle('autoApproveAnnouncements')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Directory */}
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Directory
              </CardTitle>
              <CardDescription>
                Configure public directory settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="publicDirectory">Public Directory</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow public profiles to be visible in the directory
                  </p>
                </div>
                <Switch
                  id="publicDirectory"
                  checked={settings.publicDirectory}
                  onCheckedChange={() => handleToggle('publicDirectory')}
                />
              </div>
            </CardContent>
          </Card>

          {/* System */}
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System
              </CardTitle>
              <CardDescription>
                System maintenance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the application in maintenance mode
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={() => handleToggle('maintenanceMode')}
                />
              </div>

              <Separator />

              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => toast.info('Export functionality coming soon')}>
                  Export All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
