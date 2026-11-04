import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Switch } from "./ui/switch";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Eye,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Phone,
  Shield,
  Building2,
  Search,
  Gauge,
  Sunrise,
  Sunset,
  Zap,
  Loader2,
  WifiOff,
  Activity,
  Globe,
  Navigation,
  Thermometer,
  Clock,
  Info,
  ExternalLink,
  Calendar,
  Timer,
  AlertCircle,
  Target,
  Wifi,
  Crosshair,
  Satellite,
  Database,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { weatherService, type WeatherData, type LocationResult, type LocationCoordinates } from "../utils/weather-service";
import { alertService, type EmergencyAlert } from "../utils/alert-service";

export function WeatherTracker() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [useGPS, setUseGPS] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<string>("");
  const [apiMode, setApiMode] = useState<'online' | 'offline'>('online');
  
  // Location search states
  const [searchQuery, setSearchQuery] = useState("New Delhi");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>({
    name: "New Delhi",
    country: "IN",
    state: "Delhi",
    lat: 28.6139,
    lon: 77.2090
  });
  
  // Alert states
  const [locationAlerts, setLocationAlerts] = useState<EmergencyAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [alertServiceStatus, setAlertServiceStatus] = useState({
    isOnline: false,
    lastFetchTime: 0,
    cacheSize: 0,
    hasLocationPermission: false,
    usingFallback: true
  });
  
  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Initialize component
  useEffect(() => {
    initializeServices();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      weatherService.cleanup();
    };
  }, []);

  // Handle location changes
  useEffect(() => {
    if ((useGPS && currentLocation) || (!useGPS && selectedLocation)) {
      loadWeatherData();
      loadLocationAlerts();
    }
  }, [currentLocation, selectedLocation, useGPS]);

  // Auto-refresh weather data and alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadWeatherData();
        loadLocationAlerts();
        updateAlertServiceStatus();
      }
    }, 12 * 60 * 1000); // Every 12 minutes to sync with alert service
    
    return () => clearInterval(interval);
  }, [loading]);

  const initializeServices = async () => {
    try {
      const isOnline = await weatherService.testConnection();
      setApiMode(weatherService.getAPIMode());

      const hasNotificationPermission = alertService.getNotificationPermission() === 'granted';
      setNotificationsEnabled(hasNotificationPermission);

      // Set up location listener for weather service
      const locationUnsubscribe = weatherService.addLocationListener((location) => {
        setCurrentLocation(location);
        if (location) {
          setLocationAccuracy(weatherService.getLocationAccuracy());
          
          // Update alert service with location info
          if (selectedLocation) {
            alertService.updateLocation({
              latitude: location.latitude,
              longitude: location.longitude,
              state: selectedLocation.state,
              district: selectedLocation.name
            });
          }
        }
      });

      // Set up location listener for alert service
      const alertLocationUnsubscribe = alertService.addLocationListener((location) => {
        console.log('Alert service location updated:', location);
      });

      await loadWeatherData();
      await updateAlertServiceStatus();

      if (isOnline) {
        toast.success('Weather services connected • Emergency system active', {
          description: 'Real-time monitoring initialized'
        });
      } else {
        toast.info('Demo mode active • Emergency alerts available', {
          description: 'Using reliable fallback data'
        });
      }

      return () => {
        locationUnsubscribe();
        alertLocationUnsubscribe();
      };
    } catch (error) {
      console.error('Failed to initialize services:', error);
      toast.error('Service initialization failed', {
        description: 'Using emergency fallback systems'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAlertServiceStatus = async () => {
    try {
      const status = alertService.getStatus();
      setAlertServiceStatus(status);
    } catch (error) {
      console.error('Failed to get alert service status:', error);
    }
  };

  const loadWeatherData = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      let lat: number, lon: number, locationName: string;

      if (useGPS && currentLocation) {
        lat = currentLocation.latitude;
        lon = currentLocation.longitude;
        locationName = "Current Location";
        
        const locationInfo = await weatherService.getLocationByCoordinates(lat, lon);
        if (locationInfo) {
          locationName = `${locationInfo.name}${locationInfo.state ? `, ${locationInfo.state}` : ''}, ${locationInfo.country}`;
          
          // Update alert service with reverse geocoded location
          alertService.updateLocation({
            latitude: lat,
            longitude: lon,
            state: locationInfo.state,
            district: locationInfo.name
          });
        }
      } else if (selectedLocation) {
        lat = selectedLocation.lat;
        lon = selectedLocation.lon;
        locationName = `${selectedLocation.name}${selectedLocation.state ? `, ${selectedLocation.state}` : ''}, ${selectedLocation.country}`;
        
        // Update alert service with selected location
        alertService.updateLocation({
          latitude: lat,
          longitude: lon,
          state: selectedLocation.state,
          district: selectedLocation.name
        });
      } else {
        return;
      }

      const data = await weatherService.getComprehensiveWeatherData(lat, lon, locationName);
      setWeatherData(data);
      setApiMode(weatherService.getAPIMode());

    } catch (error) {
      console.error('Weather data loading failed:', error);
      toast.error('Weather data unavailable', {
        description: 'Emergency alerts still active'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLocationAlerts = async () => {
    if (!((useGPS && currentLocation) || (!useGPS && selectedLocation))) return;
    
    setAlertsLoading(true);
    try {
      let lat: number, lon: number, state: string | undefined, district: string | undefined;

      if (useGPS && currentLocation) {
        lat = currentLocation.latitude;
        lon = currentLocation.longitude;
        
        const locationInfo = await weatherService.getLocationByCoordinates(lat, lon);
        state = locationInfo?.state;
        district = locationInfo?.name;
      } else if (selectedLocation) {
        lat = selectedLocation.lat;
        lon = selectedLocation.lon;
        state = selectedLocation.state;
        district = selectedLocation.name;
      } else {
        return;
      }

      // Get location-based alerts from the improved alert service
      const alerts = await alertService.getLocationBasedAlerts({
        latitude: lat,
        longitude: lon,
        state,
        district
      });

      setLocationAlerts(alerts);

    } catch (error) {
      console.error('Failed to load location alerts:', error);
      // Don't show error toast - alerts will show fallback data
    } finally {
      setAlertsLoading(false);
    }
  };

  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await weatherService.searchLocations(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Location search error:', error);
      toast.error('Location search failed');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const selectLocation = (location: LocationResult) => {
    setSelectedLocation(location);
    setSearchQuery(location.name);
    setShowSearchResults(false);
    setUseGPS(false);
    
    // Immediately update alert service
    alertService.updateLocation({
      latitude: location.lat,
      longitude: location.lon,
      state: location.state,
      district: location.name
    });
    
    toast.success(`Location set to ${location.name}`, {
      description: 'Updating weather and alerts...'
    });
  };

  const toggleGPS = async (enabled: boolean) => {
    if (enabled) {
      try {
        const granted = await weatherService.requestLocationPermission();
        if (granted) {
          setUseGPS(true);
          weatherService.startLocationTracking();
          toast.success('GPS tracking enabled', {
            description: 'Real-time location updates active'
          });
        } else {
          toast.error('GPS access denied', {
            description: 'Please enable location permissions'
          });
        }
      } catch (error) {
        console.error('GPS request failed:', error);
        toast.error('GPS activation failed');
      }
    } else {
      setUseGPS(false);
      weatherService.stopLocationTracking();
      setCurrentLocation(null);
      setLocationAccuracy("");
      toast.info('GPS tracking disabled');
    }
  };

  const refreshData = async () => {
    toast.info('Refreshing all systems...', {
      description: 'Weather and emergency data'
    });
    await Promise.all([
      loadWeatherData(), 
      loadLocationAlerts(), 
      alertService.refreshAllAlerts()
    ]);
    await updateAlertServiceStatus();
    toast.success('All systems refreshed');
  };

  const enableNotifications = async () => {
    const granted = await alertService.requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      toast.success('Emergency notifications enabled', {
        description: 'You will receive severe weather alerts'
      });
    } else {
      toast.error('Notification permission denied');
    }
  };

  const testConnection = async () => {
    toast.info('Testing emergency systems...');
    const isConnected = await alertService.testConnection();
    if (isConnected) {
      toast.success('Emergency systems operational', {
        description: 'All alert services functioning'
      });
      await loadLocationAlerts();
    } else {
      toast.warning('Using reliable fallback systems', {
        description: 'Emergency alerts still available'
      });
    }
  };

  const getWeatherIcon = (description: string, iconCode?: string) => {
    if (iconCode && apiMode === 'online') {
      return (
        <img 
          src={weatherService.getWeatherIconUrl(iconCode, '4x')} 
          alt={description}
          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
      );
    }
    
    const desc = description.toLowerCase();
    const iconClass = "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24";
    
    if (desc.includes('clear')) return <Sun className={`${iconClass} text-yellow-500`} />;
    if (desc.includes('rain')) return <CloudRain className={`${iconClass} text-blue-500`} />;
    if (desc.includes('cloud')) return <Cloud className={`${iconClass} text-gray-500`} />;
    if (desc.includes('snow')) return <CloudSnow className={`${iconClass} text-blue-200`} />;
    return <Sun className={`${iconClass} text-yellow-500`} />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'border-l-red-500 bg-red-50 text-red-900';
      case 'severe': return 'border-l-orange-500 bg-orange-50 text-orange-900';
      case 'moderate': return 'border-l-yellow-500 bg-yellow-50 text-yellow-900';
      default: return 'border-l-blue-500 bg-blue-50 text-blue-900';
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

  const getStatusBadge = () => {
    if (apiMode === 'online') {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Wifi className="w-3 h-3 mr-1" />
          Live Weather
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-200">
        <WifiOff className="w-3 h-3 mr-1" />
        Demo Weather
      </Badge>
    );
  };

  const getAlertServiceBadge = () => {
    if (alertServiceStatus.isOnline && alertServiceStatus.cacheSize > 0 && !alertServiceStatus.usingFallback) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Satellite className="w-3 h-3 mr-1" />
          Live NDMA ({alertServiceStatus.cacheSize})
        </Badge>
      );
    } else if (alertServiceStatus.usingFallback) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <Shield className="w-3 h-3 mr-1" />
          Reliable Alerts ({alertServiceStatus.cacheSize})
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600 border-gray-200">
        <Database className="w-3 h-3 mr-1" />
        Emergency System
      </Badge>
    );
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'text-green-600';
    if (uvIndex <= 5) return 'text-yellow-600';
    if (uvIndex <= 7) return 'text-orange-600';
    if (uvIndex <= 10) return 'text-red-600';
    return 'text-purple-600';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    if (aqi <= 200) return 'text-red-600';
    if (aqi <= 300) return 'text-purple-600';
    return 'text-red-800';
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Weather & Emergency Operations Center</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring with reliable emergency alert systems
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge()}
              {getAlertServiceBadge()}
              {alertServiceStatus.hasLocationPermission && (
                <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                  <Crosshair className="w-3 h-3 mr-1" />
                  Location Active
                </Badge>
              )}
              {!notificationsEnabled && (
                <Button variant="outline" size="sm" onClick={enableNotifications}>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Enable Alerts</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={testConnection}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Test System</span>
              </Button>
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Location Controls - Full Width */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex items-center gap-2 min-w-fit">
                  <div className={`w-2 h-2 rounded-full ${
                    useGPS && currentLocation ? 'bg-green-500' :
                    !weatherService.isLocationAvailable() ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm whitespace-nowrap">GPS</span>
                  <Switch
                    checked={useGPS}
                    onCheckedChange={toggleGPS}
                    disabled={loading}
                  />
                </div>

                <div className="flex-1 relative" ref={searchContainerRef}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search cities worldwide..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    disabled={loading || useGPS}
                    className="pl-10"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  
                  {showSearchResults && searchResults.length > 0 && (
                    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto">
                      <CardContent className="p-0">
                        {searchResults.map((location, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                            onClick={() => selectLocation(location)}
                          >
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{location.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {location.state && `${location.state}, `}{location.country}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between xl:justify-end gap-3">
              <div className="flex items-center text-sm text-muted-foreground min-w-0">
                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                <span className="truncate">
                  {weatherData?.location || 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* GPS Status */}
          {useGPS && currentLocation && (
            <Alert className="border-green-200 bg-green-50">
              <Navigation className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>
                    <strong>GPS Active:</strong> {locationAccuracy}
                  </span>
                  <span className="text-xs">
                    Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Alert Service Status */}
          {alertServiceStatus.lastFetchTime > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    <strong>Emergency System:</strong> {alertServiceStatus.cacheSize} alerts available 
                    {alertServiceStatus.usingFallback ? ' (Reliable Demo Mode)' : ' (Live NDMA Feed)'}
                  </span>
                  <span className="text-xs">
                    Last update: {new Date(alertServiceStatus.lastFetchTime).toLocaleString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Weather Content - Responsive Layout */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading weather and emergency data...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Emergency alert system is operational
                </p>
              </div>
            </div>
          ) : weatherData ? (
            <div className="space-y-6">
              {/* Main Weather Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="lg:col-span-1 xl:col-span-2">
                  <div className="flex items-center space-x-4">
                    {getWeatherIcon(weatherData.description, weatherData.icon)}
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-4xl sm:text-5xl lg:text-6xl font-bold">{weatherData.temperature}°C</span>
                        <span className="text-lg sm:text-xl text-muted-foreground">
                          feels {weatherData.feelsLike}°C
                        </span>
                      </div>
                      <p className="text-lg sm:text-xl text-muted-foreground capitalize mt-1">
                        {weatherData.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Updated: {weatherData.lastUpdated.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                  {weatherData.sunrise && (
                    <div className="text-center p-4 border rounded-lg">
                      <Sunrise className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <div className="text-xs text-muted-foreground">Sunrise</div>
                      <div className="font-medium">{weatherData.sunrise}</div>
                    </div>
                  )}
                  {weatherData.sunset && (
                    <div className="text-center p-4 border rounded-lg">
                      <Sunset className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-xs text-muted-foreground">Sunset</div>
                      <div className="font-medium">{weatherData.sunset}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                <div className="p-3 border rounded-lg text-center">
                  <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Humidity</div>
                  <div className="font-medium text-sm">{weatherData.humidity}%</div>
                </div>

                <div className="p-3 border rounded-lg text-center">
                  <Wind className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Wind</div>
                  <div className="font-medium text-sm">{weatherData.windSpeed} km/h</div>
                  <div className="text-xs text-muted-foreground">{getWindDirection(weatherData.windDirection)}</div>
                </div>

                <div className="p-3 border rounded-lg text-center">
                  <Eye className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Visibility</div>
                  <div className="font-bold">{weatherData.visibility} km</div>
                </div>

                <div className="p-3 border rounded-lg text-center">
                  <Gauge className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Pressure</div>
                  <div className="font-bold">{weatherData.pressure} hPa</div>
                </div>

                <div className="p-3 border rounded-lg text-center">
                  <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">UV Index</div>
                  <div className={`font-bold ${getUVIndexColor(weatherData.uvIndex)}`}>
                    {weatherData.uvIndex}
                  </div>
                </div>

                <div className="p-3 border rounded-lg text-center">
                  <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Dew Point</div>
                  <div className="font-bold">{weatherData.dewPoint}°C</div>
                </div>

                <div className="p-3 border rounded-lg text-center">
                  <Cloud className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Cloud Cover</div>
                  <div className="font-bold">{weatherData.cloudCover}%</div>
                </div>

                {weatherData.aqi && (
                  <div className="p-3 border rounded-lg text-center">
                    <Activity className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">Air Quality</div>
                    <div className={`font-bold ${getAQIColor(weatherData.aqi.value)}`}>
                      {weatherData.aqi.value}
                    </div>
                    <div className="text-xs text-muted-foreground">{weatherData.aqi.category}</div>
                  </div>
                )}
              </div>

              {/* Air Quality Details */}
              {weatherData.aqi && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Air Quality Index (US Standard)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">AQI {weatherData.aqi.value}</span>
                        <Badge className={`${getAQIColor(weatherData.aqi.value)} bg-opacity-10 border-current`}>
                          {weatherData.aqi.category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">PM2.5:</span>
                          <span className="ml-1 font-medium">{weatherData.aqi.components.pm2_5} μg/m³</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">PM10:</span>
                          <span className="ml-1 font-medium">{weatherData.aqi.components.pm10} μg/m³</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NO₂:</span>
                          <span className="ml-1 font-medium">{weatherData.aqi.components.no2} μg/m³</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">O₃:</span>
                          <span className="ml-1 font-medium">{weatherData.aqi.components.o3} μg/m³</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Health Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {weatherData.aqi.healthRecommendations.map((recommendation, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Location-Based Emergency Alerts */}
              {locationAlerts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span>Emergency Alerts for {weatherData.location}</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      {alertsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {locationAlerts.length} Active
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Shield className="w-3 h-3 mr-1" />
                        NDMA
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {locationAlerts.slice(0, 6).map((alert) => (
                      <Alert key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-semibold text-base">{alert.title}</h5>
                                  {alert.isFallback && (
                                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                      Demo
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm mt-1 leading-relaxed">{alert.conciseSummary}</p>
                              </div>
                              <div className="flex items-start gap-2 shrink-0">
                                <Badge className={`${getSeverityBadgeColor(alert.severity)} text-xs`}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Alert Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white bg-opacity-50 p-2 rounded">
                              <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                <span className="font-medium">Issued:</span>
                                <span>{alert.timeAgo}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">Valid Until:</span>
                                <span>{alert.validUntil.toLocaleDateString('en-IN', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span className="font-medium">Event:</span>
                                <span className="truncate">{alert.event}</span>
                              </div>
                            </div>

                            {/* CAP-specific information */}
                            {(alert.urgency || alert.certainty) && (
                              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {alert.urgency && (
                                    <div>
                                      <span className="font-medium text-blue-800">Urgency:</span>
                                      <span className="ml-1 text-blue-700">{alert.urgency}</span>
                                    </div>
                                  )}
                                  {alert.certainty && (
                                    <div>
                                      <span className="font-medium text-blue-800">Certainty:</span>
                                      <span className="ml-1 text-blue-700">{alert.certainty}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Instructions */}
                            {alert.instructions.length > 0 && (
                              <div className="bg-white bg-opacity-50 p-3 rounded">
                                <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  Safety Instructions:
                                </h6>
                                <ul className="text-xs space-y-1">
                                  {alert.instructions.slice(0, 3).map((instruction, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-current mt-1.5 shrink-0" />
                                      <span>{instruction}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs opacity-75 pt-2 border-t border-current border-opacity-20">
                              <span>
                                {alert.source} • {alert.officialId}
                              </span>
                              {alert.formattedDate && (
                                <span>{alert.formattedDate}</span>
                              )}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                  
                  {locationAlerts.length > 6 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        View {locationAlerts.length - 6} More Alerts
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Weather data unavailable</p>
              <p className="text-sm mt-1">Emergency alerts remain operational</p>
              <Button onClick={refreshData} className="mt-3">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => window.open('tel:112', '_self')}
            >
              <Phone className="w-4 h-4" />
              <span>Emergency 112</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center space-x-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => window.open('tel:+911126701728', '_self')}
            >
              <Building2 className="w-4 h-4" />
              <span>NDMA Control</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center space-x-2 text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => window.open('tel:+919711077372', '_self')}
            >
              <Shield className="w-4 h-4" />
              <span>NDRF</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}