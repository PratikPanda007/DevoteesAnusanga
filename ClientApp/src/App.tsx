import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { DevoteeRoute } from "@/components/DevoteeRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { SuperAdminRoute } from "./components/SuperAdminRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Guidelines from "./pages/Guidelines";
import Directory from "./pages/Directory";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import NewAnnouncement from "./pages/NewAnnouncement";
import DataExport from "./pages/DataExport";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSearchUsers from "./pages/admin/SearchUsers";
import AdminAddUser from "./pages/admin/AddUser";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Profile route - requires authentication but NOT a profile (so users can create one) */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Devotee routes - requires authentication AND a profile */}
            <Route path="/directory" element={<DevoteeRoute><Directory /></DevoteeRoute>} />
            <Route path="/announcements" element={<DevoteeRoute><Announcements /></DevoteeRoute>} />
            <Route path="/announcements/new" element={<DevoteeRoute><NewAnnouncement /></DevoteeRoute>} />
            
            {/* Admin routes - requires admin role */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<SuperAdminRoute><AdminSearchUsers /></SuperAdminRoute>} />
            <Route path="/admin/users/add" element={<SuperAdminRoute><AdminAddUser /></SuperAdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
            <Route path="/admin/settings" element={<SuperAdminRoute><AdminSettings /></SuperAdminRoute>} />
            <Route path="/admin/export" element={<SuperAdminRoute><DataExport /></SuperAdminRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
