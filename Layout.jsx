
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, PieChart, BarChart3, Plus, Home, LogOut, User as UserIcon } from "lucide-react";
import { User } from "@/entities/User";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Portfolio",
    url: createPageUrl("Portfolio"),
    icon: Home,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
  {
    title: "Add Stocks",
    url: createPageUrl("AddStock"),
    icon: Plus,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      // Check for profile completion
      if (!currentUser.phone && location.pathname !== createPageUrl("CompleteProfile")) {
        navigate(createPageUrl("CompleteProfile"));
      }
    } catch (error) {
      // User not authenticated, redirect to Auth page
      if (location.pathname !== createPageUrl("Auth")) {
        navigate(createPageUrl("Auth"));
      }
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Auth"));
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      navigate(createPageUrl("Auth"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page or profile completion page without layout
  if ((!user && location.pathname === createPageUrl("Auth")) || (user && !user.phone && location.pathname === createPageUrl("CompleteProfile"))) {
    return children;
  }

  // Redirect to auth if user not authenticated and not on auth page
  // Or show loading if profile incomplete and not on complete profile page (during redirect)
  if (!user || (user && !user.phone)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: 15 23 42;
            --primary-foreground: 248 250 252;
            --secondary: 241 245 249;
            --secondary-foreground: 15 23 42;
            --muted: 248 250 252;
            --muted-foreground: 100 116 139;
            --accent: 30 64 175;
            --accent-foreground: 255 255 255;
            --destructive: 239 68 68;
            --destructive-foreground: 255 255 255;
            --border: 226 232 240;
            --input: 226 232 240;
            --ring: 30 64 175;
            --background: 255 255 255;
            --foreground: 15 23 42;
            --chart-1: 30 64 175;
            --chart-2: 16 185 129;
            --chart-3: 99 102 241;
            --chart-4: 239 68 68;
            --chart-5: 139 92 246;
          }
          
          .gradient-bg {
            background: linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%);
          }
          
          .navy-text {
            color: rgb(15, 23, 42);
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="gradient-bg p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">PortfolioIQ</h2>
                <p className="text-xs text-blue-100">by KAHF Capital</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl transition-all duration-200 ${
                          location.pathname === item.url 
                            ? 'bg-blue-50 text-blue-800 shadow-sm' 
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold navy-text">PortfolioIQ</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-slate-50">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
