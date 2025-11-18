
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
  // Simplified title logic for cleaner presentation
  const path = pathname.split("/").pop() || "dashboard";
  if (path.includes("-")) {
    return path.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  return path.charAt(0).toUpperCase() + path.slice(1);
};

export const DashboardLayout = () => {
  const location = useLocation();
  const currentPageTitle = getPageTitle(location.pathname);
  const { user } = useAuth();
  const { profile, hasCompleteProfile, profileLoading } = useProfile(user?.id || null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!profileLoading) {
      setShowProfileModal(!!user && !hasCompleteProfile);
    }
  }, [user, hasCompleteProfile, profileLoading]);

  useEffect(() => {
    if (!isMobile) {
        setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${isMobile ? (isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}>
        <AppSidebar isOpen={!isMobile || isMobileSidebarOpen} />
      </div>
      {isMobile && isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${!isMobile ? 'ml-64' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 h-16 border-b bg-card/95 backdrop-blur-sm flex items-center px-4 sm:px-6 z-30">
          <div className="flex items-center w-full gap-2 sm:gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {currentPageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full">
                 {profile?.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Profile Logo"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-background/90 p-0">
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
