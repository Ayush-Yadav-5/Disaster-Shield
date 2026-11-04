interface CAPAlert {
  id: string;
  identifier: string;
  sender: string;
  sent: Date;
  status: 'Actual' | 'Exercise' | 'System' | 'Test' | 'Draft';
  msgType: 'Alert' | 'Update' | 'Cancel' | 'Ack' | 'Error';
  scope: 'Public' | 'Restricted' | 'Private';
  
  // Info block
  event: string;
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  certainty: 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown';
  
  headline: string;
  description: string;
  instruction: string;
  
  // Area information
  areaDesc: string;
  polygon?: string;
  circle?: string;
  geocode?: { [key: string]: string };
  
  // Dates
  onset?: Date;
  expires?: Date;
  
  // Additional metadata
  category: 'Geo' | 'Met' | 'Safety' | 'Security' | 'Rescue' | 'Fire' | 'Health' | 'Env' | 'Transport' | 'Infra' | 'CBRNE' | 'Other';
  responseType?: string;
  web?: string;
  contact?: string;
  
  // Processing metadata
  isActive: boolean;
  affectedStates: string[];
  affectedDistricts: string[];
  coordinates?: [number, number][];
  
  // UI helpers
  conciseSummary: string;
  timeAgo: string;
  formattedDate: string;
}

interface LocationInfo {
  latitude: number;
  longitude: number;
  state?: string;
  district?: string;
  city?: string;
}

interface ProcessedAlerts {
  alertsForLocation: CAPAlert[];
  dedupedAlerts: {
    event: string;
    count: number;
    severity: string;
    areas: string[];
    alerts: CAPAlert[];
    conciseSummary: string;
    lastUpdated: Date;
  }[];
}

class NDMACAPService {
  private readonly UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes - for rotating demo alerts
  
  private cache = new Map<string, { data: CAPAlert[]; timestamp: number }>();
  private locationCache = new Map<string, ProcessedAlerts>();
  private currentLocation: LocationInfo | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private lastUpdateTime = Date.now();
  private demoAlerts: CAPAlert[] = [];
  
  // Indian states and their common districts for location matching
  private readonly INDIAN_STATES = {
    'andhra pradesh': ['visakhapatnam', 'vijayawada', 'guntur', 'nellore', 'tirupati'],
    'arunachal pradesh': ['itanagar', 'naharlagun', 'pasighat', 'tezpur'],
    'assam': ['guwahati', 'dibrugarh', 'jorhat', 'silchar', 'tezpur'],
    'bihar': ['patna', 'gaya', 'muzaffarpur', 'bhagalpur', 'purnia'],
    'chhattisgarh': ['raipur', 'bilaspur', 'korba', 'rajnandgaon'],
    'goa': ['panaji', 'margao', 'vasco da gama', 'mapusa'],
    'gujarat': ['ahmedabad', 'surat', 'vadodara', 'rajkot', 'gandhinagar'],
    'haryana': ['gurugram', 'faridabad', 'panipat', 'ambala', 'karnal'],
    'himachal pradesh': ['shimla', 'dharamshala', 'manali', 'kullu', 'mandi'],
    'jharkhand': ['ranchi', 'jamshedpur', 'dhanbad', 'bokaro', 'deoghar'],
    'karnataka': ['bengaluru', 'mysuru', 'hubli', 'mangaluru', 'belgaum'],
    'kerala': ['thiruvananthapuram', 'kochi', 'kozhikode', 'thrissur', 'kollam'],
    'madhya pradesh': ['bhopal', 'indore', 'gwalior', 'jabalpur', 'ujjain'],
    'maharashtra': ['mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad'],
    'manipur': ['imphal', 'thoubal', 'churachandpur'],
    'meghalaya': ['shillong', 'tura', 'jowai'],
    'mizoram': ['aizawl', 'lunglei', 'champhai'],
    'nagaland': ['kohima', 'dimapur', 'mokokchung'],
    'odisha': ['bhubaneswar', 'cuttack', 'berhampur', 'rourkela'],
    'punjab': ['chandigarh', 'ludhiana', 'amritsar', 'jalandhar', 'patiala'],
    'rajasthan': ['jaipur', 'jodhpur', 'udaipur', 'kota', 'ajmer'],
    'sikkim': ['gangtok', 'namchi', 'gyalshing'],
    'tamil nadu': ['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem'],
    'telangana': ['hyderabad', 'warangal', 'nizamabad', 'karimnagar'],
    'tripura': ['agartala', 'udaipur', 'dharmanagar'],
    'uttar pradesh': ['lucknow', 'kanpur', 'agra', 'varanasi', 'meerut'],
    'uttarakhand': ['dehradun', 'haridwar', 'roorkee', 'haldwani'],
    'west bengal': ['kolkata', 'asansol', 'durgapur', 'siliguri', 'howrah'],
    'delhi': ['new delhi', 'delhi', 'dwarka', 'rohini'],
    'jammu and kashmir': ['srinagar', 'jammu', 'anantnag', 'baramulla'],
    'ladakh': ['leh', 'kargil']
  };

  // Demo alert templates for dynamic generation
  private readonly ALERT_TEMPLATES = [
    {
      type: 'Heavy Rainfall',
      severity: 'Severe',
      urgency: 'Expected',
      certainty: 'Likely',
      category: 'Met' as const,
      regions: ['Maharashtra', 'Gujarat', 'Goa'],
      districts: ['Mumbai', 'Thane', 'Pune', 'Surat', 'Panaji'],
      description: 'Heavy to very heavy rainfall expected with thunderstorms and gusty winds. Waterlogging likely in low-lying areas.',
      instruction: 'Avoid unnecessary travel during heavy rainfall periods. Stay away from waterlogged areas and do not venture into the sea.'
    },
    {
      type: 'Heat Wave',
      severity: 'Moderate',
      urgency: 'Expected',
      certainty: 'Likely',
      category: 'Met' as const,
      regions: ['Punjab', 'Haryana', 'Delhi', 'Rajasthan'],
      districts: ['Ludhiana', 'Gurugram', 'New Delhi', 'Jaipur'],
      description: 'Severe heat wave conditions with temperatures reaching 45-48°C. Hot and dry westerly winds expected.',
      instruction: 'Avoid prolonged exposure to sun. Drink plenty of water and use ORS. Wear light colored cotton clothes.'
    },
    {
      type: 'Thunderstorm',
      severity: 'Moderate',
      urgency: 'Expected',
      certainty: 'Likely',
      category: 'Met' as const,
      regions: ['West Bengal', 'Odisha', 'Jharkhand', 'Bihar'],
      districts: ['Kolkata', 'Bhubaneswar', 'Ranchi', 'Patna'],
      description: 'Thunderstorm with lightning and gusty winds (30-40 kmph). Hail storm possible at isolated places.',
      instruction: 'Stay indoors during thunderstorms. Avoid standing under trees or near electrical equipment.'
    },
    {
      type: 'Cyclone Watch',
      severity: 'Severe',
      urgency: 'Future',
      certainty: 'Possible',
      category: 'Met' as const,
      regions: ['Odisha', 'West Bengal', 'Andhra Pradesh'],
      districts: ['Puri', 'South 24 Parganas', 'Visakhapatnam'],
      description: 'Low pressure area over Bay of Bengal likely to intensify into cyclonic storm.',
      instruction: 'Coastal communities monitor weather updates. Fishermen advised not to venture into deep sea.'
    },
    {
      type: 'Cold Wave',
      severity: 'Minor',
      urgency: 'Expected',
      certainty: 'Likely',
      category: 'Met' as const,
      regions: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Himachal Pradesh'],
      districts: ['Chandigarh', 'Faridabad', 'Meerut', 'Shimla'],
      description: 'Cold wave conditions with temperatures 2-5°C below normal. Dense fog affecting visibility.',
      instruction: 'Take precautions against cold weather. Wear warm clothes and avoid prolonged exposure.'
    },
    {
      type: 'Flood Alert',
      severity: 'Severe',
      urgency: 'Immediate',
      certainty: 'Observed',
      category: 'Met' as const,
      regions: ['Assam', 'Bihar', 'Uttar Pradesh'],
      districts: ['Guwahati', 'Patna', 'Varanasi'],
      description: 'River water levels rising due to continuous rainfall. Low-lying areas at risk of flooding.',
      instruction: 'Move to higher ground immediately. Avoid wading through flood water. Keep emergency supplies ready.'
    },
    {
      type: 'Dust Storm',
      severity: 'Moderate',
      urgency: 'Expected',
      certainty: 'Likely',
      category: 'Met' as const,
      regions: ['Rajasthan', 'Punjab', 'Haryana'],
      districts: ['Jaipur', 'Ludhiana', 'Gurugram'],
      description: 'Dust storm with gusty winds (40-50 kmph) likely. Visibility may be reduced to 500-1000 meters.',
      instruction: 'Avoid outdoor activities. Cover nose and mouth when going outside. Drive carefully with headlights on.'
    }
  ];

  constructor() {
    console.log('NDMA CAP Demo Service initialized - Comprehensive emergency alert system');
    this.generateRotatingDemoAlerts();
    this.startDemoRotation();
  }

  /**
   * Generate comprehensive, rotating demo alerts
   */
  private generateRotatingDemoAlerts(): void {
    const now = new Date();
    const baseTime = now.getTime();
    
    this.demoAlerts = [];
    
    // Generate alerts with varied timing and severity
    this.ALERT_TEMPLATES.forEach((template, index) => {
      const alertTime = baseTime - (index * 2 + Math.random() * 4) * 60 * 60 * 1000; // 2-6 hours ago
      const alertDate = new Date(alertTime);
      
      // Add some randomness to make alerts feel more dynamic
      const isActive = Math.random() > 0.1; // 90% chance alert is active
      const expiresInHours = template.severity === 'Severe' ? 48 : template.severity === 'Moderate' ? 36 : 24;
      
      const alert: CAPAlert = {
        id: `ndma-demo-${now.getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        identifier: `NDMA-DEMO-${now.getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        sender: 'NDMA India (Emergency Demo System)',
        sent: alertDate,
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        
        event: template.type,
        urgency: template.urgency,
        severity: template.severity,
        certainty: template.certainty,
        
        headline: `${template.severity} Alert: ${template.type} Warning for ${template.regions.join(', ')}`,
        description: `${template.description} Affected areas include ${template.districts.join(', ')} and surrounding regions. This is part of the comprehensive emergency alert monitoring system.`,
        instruction: `${template.instruction} Monitor official updates regularly. Keep emergency kit ready with water, food, medicines, and important documents.`,
        
        areaDesc: template.regions.length === 1 ? template.regions[0] : `${template.regions.slice(0, -1).join(', ')} and ${template.regions[template.regions.length - 1]}`,
        
        expires: new Date(alertTime + expiresInHours * 60 * 60 * 1000),
        
        category: template.category,
        responseType: template.severity === 'Severe' ? 'Evacuate' : 'Monitor',
        web: 'https://sachet.ndma.gov.in/',
        contact: index % 2 === 0 ? '+91-11-26701728' : '+91-9711077372',
        
        isActive: isActive && new Date(alertTime + expiresInHours * 60 * 60 * 1000) > now,
        affectedStates: template.regions,
        affectedDistricts: template.districts,
        
        geocode: this.createGeocodeForRegions(template.regions, template.districts),
        
        conciseSummary: this.createConciseSummary(template),
        timeAgo: this.formatTimeAgo(alertDate),
        formattedDate: this.formatDateTime(alertDate)
      };
      
      if (alert.isActive) {
        this.demoAlerts.push(alert);
      }
    });
    
    // Add a few additional dynamic alerts based on season/time
    const currentMonth = now.getMonth();
    
    // Summer alerts (April-June)
    if (currentMonth >= 3 && currentMonth <= 5) {
      this.addSeasonalAlert('Summer', now);
    }
    
    // Monsoon alerts (July-September)
    if (currentMonth >= 6 && currentMonth <= 8) {
      this.addSeasonalAlert('Monsoon', now);
    }
    
    // Winter alerts (December-February)
    if (currentMonth >= 11 || currentMonth <= 1) {
      this.addSeasonalAlert('Winter', now);
    }
    
    // Sort by severity and time
    this.demoAlerts.sort((a, b) => {
      const severityOrder = { 'Extreme': 4, 'Severe': 3, 'Moderate': 2, 'Minor': 1, 'Unknown': 0 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.sent.getTime() - a.sent.getTime();
    });
    
    console.log(`Generated ${this.demoAlerts.length} comprehensive demo alerts for emergency system`);
  }

  private addSeasonalAlert(season: string, now: Date): void {
    const seasonalAlerts = {
      'Summer': {
        type: 'Heat Wave Advisory',
        severity: 'Moderate' as const,
        regions: ['Delhi', 'Uttar Pradesh', 'Bihar'],
        districts: ['New Delhi', 'Agra', 'Patna'],
        description: 'Seasonal heat wave conditions expected with temperatures above 42°C.'
      },
      'Monsoon': {
        type: 'Heavy Monsoon Rain',
        severity: 'Severe' as const,
        regions: ['Kerala', 'Karnataka', 'Maharashtra'],
        districts: ['Kochi', 'Bengaluru', 'Mumbai'],
        description: 'Active monsoon conditions with heavy to very heavy rainfall expected.'
      },
      'Winter': {
        type: 'Dense Fog',
        severity: 'Minor' as const,
        regions: ['Punjab', 'Delhi', 'Uttar Pradesh'],
        districts: ['Ludhiana', 'New Delhi', 'Lucknow'],
        description: 'Dense fog conditions reducing visibility to less than 200 meters.'
      }
    };
    
    const template = seasonalAlerts[season as keyof typeof seasonalAlerts];
    if (template) {
      const alertTime = now.getTime() - (Math.random() * 3) * 60 * 60 * 1000;
      
      const alert: CAPAlert = {
        id: `ndma-seasonal-${season.toLowerCase()}-${now.getTime()}`,
        identifier: `NDMA-SEASONAL-${season.toUpperCase()}-001`,
        sender: 'NDMA India (Seasonal Monitoring)',
        sent: new Date(alertTime),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        
        event: template.type,
        urgency: 'Expected',
        severity: template.severity,
        certainty: 'Likely',
        
        headline: `${season} Alert: ${template.type} - ${template.regions.join(', ')}`,
        description: template.description,
        instruction: 'Follow seasonal safety guidelines and monitor weather updates.',
        
        areaDesc: template.regions.join(', '),
        expires: new Date(alertTime + 36 * 60 * 60 * 1000),
        
        category: 'Met',
        responseType: 'Monitor',
        web: 'https://mausam.imd.gov.in/',
        contact: '+91-11-24631913',
        
        isActive: true,
        affectedStates: template.regions,
        affectedDistricts: template.districts,
        
        geocode: this.createGeocodeForRegions(template.regions, template.districts),
        
        conciseSummary: `${season} ${template.type}: ${template.regions.join(', ')}`,
        timeAgo: this.formatTimeAgo(new Date(alertTime)),
        formattedDate: this.formatDateTime(new Date(alertTime))
      };
      
      this.demoAlerts.push(alert);
    }
  }

  private createGeocodeForRegions(regions: string[], districts: string[]): { [key: string]: string } {
    const geocode: { [key: string]: string } = {};
    
    regions.forEach(region => {
      geocode[`STATE_${region.toUpperCase().replace(/\s+/g, '_')}`] = region;
    });
    
    districts.forEach(district => {
      geocode[`DISTRICT_${district.toUpperCase().replace(/\s+/g, '_')}`] = district;
    });
    
    return geocode;
  }

  private createConciseSummary(template: any): string {
    const severityText = template.severity === 'Severe' ? 'Severe' : template.severity === 'Moderate' ? 'Moderate' : 'Minor';
    return `${severityText} ${template.type}: ${template.regions.slice(0, 2).join(', ')}${template.regions.length > 2 ? ' +others' : ''}`;
  }

  /**
   * Start demo alert rotation to simulate real-time updates
   */
  private startDemoRotation(): void {
    // Cache initial alerts
    this.setCachedAlerts(this.demoAlerts);
    
    // Rotate/update demo alerts every 15 minutes
    this.intervalId = setInterval(() => {
      this.refreshDemoAlerts();
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Refresh demo alerts with new timestamps and variations
   */
  private refreshDemoAlerts(): void {
    console.log('Refreshing demo alerts for realistic updates...');
    
    // Update timestamps to make alerts feel current
    this.demoAlerts.forEach(alert => {
      // Randomly update some alert timestamps
      if (Math.random() > 0.7) {
        const newTime = Date.now() - Math.random() * 4 * 60 * 60 * 1000; // Within last 4 hours
        alert.sent = new Date(newTime);
        alert.timeAgo = this.formatTimeAgo(alert.sent);
        alert.formattedDate = this.formatDateTime(alert.sent);
      }
    });
    
    // Occasionally add new alerts or remove expired ones
    if (Math.random() > 0.8) {
      this.generateRotatingDemoAlerts();
    }
    
    this.setCachedAlerts(this.demoAlerts);
    this.locationCache.clear(); // Force location cache refresh
    this.lastUpdateTime = Date.now();
  }

  /**
   * Utility functions
   */
  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes > 0 ? `${diffMinutes}m ago` : 'Just now';
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Set cached alerts
   */
  private setCachedAlerts(alerts: CAPAlert[]): void {
    this.cache.set('demo-alerts', {
      data: alerts,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached alerts
   */
  private getCachedAlerts(): CAPAlert[] {
    const cached = this.cache.get('demo-alerts');
    if (cached) {
      return cached.data;
    }
    return this.demoAlerts;
  }

  /**
   * Filter alerts based on location
   */
  private filterAlertsByLocation(alerts: CAPAlert[], location: LocationInfo): CAPAlert[] {
    return alerts.filter(alert => {
      // Check if user's state/district matches alert
      if (location.state) {
        const userState = location.state.toLowerCase();
        if (alert.affectedStates.some(state => state.toLowerCase().includes(userState))) {
          return true;
        }
      }
      
      if (location.district) {
        const userDistrict = location.district.toLowerCase();
        if (alert.affectedDistricts.some(district => district.toLowerCase().includes(userDistrict))) {
          return true;
        }
      }
      
      // Check for national alerts
      if (alert.affectedStates.length === 0 || 
          alert.areaDesc.toLowerCase().includes('india') ||
          alert.areaDesc.toLowerCase().includes('national')) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Deduplicate alerts by event type
   */
  private deduplicateAlerts(alerts: CAPAlert[]): ProcessedAlerts['dedupedAlerts'] {
    const eventGroups = new Map<string, CAPAlert[]>();
    
    // Group by event type
    alerts.forEach(alert => {
      const eventKey = alert.event.toLowerCase();
      if (!eventGroups.has(eventKey)) {
        eventGroups.set(eventKey, []);
      }
      eventGroups.get(eventKey)!.push(alert);
    });
    
    // Create deduplicated entries
    const dedupedAlerts = Array.from(eventGroups.entries()).map(([event, eventAlerts]) => {
      // Sort by severity and time
      eventAlerts.sort((a, b) => {
        const severityOrder = { 'Extreme': 4, 'Severe': 3, 'Moderate': 2, 'Minor': 1, 'Unknown': 0 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return b.sent.getTime() - a.sent.getTime();
      });
      
      const mostSevere = eventAlerts[0];
      const allAreas = Array.from(new Set(eventAlerts.flatMap(alert => alert.affectedStates)));
      const conciseSummary = eventAlerts.length === 1 
        ? mostSevere.conciseSummary
        : `${mostSevere.event} affecting ${eventAlerts.length} regions`;
      
      return {
        event: this.capitalizeWords(event),
        count: eventAlerts.length,
        severity: mostSevere.severity,
        areas: allAreas.slice(0, 3),
        alerts: eventAlerts,
        conciseSummary,
        lastUpdated: mostSevere.sent
      };
    });
    
    // Sort by severity and count
    return dedupedAlerts.sort((a, b) => {
      const severityOrder = { 'Extreme': 4, 'Severe': 3, 'Moderate': 2, 'Minor': 1, 'Unknown': 0 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.count - a.count;
    });
  }

  /**
   * PUBLIC API METHODS
   */

  /**
   * Set current user location
   */
  setLocation(location: LocationInfo): void {
    this.currentLocation = location;
    this.locationCache.clear();
    console.log('Location updated for emergency alerts:', location);
  }

  /**
   * Get processed alerts for current location
   */
  async getAlertsForLocation(location?: LocationInfo): Promise<ProcessedAlerts> {
    const targetLocation = location || this.currentLocation;
    
    if (!targetLocation) {
      // Return all demo alerts if no location
      const dedupedAlerts = this.deduplicateAlerts(this.demoAlerts);
      
      return { 
        alertsForLocation: this.demoAlerts, 
        dedupedAlerts 
      };
    }
    
    // Check location cache
    const locationKey = `${targetLocation.latitude.toFixed(2)}-${targetLocation.longitude.toFixed(2)}`;
    const cached = this.locationCache.get(locationKey);
    if (cached) {
      return cached;
    }
    
    // Get current alerts
    const alerts = this.getCachedAlerts();
    
    // Filter by location
    const alertsForLocation = this.filterAlertsByLocation(alerts, targetLocation)
      .sort((a, b) => b.sent.getTime() - a.sent.getTime());
    
    // Deduplicate for concise panel
    const dedupedAlerts = this.deduplicateAlerts(alertsForLocation);
    
    const result: ProcessedAlerts = {
      alertsForLocation,
      dedupedAlerts
    };
    
    // Cache result
    this.locationCache.set(locationKey, result);
    
    return result;
  }

  /**
   * Get all alerts (no location filtering)
   */
  async getAllAlerts(): Promise<CAPAlert[]> {
    const alerts = this.getCachedAlerts();
    return alerts.sort((a, b) => b.sent.getTime() - a.sent.getTime());
  }

  /**
   * Force refresh alerts
   */
  async refreshAlerts(): Promise<void> {
    this.cache.clear();
    this.locationCache.clear();
    this.refreshDemoAlerts();
    console.log('Emergency alert system refreshed');
  }

  /**
   * Get service status
   */
  getStatus(): {
    isOnline: boolean;
    lastFetchTime: number;
    cacheSize: number;
    currentLocation: LocationInfo | null;
    consecutiveFailures: number;
    usingFallback: boolean;
  } {
    const alerts = this.getCachedAlerts();
    
    return {
      isOnline: true, // Demo system is always "online"
      lastFetchTime: this.lastUpdateTime,
      cacheSize: alerts.length,
      currentLocation: this.currentLocation,
      consecutiveFailures: 0,
      usingFallback: false // This IS the system, not a fallback
    };
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.cache.clear();
    this.locationCache.clear();
  }
}

// Create singleton instance
export const ndmaCAPService = new NDMACAPService();
export type { CAPAlert, LocationInfo, ProcessedAlerts };