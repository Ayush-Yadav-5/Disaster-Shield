import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { WeatherTracker } from "./WeatherTracker";
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  Heart,
  MapPin,
  Phone,
  Shield,
  Building2,
  Zap,
  TrendingUp,
  Clock,
  Bell,
  Navigation,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Target,
  Globe,
  Database,
  Merge,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  Bot
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { alertService, type EmergencyAlert } from "../utils/alert-service";
import { weatherService, type LocationCoordinates } from "../utils/weather-service";
import { toast } from "sonner";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [locationAlerts, setLocationAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [alertStats, setAlertStats] = useState({
    totalAlerts: 0,
    mergedAlerts: 0,
    individualAlerts: 0,
    totalOriginalAlerts: 0
  });

  // Mock stats for demonstration
  const [stats] = useState({
    activeIncidents: 12,
    volunteersActive: 340,
    donationsToday: 25600,
    resourcesDeployed: 8
  });

  useEffect(() => {
    initializeDashboard();
    
    const locationUnsubscribe = weatherService.addLocationListener((newLocation) => {
      setLocation(newLocation);
      if (newLocation) {
        loadLocationAlerts(newLocation);
      }
    });
    
    const handleOnline = () => {
      setIsOnline(true);
      loadAlerts();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Auto-refresh alerts every 5 minutes
    const alertInterval = setInterval(() => {
      if (!loading) {
        loadAlerts();
        if (location) {
          loadLocationAlerts(location);
        }
      }
    }, 5 * 60 * 1000);
    
    return () => {
      locationUnsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(alertInterval);
    };
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAlerts(),
        requestLocationIfAvailable()
      ]);
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      toast.error('Failed to initialize dashboard');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationIfAvailable = async () => {
    try {
      if (weatherService.isLocationAvailable()) {
        return;
      }
      await weatherService.requestLocationPermission();
    } catch (error) {
      console.log('Location access not available or denied');
    }
  };

  const loadAlerts = async () => {
    setAlertsLoading(true);
    try {
      const allAlerts = await alertService.getAllAlerts();
      const recentAlerts = allAlerts
        .filter(alert => alert.isActive && alert.validUntil > new Date())
        .slice(0, 8);
      
      setAlerts(recentAlerts);
      setIsOnline(alertService.isOnlineMode());
      setLastUpdateTime(alertService.getLastUpdateTime());
      
      // Calculate alert statistics
      const stats = alertService.getMergedAlertStats(allAlerts);
      setAlertStats(stats);
      
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setIsOnline(false);
    } finally {
      setAlertsLoading(false);
    }
  };

  const loadLocationAlerts = async (currentLocation: LocationCoordinates) => {
    try {
      let locationInfo = null;
      try {
        locationInfo = await weatherService.getLocationByCoordinates(
          currentLocation.latitude, 
          currentLocation.longitude
        );
      } catch (error) {
        console.log('Could not get location details');
      }

      const locationBasedAlerts = await alertService.getLocationBasedAlerts({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        state: locationInfo?.state,
        district: locationInfo?.name
      });
      
      setLocationAlerts(locationBasedAlerts.slice(0, 4));
    } catch (error) {
      console.error('Failed to load location alerts:', error);
    }
  };

  const refreshDashboard = async () => {
    toast.info('Refreshing dashboard...');
    setAlertsLoading(true);
    
    try {
      await Promise.all([
        loadAlerts(),
        location ? loadLocationAlerts(location) : Promise.resolve(),
        alertService.refreshAllAlerts()
      ]);
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setAlertsLoading(false);
    }
  };

  const enableLocationTracking = async () => {
    try {
      const granted = await weatherService.requestLocationPermission();
      if (granted) {
        weatherService.startLocationTracking();
        toast.success('Location tracking enabled');
      } else {
        toast.error('Location access denied. Please enable in browser settings.');
      }
    } catch (error) {
      toast.error('Failed to enable location tracking');
    }
  };

  const toggleAlertExpansion = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'border-l-red-500 bg-red-50';
      case 'severe': return 'border-l-orange-500 bg-orange-50';
      case 'moderate': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-600 text-white';
      case 'severe': return 'bg-orange-600 text-white';
      case 'moderate': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderMergedAlertBadge = (alert: EmergencyAlert) => {
    if (!alert.isMerged) return null;
    
    return (
      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
        <Merge className="w-3 h-3 mr-1" />
        {alert.mergedCount} Merged
      </Badge>
    );
  };

  const renderAlertCard = (alert: EmergencyAlert, isCompact: boolean = false) => {
    const isExpanded = expandedAlerts.has(alert.id);
    
    if (isCompact) {
      // Compact view for recent alerts
      return (
        <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
            alert.severity === 'extreme' ? 'bg-red-500' :
            alert.severity === 'severe' ? 'bg-orange-500' :
            alert.severity === 'moderate' ? 'bg-yellow-500' : 'bg-blue-500'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-medium line-clamp-2">{alert.title}</h5>
                  {renderMergedAlertBadge(alert)}
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
              
              {alert.isMerged && alert.mergedSummary && (
                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Bot className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-800">AI Summary</span>
                  </div>
                  <p className="text-xs text-purple-700 line-clamp-2">{alert.mergedSummary}</p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>{alert.source}</span>
                <span>{alert.timeAgo || formatTimeAgo(alert.lastUpdated)}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {alert.location.affectedAreas[0]}
                </span>
                {alert.officialId && (
                  <span className="font-mono">{alert.officialId}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Full view for location alerts
    return (
      <Alert key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h5 className="font-medium">{alert.title}</h5>
                {renderMergedAlertBadge(alert)}
              </div>
              <div className="flex items-start gap-2 shrink-0">
                <Badge className={`${getSeverityBadgeColor(alert.severity)} text-xs`}>
                  {alert.severity.toUpperCase()}
                </Badge>
                {alert.isMerged && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAlertExpansion(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>
            
            {alert.isMerged && alert.mergedSummary && (
              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                <div className="flex items-center gap-1 mb-1">
                  <Bot className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-800">AI Summary</span>
                </div>
                <p className="text-xs text-purple-700">{alert.mergedSummary}</p>
              </div>
            )}
            
            <p className="text-sm">{alert.description}</p>
            
            {/* Merged Alert Details */}
            {alert.isMerged && isExpanded && alert.originalAlerts && (
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-800">Original Alerts ({alert.mergedCount})</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {alert.originalAlerts.map((originalAlert, idx) => (
                    <div key={idx} className="bg-white p-2 rounded text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-purple-900 line-clamp-1">{originalAlert.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {originalAlert.severity}
                        </Badge>
                      </div>
                      <p className="text-purple-700 line-clamp-1">{originalAlert.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {alert.location.affectedAreas.join(', ')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Valid until {alert.validUntil.toLocaleDateString()}
              </span>
              <span>{alert.source}</span>
              {alert.isMerged && (
                <span className="text-purple-600 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  AI Merged
                </span>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const QuickActionCard = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick, 
    variant = "default" 
  }: {
    icon: any;
    title: string;
    description: string;
    onClick: () => void;
    variant?: "default" | "emergency";
  }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        variant === "emergency" ? "border-red-200 hover:border-red-300" : "hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            variant === "emergency" ? "bg-red-100" : "bg-blue-100"
          }`}>
            <Icon className={`w-5 h-5 ${
              variant === "emergency" ? "text-red-600" : "text-blue-600"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{title}</h4>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-none mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Disaster Management Command Center with AI-Merged Alerts
            </p>
            {location && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Navigation className="w-4 h-4 mr-1" />
                <span>
                  {weatherService.getLocationAccuracy()} • 
                  Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
              
              {/* Alert Statistics Badge */}
              {alertStats.mergedAlerts > 0 && (
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  <Merge className="w-3 h-3 mr-1" />
                  {alertStats.mergedAlerts} AI Merged
                </Badge>
              )}
              
              {!location && (
                <Button variant="outline" size="sm" onClick={enableLocationTracking}>
                  <Target className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Enable GPS</span>
                </Button>
              )}
            </div>
            
            <Button variant="outline" size="sm" onClick={refreshDashboard} disabled={loading || alertsLoading}>
              <RefreshCw className={`w-4 h-4 ${(loading || alertsLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Mobile-first: Stack all sections vertically */}
        <div className="space-y-6">
          {/* Key Stats - Responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Incidents</p>
                    <p className="text-xl font-bold">{stats.activeIncidents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Volunteers</p>
                    <p className="text-xl font-bold">{stats.volunteersActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Donations Today</p>
                    <p className="text-xl font-bold">₹{(stats.donationsToday / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resources Deployed</p>
                    <p className="text-xl font-bold">{stats.resourcesDeployed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location-Based Alerts */}
          {locationAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <span>AI-Merged Alerts for Your Area</span>
                  {location && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      GPS Active
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {locationAlerts.map((alert) => renderAlertCard(alert))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weather Center - Full Width */}
          <WeatherTracker />

          {/* Quick Actions - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <QuickActionCard
              icon={AlertTriangle}
              title="Report Emergency"
              description="Report incidents and emergencies"
              onClick={() => onNavigate('report')}
              variant="emergency"
            />
            
            <QuickActionCard
              icon={MapPin}
              title="Live Situation Map"
              description="View real-time incident mapping"
              onClick={() => onNavigate('live-map')}
            />
            
            <QuickActionCard
              icon={Users}
              title="Volunteer Management"
              description="Coordinate volunteer activities"
              onClick={() => onNavigate('volunteers')}
            />
            
            <QuickActionCard
              icon={Heart}
              title="Donation Portal"
              description="Manage relief donations"
              onClick={() => onNavigate('donations')}
            />
            
            <QuickActionCard
              icon={Phone}
              title="Emergency Contacts"
              description="Quick access to emergency services"
              onClick={() => window.open('tel:112', '_self')}
              variant="emergency"
            />
            
            <QuickActionCard
              icon={Activity}
              title="System Status"
              description="Monitor system health"
              onClick={() => toast.info(`System status: ${isOnline ? 'All services operational' : 'Limited connectivity'}`)}
            />
          </div>

          {/* Recent Alerts with AI Merging */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span>Recent Emergency Alerts from SACHET NDMA</span>
                    {alertsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOnline ? (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Globe className="w-3 h-3 mr-1" />
                        Live Data
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600 border-gray-200">
                        <Database className="w-3 h-3 mr-1" />
                        Demo Data
                      </Badge>
                    )}
                    
                    {alertStats.mergedAlerts > 0 && (
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        <Bot className="w-3 h-3 mr-1" />
                        {alertStats.mergedAlerts} AI Merged
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {alertStats.totalOriginalAlerts} Total Sources
                    </Badge>
                    
                    <div className="text-xs text-muted-foreground">
                      Updated: {lastUpdateTime.toLocaleTimeString()}
                    </div>
                    <Button variant="outline" size="sm" onClick={refreshDashboard} disabled={alertsLoading}>
                      <RefreshCw className={`w-4 h-4 ${alertsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {alerts.map((alert) => renderAlertCard(alert, true))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contacts Bar */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Emergency Services</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-100"
                    onClick={() => window.open('tel:112', '_self')}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    112
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    onClick={() => window.open('tel:+911126701728', '_self')}
                  >
                    <Building2 className="w-4 h-4 mr-1" />
                    NDMA
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-300 hover:bg-green-100"
                    onClick={() => window.open('tel:+919711077372', '_self')}
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    NDRF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}