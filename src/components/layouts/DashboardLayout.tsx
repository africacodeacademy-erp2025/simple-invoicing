import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { User, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ProfileSetupModal from "@/components/ProfileSetupModal";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";

const getPageTitle = (pathname: string) => {
  const routes: Record<string, string> = {
    "/app/dashboard": "Dashboard",
    "/app/create-invoice": "Create Invoice",
    "/app/invoices": "Invoices",
    "/app/clients": "Clients",
    "/app/templates": "Templates",
    "/app/profile": "Profile",
  };

  return routes[pathname] || "Dashboard";
};

export const DashboardLayout = () => {
  const location = useLocation();
  const currentPageTitle = getPageTitle(location.pathname);
  const { user } = useAuth();
  const { profile, hasCompleteProfile, profileLoading } = useProfile(
    user?.id || null
  );
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (!profileLoading) {
      if (user && !hasCompleteProfile) {
        setShowProfileModal(true);
      } else if (user && hasCompleteProfile) {
        setShowProfileModal(false);
      }
    }
  }, [user, hasCompleteProfile, profileLoading]);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 h-16 border-b bg-card/95 backdrop-blur-md flex items-center px-4 lg:px-6 z-50">
            <div className="flex items-center w-full gap-4">
              <Drawer direction="left">
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-3/4 p-0">
                  <AppSidebar />
                </DrawerContent>
              </Drawer>

              <SidebarTrigger className="hidden lg:block hover:bg-muted/80 transition-colors shrink-0" />

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-foreground truncate">
                  {currentPageTitle}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-auto px-2 rounded-lg overflow-hidden"
                >
                  {profile?.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Profile Logo"
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6 bg-muted/20">
            <Outlet />
          </main>
        </div>

        {user && (
          <ProfileSetupModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </div>
    </SidebarProvider>
  );
};
