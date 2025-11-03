
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { User, PanelLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ProfileSetupModal from "@/components/ProfileSetupModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

const getPageTitle = (pathname: string) => {
  const routes: Record<string, string> = {
    "/app/dashboard": "Dashboard",
    "/app/create-invoice": "Create Invoice",
    "/app/invoices": "Invoices",
    "/app/clients": "Clients",
    "/app/templates": "Templates",
    "/app/profile": "Profile",
    "/app/settings": "Settings", // Add the new Settings route title
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
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!profileLoading) {
      if (user && !hasCompleteProfile) {
        setShowProfileModal(true);
      } else if (user && hasCompleteProfile) {
        setShowProfileModal(false);
      }
    }
  }, [user, hasCompleteProfile, profileLoading]);

  const handleSidebarToggle = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen w-full flex items-start bg-background">
      {/* Sticky sidebar for desktop */}
      {!isMobile && (
        <aside className="sticky top-0 h-screen">
          <AppSidebar isOpen={!isMobile} />
        </aside>
      )}

      {/* Mobile sidebar with overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleSidebarToggle}
          />
          <div className="fixed top-0 left-0 h-full z-50">
            <AppSidebar isOpen={isMobileSidebarOpen} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 h-20 border-b bg-card/95 backdrop-blur-md flex items-center px-4 lg:px-8 z-30 shadow-md gap-4">
          <div className="flex items-center w-full gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="lg"
                className="h-12 w-auto px-3 rounded-xl hover:bg-accent/50"
                onClick={handleSidebarToggle}
              >
                {isMobileSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <PanelLeft className="h-6 w-6" />
                )}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {currentPageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="lg"
                className="h-12 w-auto px-3 rounded-xl overflow-hidden hover:bg-accent/50"
              >
                {profile?.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Profile Logo"
                    className="h-9 w-auto object-contain"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-10 bg-background/90 overflow-x-hidden">
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
  );
};
