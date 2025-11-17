
import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Settings, LayoutDashboard, FileText, Users, DollarSign, User as UserIcon } from "lucide-react";
import logo from "/Simple invoicing logo.png";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile"; // Import useProfile

interface AppSidebarProps {
  isOpen: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen }) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id || null); // Get profile data

  const navLinks = [
    { path: "/app/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
    { path: "/app/invoices", icon: <FileText className="h-4 w-4" />, label: "Invoices" },
    { path: "/app/clients", icon: <Users className="h-4 w-4" />, label: "Clients" },
    { path: "/app/billing", icon: <DollarSign className="h-4 w-4" />, label: "Billing" },
  ];

  const bottomLinks = [
      { path: "/app/profile", icon: <UserIcon className="h-4 w-4" />, label: "Profile" },
      { path: "/app/settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
  ]

  return (
    <div className="h-full w-64 bg-card border-r flex flex-col">
      {/* Header */}
      <div className="h-16 border-b flex items-center px-4 shrink-0">
          <img src={logo} alt="Logo" className="h-10" />
          <span className="text-lg font-semibold ml-2"></span>
      </div>

      {/* Navigation */}
      <div className="flex-grow flex flex-col justify-between">
          <nav className="py-4 px-4 space-y-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-200 text-sm ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50"}`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
          
          {/* Bottom Section */}
          <div className="border-t px-4 py-4 space-y-4">
              <nav className="space-y-1.5">
                {bottomLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-200 text-sm ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50"}`
                    }
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>
              
              <Separator />

              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-sm truncate">{profile?.business_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.business_name ? user?.email : ''}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
          </div>
      </div>
    </div>
  );
};
