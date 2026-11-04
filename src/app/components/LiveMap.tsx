import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter,
  AlertTriangle,
  Heart,
  Users,
  Building,
  RefreshCw,
  Layers,
  Info,
  Phone,
  Shield,
  Zap,
  Waves,
  Mountain,
  CloudRain,
  Flame,
  Wind,
  Snowflake,
  Maximize2,
  Minimize2,
  X
} from "lucide-react";
import { toast } from "sonner";

// Using visual representation instead of Google Maps (no API required)

interface CrisisMarker {
  id: string;
  type: 'flood' | 'earthquake' | 'cyclone' | 'fire' | 'landslide' | 'tsunami' | 'heatwave' | 'relief_center' | 'volunteer' | 'hospital';
  position: [number, number]; // [latitude, longitude]
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'monitoring';
  severity?: 'low' | 'medium' | 'high' | 'extreme';
  capacity?: number;
  contact?: string;
  affectedArea?: number;
  casualties?: number;
  lastUpdate?: string;
  city?: string;
  state?: string;
}

const CRISIS_TYPES = [
  { value: 'all', label: 'All Crisis Types', icon: AlertTriangle },
  { value: 'flood', label: 'Floods', icon: Waves },
  { value: 'earthquake', label: 'Earthquakes', icon: Mountain },
  { value: 'cyclone', label: 'Cyclones', icon: Wind },
  { value: 'fire', label: 'Wildfires', icon: Flame },
  { value: 'landslide', label: 'Landslides', icon: Mountain },
  { value: 'tsunami', label: 'Tsunamis', icon: Waves },
  { value: 'heatwave', label: 'Heat Waves', icon: Zap },
  { value: 'relief_center', label: 'Relief Centers', icon: Building },
  { value: 'volunteer', label: 'Volunteers', icon: Users },
  { value: 'hospital', label: 'Hospitals', icon: Heart }
];

// Mock crisis data with real India coordinates
const MOCK_CRISIS_DATA: CrisisMarker[] = [
  {
    id: '1',
    type: 'flood',
    position: [25.5941, 85.1376],
    title: 'Severe Flooding in Patna',
    description: 'Heavy monsoon rains causing severe flooding in multiple districts',
    status: 'active',
    severity: 'extreme',
    affectedArea: 250,
    casualties: 12,
    lastUpdate: '2 hours ago',
    city: 'Patna',
    state: 'Bihar'
  },
  {
    id: '2',
    type: 'earthquake',
    position: [30.7333, 78.7667],
    title: 'Earthquake in Himalayan Region',
    description: 'Moderate earthquake detected, aftershocks expected',
    status: 'monitoring',
    severity: 'high',
    affectedArea: 100,
    lastUpdate: '5 hours ago',
    city: 'Uttarkashi',
    state: 'Uttarakhand'
  },
  {
    id: '3',
    type: 'cyclone',
    position: [17.6868, 83.2185],
    title: 'Cyclone Warning - East Coast',
    description: 'Tropical cyclone approaching coastal areas',
    status: 'active',
    severity: 'extreme',
    affectedArea: 500,
    lastUpdate: '1 hour ago',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh'
  },
  {
    id: '4',
    type: 'relief_center',
    position: [13.0827, 80.2707],
    title: 'Relief Center - Anna Nagar',
    description: 'Emergency shelter and supplies available',
    status: 'active',
    capacity: 500,
    contact: '+91-44-12345678',
    lastUpdate: '30 mins ago',
    city: 'Chennai',
    state: 'Tamil Nadu'
  },
  {
    id: '5',
    type: 'fire',
    position: [12.9716, 77.5946],
    title: 'Wildfire in Outskirts',
    description: 'Forest fire spreading near residential areas',
    status: 'active',
    severity: 'high',
    affectedArea: 75,
    lastUpdate: '3 hours ago',
    city: 'Bangalore',
    state: 'Karnataka'
  },
  {
    id: '6',
    type: 'hospital',
    position: [19.0760, 72.8777],
    title: 'Emergency Medical Center',
    description: '24/7 emergency services available',
    status: 'active',
    capacity: 200,
    contact: '+91-22-87654321',
    lastUpdate: '1 hour ago',
    city: 'Mumbai',
    state: 'Maharashtra'
  },
  {
    id: '7',
    type: 'volunteer',
    position: [28.6139, 77.2090],
    title: 'Volunteer Hub - Central Delhi',
    description: '150+ volunteers ready for deployment',
    status: 'active',
    capacity: 150,
    lastUpdate: '45 mins ago',
    city: 'Delhi',
    state: 'Delhi'
  },
  {
    id: '8',
    type: 'landslide',
    position: [31.1048, 77.1734],
    title: 'Landslide Alert',
    description: 'Multiple landslides blocking highways',
    status: 'active',
    severity: 'medium',
    affectedArea: 30,
    lastUpdate: '6 hours ago',
    city: 'Shimla',
    state: 'Himachal Pradesh'
  },
  {
    id: '9',
    type: 'heatwave',
    position: [26.9124, 75.7873],
    title: 'Extreme Heat Warning',
    description: 'Temperatures exceeding 45°C',
    status: 'monitoring',
    severity: 'high',
    affectedArea: 200,
    lastUpdate: '4 hours ago',
    city: 'Jaipur',
    state: 'Rajasthan'
  },
  {
    id: '10',
    type: 'flood',
    position: [22.5726, 88.3639],
    title: 'Waterlogging in Kolkata',
    description: 'Heavy rainfall causing urban flooding',
    status: 'active',
    severity: 'medium',
    affectedArea: 120,
    lastUpdate: '2 hours ago',
    city: 'Kolkata',
    state: 'West Bengal'
  }
];

export function LiveMap() {
  const [mapData, setMapData] = useState<CrisisMarker[]>(MOCK_CRISIS_DATA);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<CrisisMarker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const fetchCrisisData = () => {
    setLoading(true);
    setTimeout(() => {
      setMapData([...MOCK_CRISIS_DATA]);
      setLoading(false);
      toast.success('Crisis data refreshed');
    }, 1000);
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(location);
          toast.success('Location detected successfully');
        },
        () => {
          // Silently fail - use default India center
          console.log('Geolocation not available');
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const getTypeIcon = (type: string) => {
    const typeObj = CRISIS_TYPES.find(t => t.value === type);
    const Icon = typeObj ? typeObj.icon : AlertTriangle;
    return Icon;
  };

  const getMarkerColor = (marker: CrisisMarker) => {
    if (marker.severity) {
      switch (marker.severity) {
        case 'extreme': return '#dc2626';
        case 'high': return '#ea580c';
        case 'medium': return '#f59e0b';
        case 'low': return '#22c55e';
      }
    }
    
    switch (marker.type) {
      case 'flood': return '#3b82f6';
      case 'earthquake': return '#a855f7';
      case 'cyclone': return '#06b6d4';
      case 'fire': return '#ef4444';
      case 'relief_center': return '#10b981';
      case 'hospital': return '#ec4899';
      case 'volunteer': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const filteredData = mapData.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = searchQuery === '' || 
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleMarkerClick = (marker: CrisisMarker) => {
    setSelectedMarker(marker);
  };

  // Convert lat/lng to x/y percentage for visual map
  const latLngToXY = (lat: number, lng: number) => {
    // India bounds: lat 8-37, lng 68-97
    const x = ((lng - 68) / (97 - 68)) * 100;
    const y = ((37 - lat) / (37 - 8)) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-foreground mb-2">
              <MapPin className="w-6 h-6 text-red-600" />
              Live Crisis Map
            </h1>
            <p className="text-muted-foreground">Real-time visualization of incidents across India</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchCrisisData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={getCurrentLocation}
            >
              <Navigation className="w-4 h-4 mr-2" />
              My Location
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search city/state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRISIS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visual Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-blue-50 to-green-50">
                  
                  {/* India Map Outline */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Crisis Markers */}
                    {filteredData.map((marker) => {
                      const { x, y } = latLngToXY(marker.position[0], marker.position[1]);
                      const Icon = getTypeIcon(marker.type);
                      const isHovered = hoveredMarker === marker.id;
                      const isSelected = selectedMarker?.id === marker.id;
                      
                      return (
                        <button
                          key={marker.id}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                            isHovered || isSelected ? 'scale-125 z-20' : 'scale-100 z-10'
                          }`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                          onClick={() => handleMarkerClick(marker)}
                          onMouseEnter={() => setHoveredMarker(marker.id)}
                          onMouseLeave={() => setHoveredMarker(null)}
                          title={marker.title}
                        >
                          {/* Pulsing ring for active incidents */}
                          {marker.status === 'active' && (
                            <div 
                              className="absolute inset-0 rounded-full animate-ping opacity-75"
                              style={{
                                backgroundColor: getMarkerColor(marker),
                                width: '32px',
                                height: '32px',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                          )}
                          
                          {/* Marker dot */}
                          <div
                            className="relative w-8 h-8 rounded-full shadow-lg flex items-center justify-center border-2 border-white"
                            style={{ backgroundColor: getMarkerColor(marker) }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          
                          {/* Tooltip */}
                          {(isHovered || isSelected) && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] border">
                              <p className="font-semibold text-sm">{marker.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{marker.city}, {marker.state}</p>
                              {marker.severity && (
                                <Badge 
                                  className="text-xs mt-2"
                                  style={{ backgroundColor: getMarkerColor(marker) }}
                                >
                                  {marker.severity}
                                </Badge>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {/* User Location */}
                    {userLocation && (() => {
                      const { x, y } = latLngToXY(userLocation[0], userLocation[1]);
                      return (
                        <div
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-semibold mb-2">Legend</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span>Extreme Severity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                        <span>High Severity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span>Medium Severity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span>Your Location</span>
                      </div>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-sm font-medium">
                    {filteredData.length} incident{filteredData.length !== 1 ? 's' : ''} shown
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Crisis List & Details */}
          <div className="space-y-4">
            {selectedMarker ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">Incident Details</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setSelectedMarker(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = getTypeIcon(selectedMarker.type);
                        return <Icon className="w-5 h-5" style={{ color: getMarkerColor(selectedMarker) }} />;
                      })()}
                      <h3>{selectedMarker.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedMarker.description}</p>
                  </div>

                  <div className="space-y-2">
                    {selectedMarker.severity && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Severity:</span>
                        <Badge 
                          className="capitalize"
                          style={{ backgroundColor: getMarkerColor(selectedMarker) }}
                        >
                          {selectedMarker.severity}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="secondary" className="capitalize">
                        {selectedMarker.status}
                      </Badge>
                    </div>

                    {selectedMarker.affectedArea && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Affected Area:</span>
                        <span>{selectedMarker.affectedArea} km²</span>
                      </div>
                    )}

                    {selectedMarker.capacity && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span>{selectedMarker.capacity} people</span>
                      </div>
                    )}

                    {selectedMarker.casualties !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Casualties:</span>
                        <span className="text-red-600">{selectedMarker.casualties}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Update:</span>
                      <span>{selectedMarker.lastUpdate}</span>
                    </div>

                    {selectedMarker.contact && (
                      <div className="pt-3 border-t">
                        <Button className="w-full" size="sm" onClick={() => window.open(`tel:${selectedMarker.contact}`, '_self')}>
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedMarker.contact}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredData.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No incidents found
                      </p>
                    ) : (
                      filteredData.map((marker) => {
                        const Icon = getTypeIcon(marker.type);
                        return (
                          <button
                            key={marker.id}
                            className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                            onClick={() => handleMarkerClick(marker)}
                            onMouseEnter={() => setHoveredMarker(marker.id)}
                            onMouseLeave={() => setHoveredMarker(null)}
                          >
                            <div className="flex items-start gap-2">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: getMarkerColor(marker) + '20' }}
                              >
                                <Icon className="w-4 h-4" style={{ color: getMarkerColor(marker) }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{marker.title}</p>
                                <p className="text-xs text-muted-foreground">{marker.city}, {marker.state}</p>
                                <p className="text-xs text-muted-foreground">{marker.lastUpdate}</p>
                              </div>
                              {marker.severity && (
                                <Badge 
                                  className="text-xs flex-shrink-0"
                                  style={{ backgroundColor: getMarkerColor(marker) }}
                                >
                                  {marker.severity}
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Emergency Contact Banner */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 rounded-full">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Emergency Helpline</p>
                  <p className="text-sm text-red-700">24/7 Support Available</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:ml-auto">
                <Badge variant="destructive" className="text-sm px-3 py-1">112 - Emergency</Badge>
                <Badge variant="outline" className="text-sm px-3 py-1 bg-white">+91-9711077372 - NDRF</Badge>
                <Badge variant="outline" className="text-sm px-3 py-1 bg-white">+91-11-26701728 - Control Room</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
