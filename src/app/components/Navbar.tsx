import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import {
  AlertTriangle,
  Map,
  Heart,
  Users,
  Settings,
  Home,
  Phone,
  Shield,
  Bell,
  Search,
  User,
  LogOut,
  Sun,
  Globe,
  Activity,
  Radio,
  Wifi,
  WifiOff,
  LogIn,
  UserPlus,
  Building,
  Zap,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { UserProfileModal } from "./UserProfileModal";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, loading, signOut } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] =
    useState<"operational" | "degraded" | "down">("operational");

  const [volunteerCount, setVolunteerCount] = useState(0);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; message: string; time: string; read?: boolean }>
  >([]);

  const [searchSuggestions, setSearchSuggestions] = useState<
    Array<{ title: string; type: string; icon: any }>
  >([]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    setSearchSuggestions([
      { title: "Latest incidents near you", type: "incidents", icon: AlertTriangle },
      { title: "Volunteer roster today", type: "volunteers", icon: Users },
      { title: "Donation centers", type: "centers", icon: Heart },
    ]);
  }, []);

  const navigationItems = [
    {
      id: "home",
      label: "Dashboard",
      icon: Home,
      description: "Overview and statistics",
      hotkey: "⌘D",
    },
    {
      id: "live-map",
      label: "Live Map",
      icon: Map,
      description: "Real-time incident tracking",
      badge: "Live",
      badgeVariant: "destructive" as const,
      hotkey: "⌘M",
    },
    {
      id: "report",
      label: "Report",
      icon: AlertTriangle,
      description: "Submit incident reports",
      urgent: true,
      hotkey: "⌘R",
    },
    {
      id: "volunteers",
      label: "Volunteers",
      icon: Users,
      description: "Manage volunteer resources",
      badge: volunteerCount > 0 ? volunteerCount.toString() : undefined,
      badgeVariant: "secondary" as const,
      hotkey: "⌘V",
    },
    {
      id: "donations",
      label: "Donations",
      icon: Heart,
      description: "Support relief efforts",
      hotkey: "⌘$",
    },
  ];

  // Add admin navigation item only for admin users
  const allNavigationItems = user?.role === 'admin' 
    ? [
        ...navigationItems,
        {
          id: "admin",
          label: "Admin Panel",
          icon: Shield,
          description: "Administrative controls",
          badge: "Admin",
          badgeVariant: "destructive" as const,
          hotkey: "⌘A",
        }
      ]
    : navigationItems;

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <Zap className="w-3 h-3" />;
      case "degraded":
        return <Activity className="w-3 h-3" />;
      case "down":
        return <Radio className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "volunteer":
        return <Users className="w-4 h-4" />;
      case "ngo":
        return <Building className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "volunteer":
        return "bg-blue-100 text-blue-800";
      case "ngo":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 inset-x-0 z-50 bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur border-b border-border shadow-sm">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-10">
        <div className="py-2">
          <div className="grid grid-cols-12 gap-2 items-start">

            {/* Left Section */}
            <div className="col-span-12 md:col-span-6 xl:col-span-4 flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-semibold leading-tight truncate">
                    DisasterShield
                  </h1>
                  <div className="flex items-center gap-2 text-[11px] leading-tight">
                    <span className={`flex items-center gap-1 ${getStatusColor(systemStatus)}`}>
                      {getStatusIcon(systemStatus)}
                      <span className="capitalize">{systemStatus}</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {isOnline ? (
                        <>
                          <Wifi className="w-3 h-3 text-green-600" />
                          <span>Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 text-red-600" />
                          <span>Offline</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[180px]">
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 justify-start text-muted-foreground"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Search incidents, volunteers...</span>
                      <span className="sm:hidden">Search…</span>
                      <kbd className="ml-auto hidden md:flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                        ⌘K
                      </kbd>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Quick Access">
                          {searchSuggestions.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <CommandItem key={idx} className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span>{item.title}</span>
                                <Badge variant="outline" className="ml-auto text-xs">{item.type}</Badge>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* ✅ CENTER NAVIGATION (Desktop Only — Hidden on Mobile) */}
            <div className="col-span-12 order-last xl:order-none xl:col-span-5 min-w-0 hidden md:block">
              <div className="flex flex-wrap justify-center items-center gap-1 py-1">
                {allNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onTabChange(item.id)}
                      className={`h-9 px-3 ${
                        item.urgent && !isActive
                          ? "text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          : ""
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {item.label}
                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant as any}
                          className="ml-2 text-[10px] px-1.5 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Right-side Actions */}
            <div className="col-span-12 md:col-span-6 xl:col-span-3 flex flex-wrap md:flex-nowrap items-center justify-end gap-2 min-w-0 overflow-hidden">
              
              {/* Emergency */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-2 h-9">
                    <Phone className="w-4 h-4 text-destructive" />
                    Emergency ⤵
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Emergency Contacts - India</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>Emergency Services</span>
                    <Badge variant="destructive">112</Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>NDRF Rescue Team</span>
                    <span className="text-sm text-muted-foreground">+91-9711077372</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>Control Room (24x7)</span>
                    <span className="text-sm text-muted-foreground">+91-11-26701728</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>Information (Mon-Fri)</span>
                    <span className="text-sm text-muted-foreground">+91-11-26701700</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative h-9 w-9 p-0">
                    <Bell className="w-4 h-4" />
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] p-0 flex items-center justify-center">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Badge variant="secondary">{unreadNotifications} new</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <DropdownMenuItem key={n.id} className="flex flex-col items-start p-3 border-b">
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-medium text-sm">{n.title}</span>
                            <div className="flex items-center gap-2">
                              {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              <span className="text-xs text-muted-foreground">{n.time}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{n.message}</p>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <DropdownMenuItem className="text-center text-sm text-blue-600 p-3">
                      View all notifications
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User / Auth */}
              {!loading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`${getRoleColor(user.role)} text-xs flex items-center gap-1`}>
                                {getRoleIcon(user.role)}
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Toggle theme</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Globe className="mr-2 h-4 w-4" />
                          <span>Language</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAuthModalOpen(true)} className="flex items-center gap-2 h-9">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Button>
                      <Button size="sm" onClick={() => setAuthModalOpen(true)} className="flex items-center gap-2 h-9">
                        <UserPlus className="w-4 h-4" />
                        Sign Up
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Mobile Navigation (only < md) */}
        <div className="md:hidden pb-3">
          <div className="grid grid-cols-5 gap-2">
            {allNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className="flex flex-col h-auto py-3 relative"
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{item.label}</span>

                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 text-xs px-1 py-0 min-w-0 h-4"
                    >
                      {item.badge}
                    </Badge>
                  )}

                  {item.urgent && !isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 py-2 text-sm text-muted-foreground border-t border-border/50">
          <Home className="w-3 h-3" />
          <span>/</span>
          <span className="text-foreground font-medium">
            {allNavigationItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
          </span>
          {activeTab === "live-map" && (
            <>
              <span>/</span>
              <span>Real-time Monitoring</span>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      {user && <UserProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />}
    </nav>
  );
}