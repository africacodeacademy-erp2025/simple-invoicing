
import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Settings, LayoutDashboard, FileText, Users, Palette, LifeBuoy, User, DollarSign } from "lucide-react";
import logo from "/Simple invoicing logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Billing from "@/pages/Billing";

interface AppSidebarProps {
  isOpen: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen }) => {
  const { signOut } = useAuth();

  const navLinks = [
    {
      path: "/app/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
    },
    {
      path: "/app/invoices",
      icon: <FileText className="h-4 w-4" />,
      label: "Invoices",
    },
    {
      path: "/app/clients",
      icon: <Users className="h-4 w-4" />,
      label: "Clients",
    },
    {
      path: "/app/billing",
      icon: < DollarSign className="h-4 w-4" />,
      label: "Billing",
    },
    {
      path: "/app/profile",
      icon: <User className="h-4 w-4" />,
      label: "Profile",
    },
    {
      path: "/app/settings", // New settings link
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
    },
  ];

  return (
    <div
      className={`h-full bg-card border-r transition-all duration-300 ease-in-out ${(
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 border-b flex items-center px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-28 h-20 flex items-center justify-center">
              <img
                src={logo}
                alt="Simple Invoicing Logo"
                className="object-contain scale-110"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${(
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50"
                )}`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-muted/50"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
