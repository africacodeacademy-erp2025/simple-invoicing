import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Users,
  FileText,
  Layout,
  Plus,
  User,
  Building2,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Invoice",
    url: "/app/create-invoice",
    icon: Plus,
  },
  {
    title: "Invoices",
    url: "/app/invoices",
    icon: FileText,
  },
  {
    title: "Clients",
    url: "/app/clients",
    icon: Users,
  },
  {
    title: "Templates",
    url: "/app/templates",
    icon: Layout,
  },
  {
    title: "Billing",
    url: "/app/billing",
    icon: FileText,
  },
  {
    title: "Profile",
    url: "/app/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary/10 text-primary font-medium shadow-sm"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground";

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await signOut();

      if (!response.success) {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: response.message,
      });

      navigate("/signin");
    } catch (error: unknown) {
      console.error("Logout error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar/95 backdrop-blur-md border-sidebar-border shadow-lg relative">
        {/* Subtle depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/3 pointer-events-none" />

        {/* Premium Logo Section */}
        <div
          className={`relative border-b border-sidebar-border/60 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent ${
            state === "collapsed" ? "p-3" : "h-16 px-6"
          }`}
        >
          <div
            className={`flex items-center ${
              state === "collapsed" ? "justify-center" : "gap-3 h-full"
            }`}
          >
            <div
              className={`bg-primary-gradient rounded-xl flex items-center justify-center shadow-lg ${
                state === "collapsed" ? "w-8 h-8" : "w-10 h-10"
              }`}
            >
              <Building2
                className={`text-white ${
                  state === "collapsed" ? "h-4 w-4" : "h-5 w-5"
                }`}
              />
            </div>
            {state !== "collapsed" && (
              <div className="flex flex-col">
                <span className="font-bold text-sidebar-foreground text-lg">
                  Simple Invoicing
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={`relative py-6 ${state === "collapsed" ? "px-2" : "px-3"}`}
        >
          <SidebarGroup>
            {state !== "collapsed" && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider font-medium px-3 mb-4">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu
                className={`space-y-2 ${
                  state === "collapsed" ? "items-center" : ""
                }`}
              >
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={state === "collapsed" ? item.title : undefined}
                      className={state === "collapsed" ? "justify-center" : ""}
                    >
                      <NavLink
                        to={item.url}
                        end
                        className={`${getNavCls({
                          isActive: isActive(item.url),
                        })} transition-all duration-200 rounded-lg group ${
                          state === "collapsed"
                            ? "mx-0 justify-center items-center"
                            : "mx-2"
                        }`}
                      >
                        <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        {state !== "collapsed" && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Logout Section */}
        <div
          className={`relative mt-auto ${
            state === "collapsed" ? "px-2" : "px-3"
          }`}
        >
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu
                className={`space-y-2 ${
                  state === "collapsed" ? "items-center" : ""
                }`}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    tooltip={state === "collapsed" ? "Logout" : undefined}
                    className={state === "collapsed" ? "justify-center" : ""}
                  >
                    <div
                      className={`${getNavCls({
                        isActive: false,
                      })} transition-all duration-200 rounded-lg group ${
                        state === "collapsed"
                          ? "mx-0 justify-center items-center"
                          : "mx-2"
                      } flex items-center gap-2 w-full`}
                    >
                      <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                      {state !== "collapsed" && (
                        <span className="font-medium">Logout</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
