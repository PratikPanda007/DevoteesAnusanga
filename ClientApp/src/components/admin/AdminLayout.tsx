import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import {
  LayoutDashboard,
  UserPlus,
  Search,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Search, label: 'Search Users', end: false },
  { to: '/admin/users/add', icon: UserPlus, label: 'Add User', end: false },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements', end: false },
  { to: '/admin/settings', icon: Settings, label: 'Settings', end: false },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string, end: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside
          className={cn(
            'bg-card border-r border-border transition-all duration-300 flex flex-col',
            collapsed ? 'w-16' : 'w-64'
          )}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            {!collapsed && (
              <h2 className="font-serif font-semibold text-foreground">Admin Panel</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="shrink-0"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 p-2 space-y-1">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive: active }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    'hover:bg-muted/50',
                    active || isActive(item.to, item.end)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </Layout>
  );
};
