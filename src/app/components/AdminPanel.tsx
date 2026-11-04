import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Radio,
  MapPin,
  Clock,
  Eye,
  FileText,
  TrendingUp,
  Activity,
  Bell,
  Send,
  Filter,
  Search,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  Globe,
  Siren,
  PhoneCall,
  Megaphone,
  UserCheck,
  Building2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AdminOnly } from "./ProtectedRoute";
import { toast } from "sonner";

interface IncidentReport {
  id: string;
  type: string;
  severity: string;
  location: string;
  description: string;
  reportedBy: string;
  reportedAt: Date;
  status: "pending" | "approved" | "rejected" | "investigating";
  coordinates: { lat: number; lng: number };
  images?: string[];
  witnesses?: number;
  injuries?: boolean;
  verificationScore?: number;
}

interface BroadcastAlert {
  title: string;
  message: string;
  severity: "info" | "warning" | "critical" | "emergency";
  affectedAreas: string[];
  validUntil: string;
  channels: string[];
}

export function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IncidentReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState<BroadcastAlert>({
    title: "",
    message: "",
    severity: "info",
    affectedAreas: [],
    validUntil: "",
    channels: [],
  });

  // Admin stats
  const [adminStats, setAdminStats] = useState({
    pendingReports: 0,
    activeIncidents: 0,
    totalVolunteers: 0,
    resourcesDeployed: 0,
    alertsSent: 0,
    averageResponseTime: 0,
  });

  // Load mock incident reports
  useEffect(() => {
    loadIncidentReports();
    calculateAdminStats();
  }, []);

  // Filter reports based on status and search
  useEffect(() => {
    let filtered = reports;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, searchQuery]);

  const loadIncidentReports = () => {
    // Mock data - in production, this would fetch from Supabase
    const mockReports: IncidentReport[] = [
      {
        id: "RPT-001",
        type: "Flood",
        severity: "critical",
        location: "Yamuna River, Delhi",
        description: "Severe flooding near Yamuna banks, water level rising rapidly. Multiple residential areas at risk.",
        reportedBy: "Rajesh Kumar",
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "pending",
        coordinates: { lat: 28.6139, lng: 77.209 },
        witnesses: 15,
        injuries: false,
        verificationScore: 85,
      },
      {
        id: "RPT-002",
        type: "Fire",
        severity: "high",
        location: "Industrial Area, Mumbai",
        description: "Factory fire reported. Smoke visible from distance. Fire brigade en route.",
        reportedBy: "Priya Sharma",
        reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: "approved",
        coordinates: { lat: 19.076, lng: 72.8777 },
        witnesses: 8,
        injuries: true,
        verificationScore: 92,
      },
      {
        id: "RPT-003",
        type: "Building Collapse",
        severity: "critical",
        location: "Old City, Ahmedabad",
        description: "3-story residential building partially collapsed. People may be trapped.",
        reportedBy: "Amit Patel",
        reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: "investigating",
        coordinates: { lat: 23.0225, lng: 72.5714 },
        witnesses: 25,
        injuries: true,
        verificationScore: 95,
      },
      {
        id: "RPT-004",
        type: "Gas Leak",
        severity: "medium",
        location: "Sector 18, Noida",
        description: "Gas smell reported in residential complex. Residents evacuated as precaution.",
        reportedBy: "Sneha Gupta",
        reportedAt: new Date(Date.now() - 30 * 60 * 1000),
        status: "approved",
        coordinates: { lat: 28.5694, lng: 77.321 },
        witnesses: 6,
        injuries: false,
        verificationScore: 78,
      },
      {
        id: "RPT-005",
        type: "Earthquake",
        severity: "low",
        location: "Uttarkashi, Uttarakhand",
        description: "Minor tremors felt. No damage reported yet. Monitoring situation.",
        reportedBy: "Vikram Singh",
        reportedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        status: "rejected",
        coordinates: { lat: 30.7268, lng: 78.4354 },
        witnesses: 12,
        injuries: false,
        verificationScore: 45,
      },
      {
        id: "RPT-006",
        type: "Traffic Accident",
        severity: "medium",
        location: "NH-44, Bangalore",
        description: "Multi-vehicle accident on highway. Traffic blocked. Ambulances dispatched.",
        reportedBy: "Deepak Reddy",
        reportedAt: new Date(Date.now() - 45 * 60 * 1000),
        status: "pending",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        witnesses: 10,
        injuries: true,
        verificationScore: 88,
      },
    ];

    setReports(mockReports);
    setFilteredReports(mockReports);
  };

  const calculateAdminStats = () => {
    setAdminStats({
      pendingReports: 15,
      activeIncidents: 12,
      totalVolunteers: 340,
      resourcesDeployed: 8,
      alertsSent: 127,
      averageResponseTime: 8.5,
    });
  };

  const handleApproveReport = async (reportId: string) => {
    setIsLoading(true);
    try {
      // In production, call Supabase API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReports(
        reports.map((r) =>
          r.id === reportId ? { ...r, status: "approved" as const } : r
        )
      );

      toast.success("Report approved and alert broadcasted");
    } catch (error) {
      toast.error("Failed to approve report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    setIsLoading(true);
    try {
      // In production, call Supabase API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReports(
        reports.map((r) =>
          r.id === reportId ? { ...r, status: "rejected" as const } : r
        )
      );

      toast.success("Report rejected");
    } catch (error) {
      toast.error("Failed to reject report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcastAlert = async () => {
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // In production, this would:
      // 1. Store alert in Supabase
      // 2. Send push notifications
      // 3. Update alert ticker
      // 4. Notify NDRF/NDMA if critical
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Alert broadcasted to all channels");
      setIsBroadcastDialogOpen(false);
      setBroadcastForm({
        title: "",
        message: "",
        severity: "info",
        affectedAreas: [],
        validUntil: "",
        channels: [],
      });
      
      // Increment alerts sent stat
      setAdminStats(prev => ({ ...prev, alertsSent: prev.alertsSent + 1 }));
    } catch (error) {
      toast.error("Failed to broadcast alert");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "investigating":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const exportReportData = () => {
    toast.info("Exporting report data...");
    // In production, generate CSV/Excel download
  };

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center min-h-[600px]">
          <Alert className="max-w-md">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Access Denied</strong>
              <p className="mt-2">
                This area is restricted to authorized administrators only.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Control Center</h1>
                  <p className="text-sm text-muted-foreground">
                    Emergency Operations Command Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportReportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Dialog
                  open={isBroadcastDialogOpen}
                  onOpenChange={setIsBroadcastDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Megaphone className="w-4 h-4 mr-2" />
                      Broadcast Alert
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-red-600" />
                        Broadcast Emergency Alert
                      </DialogTitle>
                      <DialogDescription>
                        Send mass alert to citizens, volunteers, and connected
                        agencies
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="alert-title">Alert Title *</Label>
                        <Input
                          id="alert-title"
                          placeholder="e.g., Severe Flood Warning - Delhi NCR"
                          value={broadcastForm.title}
                          onChange={(e) =>
                            setBroadcastForm({
                              ...broadcastForm,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alert-severity">Severity Level *</Label>
                        <Select
                          value={broadcastForm.severity}
                          onValueChange={(value: any) =>
                            setBroadcastForm({
                              ...broadcastForm,
                              severity: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">
                              <span className="flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Info - General Advisory
                              </span>
                            </SelectItem>
                            <SelectItem value="warning">
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                Warning - Caution Advised
                              </span>
                            </SelectItem>
                            <SelectItem value="critical">
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                Critical - Immediate Action
                              </span>
                            </SelectItem>
                            <SelectItem value="emergency">
                              <span className="flex items-center gap-2">
                                <Siren className="w-4 h-4 text-red-600" />
                                Emergency - Life Threatening
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alert-message">Message *</Label>
                        <Textarea
                          id="alert-message"
                          rows={4}
                          placeholder="Detailed alert message with instructions for citizens..."
                          value={broadcastForm.message}
                          onChange={(e) =>
                            setBroadcastForm({
                              ...broadcastForm,
                              message: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="affected-areas">
                            Affected Areas (Optional)
                          </Label>
                          <Input
                            id="affected-areas"
                            placeholder="e.g., Delhi, Noida, Gurgaon"
                            onChange={(e) =>
                              setBroadcastForm({
                                ...broadcastForm,
                                affectedAreas: e.target.value
                                  .split(",")
                                  .map((s) => s.trim()),
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="valid-until">Valid Until</Label>
                          <Input
                            id="valid-until"
                            type="datetime-local"
                            value={broadcastForm.validUntil}
                            onChange={(e) =>
                              setBroadcastForm({
                                ...broadcastForm,
                                validUntil: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Broadcast Channels</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "SMS to Citizens",
                            "Mobile App Push",
                            "Alert Ticker",
                            "Email Notifications",
                            "NDRF Portal",
                            "NDMA Dashboard",
                          ].map((channel) => (
                            <label
                              key={channel}
                              className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setBroadcastForm({
                                      ...broadcastForm,
                                      channels: [
                                        ...broadcastForm.channels,
                                        channel,
                                      ],
                                    });
                                  } else {
                                    setBroadcastForm({
                                      ...broadcastForm,
                                      channels: broadcastForm.channels.filter(
                                        (c) => c !== channel
                                      ),
                                    });
                                  }
                                }}
                              />
                              <span className="text-sm">{channel}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {broadcastForm.severity === "emergency" && (
                        <Alert className="border-red-200 bg-red-50">
                          <Siren className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            <strong>Emergency Alert Protocol</strong>
                            <p className="mt-1 text-sm">
                              This will trigger immediate notifications to NDRF,
                              NDMA, local police, and emergency services. Use
                              only for life-threatening situations.
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsBroadcastDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBroadcastAlert}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Broadcasting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Broadcast Alert
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Reports
                    </CardTitle>
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adminStats.pendingReports}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting review
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Incidents
                    </CardTitle>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adminStats.activeIncidents}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently ongoing
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Volunteers Active
                    </CardTitle>
                    <Users className="w-4 h-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adminStats.totalVolunteers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      On field today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Resources Deployed
                    </CardTitle>
                    <Activity className="w-4 h-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adminStats.resourcesDeployed}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Teams & equipment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Alerts Sent
                    </CardTitle>
                    <Bell className="w-4 h-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adminStats.alertsSent}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Response Time
                    </CardTitle>
                    <Clock className="w-4 h-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adminStats.averageResponseTime}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last 24 hours
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhoneCall className="w-5 h-5" />
                    Emergency Contacts & Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2">
                        National Emergency
                      </h4>
                      <p className="text-2xl font-bold text-red-600">112</p>
                      <p className="text-sm text-red-700 mt-1">
                        All India Emergency Number
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-2">
                        NDRF Headquarters
                      </h4>
                      <p className="text-lg font-bold text-orange-600">
                        +91-9711077372
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        National Disaster Response Force
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        NDMA Control Room
                      </h4>
                      <p className="text-lg font-bold text-blue-600">
                        +91-11-26701728
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        National Disaster Management Authority
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        State Control Room
                      </h4>
                      <p className="text-lg font-bold text-purple-600">
                        1070 / 1077
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        State Emergency Operations Center
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <Globe className="w-5 h-5 mb-2" />
                      <span className="text-xs">NDMA Portal</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <Shield className="w-5 h-5 mb-2" />
                      <span className="text-xs">NDRF Connect</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <Activity className="w-5 h-5 mb-2" />
                      <span className="text-xs">SACHET Alerts</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <MapPin className="w-5 h-5 mb-2" />
                      <span className="text-xs">Live Map</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Management Tab */}
            <TabsContent value="reports" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by location, type, or description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        loadIncidentReports();
                        toast.info("Reports refreshed");
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reports Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Incident Reports</CardTitle>
                    <Badge variant="outline">
                      {filteredReports.length} Reports
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-mono text-sm">
                              {report.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{report.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 max-w-[200px]">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate text-sm">
                                  {report.location}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getSeverityColor(report.severity)}
                              >
                                {report.severity.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getStatusColor(report.status)}
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {report.verificationScore}%
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatTimeAgo(report.reportedAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedReport(report)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        Report Details - {selectedReport?.id}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Full incident report information
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedReport && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-xs text-muted-foreground">
                                              Type
                                            </Label>
                                            <p className="font-medium">
                                              {selectedReport.type}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-muted-foreground">
                                              Severity
                                            </Label>
                                            <div>
                                              <Badge
                                                className={getSeverityColor(
                                                  selectedReport.severity
                                                )}
                                              >
                                                {selectedReport.severity.toUpperCase()}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <Label className="text-xs text-muted-foreground">
                                            Location
                                          </Label>
                                          <p className="font-medium">
                                            {selectedReport.location}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedReport.coordinates.lat.toFixed(
                                              4
                                            )}
                                            , {selectedReport.coordinates.lng.toFixed(4)}
                                          </p>
                                        </div>

                                        <div>
                                          <Label className="text-xs text-muted-foreground">
                                            Description
                                          </Label>
                                          <p className="text-sm">
                                            {selectedReport.description}
                                          </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <Label className="text-xs text-muted-foreground">
                                              Reported By
                                            </Label>
                                            <p className="text-sm font-medium">
                                              {selectedReport.reportedBy}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-muted-foreground">
                                              Witnesses
                                            </Label>
                                            <p className="text-sm font-medium">
                                              {selectedReport.witnesses || 0}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-xs text-muted-foreground">
                                              Injuries
                                            </Label>
                                            <p className="text-sm font-medium">
                                              {selectedReport.injuries ? "Yes" : "No"}
                                            </p>
                                          </div>
                                        </div>

                                        <div>
                                          <Label className="text-xs text-muted-foreground">
                                            Verification Score
                                          </Label>
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full ${
                                                  selectedReport.verificationScore! >= 80
                                                    ? "bg-green-500"
                                                    : selectedReport.verificationScore! >= 60
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500"
                                                }`}
                                                style={{
                                                  width: `${selectedReport.verificationScore}%`,
                                                }}
                                              />
                                            </div>
                                            <span className="font-semibold">
                                              {selectedReport.verificationScore}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                {report.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleApproveReport(report.id)}
                                      disabled={isLoading}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleRejectReport(report.id)}
                                      disabled={isLoading}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Volunteer Management
                    </CardTitle>
                    <CardDescription>
                      Active volunteers and deployment status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="font-medium">On Field</p>
                            <p className="text-sm text-muted-foreground">
                              Actively deployed
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">127</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-medium">Available</p>
                            <p className="text-sm text-muted-foreground">
                              Ready for deployment
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">213</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-yellow-600" />
                          <div>
                            <p className="font-medium">In Training</p>
                            <p className="text-sm text-muted-foreground">
                              Skill development
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">45</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Resource Allocation
                    </CardTitle>
                    <CardDescription>Equipment and supply status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Rescue Equipment</span>
                          <span className="font-semibold">85%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-[85%]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Medical Supplies</span>
                          <span className="font-semibold">62%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 w-[62%]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Emergency Vehicles</span>
                          <span className="font-semibold">78%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[78%]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Communication Gear</span>
                          <span className="font-semibold">91%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-[91%]" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics and operational insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <TrendingUp className="h-4 h-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Analytics Dashboard</p>
                        <p className="text-sm text-muted-foreground">
                          Detailed analytics with charts and graphs for incident
                          trends, response times, volunteer performance, and
                          resource utilization will be displayed here. This
                          section integrates with the recharts library for data
                          visualization.
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground mt-2">
                          <li>Incident frequency by type and location</li>
                          <li>Response time trends over time</li>
                          <li>Volunteer deployment patterns</li>
                          <li>Resource allocation efficiency</li>
                          <li>Alert effectiveness metrics</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminOnly>
  );
}
