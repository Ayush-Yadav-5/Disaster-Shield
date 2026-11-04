interface SACHETAlert {
  id: string;
  title: string;
  description: string;
  conciseSummary: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  category: string;
  urgency: string;
  certainty: string;
  areaDesc: string[];
  coordinates?: Array<[number, number]>;
  effective: Date;
  expires: Date;
  sent: Date;
  status: string;
  msgType: string;
  scope: string;
  instruction?: string;
  web?: string;
  contact?: string;
  headline?: string;
  event?: string;
  responseType?: string;
  pubDate: string;
  link: string;
  isProcessed: boolean;
}

class SACHETService {
  private cache = new Map<string, { data: SACHETAlert[]; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
  private readonly UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes rotation
  
  private demoAlerts: SACHETAlert[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    console.log('SACHET Demo Service initialized - Comprehensive emergency alert system');
    this.generateDemoAlerts();
    this.startDemoRotation();
  }

  private generateDemoAlerts(): void {
    const now = new Date();
    const baseTime = now.getTime();
    
    this.demoAlerts = [
      {
        id: `sachet-demo-${baseTime}-1`,
        title: 'Orange Alert: Heavy Rainfall Warning for Western India',
        description: 'India Meteorological Department has issued an orange alert for heavy to very heavy rainfall over Mumbai, Thane, Raigad, and Pune districts of Maharashtra. Rainfall intensity of 12-20 cm expected in next 24-48 hours with thunderstorms and gusty winds.',
        conciseSummary: 'Orange Alert: Heavy rain (12-20cm) in Mumbai, Pune, Thane areas',
        severity: 'severe',
        category: 'weather',
        urgency: 'Expected',
        certainty: 'Likely',
        areaDesc: ['Maharashtra', 'Mumbai', 'Thane', 'Pune'],
        effective: new Date(baseTime - 2 * 60 * 60 * 1000),
        expires: new Date(baseTime + 36 * 60 * 60 * 1000),
        sent: new Date(baseTime - 2 * 60 * 60 * 1000),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        instruction: 'Avoid unnecessary travel during heavy rainfall. Stay away from waterlogged areas.',
        web: 'https://mausam.imd.gov.in/',
        contact: '+91-22-22074141',
        headline: 'Orange Alert: Heavy Rainfall Warning for Western India',
        event: 'Heavy Rainfall',
        responseType: 'Monitor',
        pubDate: new Date(baseTime - 2 * 60 * 60 * 1000).toISOString(),
        link: 'https://sachet.ndma.gov.in/',
        isProcessed: true
      },
      {
        id: `sachet-demo-${baseTime}-2`,
        title: 'Heat Wave Conditions Over North India',
        description: 'Severe heat wave conditions prevailing over Punjab, Haryana, Delhi, and western Uttar Pradesh. Maximum temperatures expected to reach 45-47°C in plains. Hot and dry westerly winds during daytime.',
        conciseSummary: 'Heat wave: 45-47°C in North India, avoid outdoor activities',
        severity: 'moderate',
        category: 'weather',
        urgency: 'Expected',
        certainty: 'Likely',
        areaDesc: ['Punjab', 'Haryana', 'Delhi', 'Uttar Pradesh'],
        effective: new Date(baseTime - 4 * 60 * 60 * 1000),
        expires: new Date(baseTime + 48 * 60 * 60 * 1000),
        sent: new Date(baseTime - 4 * 60 * 60 * 1000),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        instruction: 'Avoid prolonged exposure to sun. Drink plenty of water and use ORS.',
        web: 'https://mausam.imd.gov.in/',
        contact: '+91-11-24631913',
        headline: 'Heat Wave Conditions Over North India',
        event: 'Heat Wave',
        responseType: 'Monitor',
        pubDate: new Date(baseTime - 4 * 60 * 60 * 1000).toISOString(),
        link: 'https://sachet.ndma.gov.in/',
        isProcessed: true
      },
      {
        id: `sachet-demo-${baseTime}-3`,
        title: 'Thunderstorm Warning for Eastern States',
        description: 'Thunderstorm with lightning and gusty winds (30-40 kmph) very likely over West Bengal, Odisha, Jharkhand and Bihar. Hail storm possible at isolated places.',
        conciseSummary: 'Thunderstorm with 30-40 kmph winds in Eastern India',
        severity: 'moderate',
        category: 'weather',
        urgency: 'Expected',
        certainty: 'Likely',
        areaDesc: ['West Bengal', 'Odisha', 'Jharkhand', 'Bihar'],
        effective: new Date(baseTime - 6 * 60 * 60 * 1000),
        expires: new Date(baseTime + 24 * 60 * 60 * 1000),
        sent: new Date(baseTime - 6 * 60 * 60 * 1000),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        instruction: 'Stay indoors during thunderstorms. Avoid standing under trees.',
        web: 'https://mausam.imd.gov.in/',
        contact: '+91-33-22871211',
        headline: 'Thunderstorm Warning for Eastern States',
        event: 'Thunderstorm',
        responseType: 'Monitor',
        pubDate: new Date(baseTime - 6 * 60 * 60 * 1000).toISOString(),
        link: 'https://sachet.ndma.gov.in/',
        isProcessed: true
      },
      {
        id: `sachet-demo-${baseTime}-4`,
        title: 'Cyclone Formation Alert: Bay of Bengal',
        description: 'Low pressure area over southeast Bay of Bengal likely to intensify into depression during next 24 hours. May further develop into cyclonic storm.',
        conciseSummary: 'Cyclone Watch: Low pressure in Bay of Bengal, coastal areas alert',
        severity: 'severe',
        category: 'weather',
        urgency: 'Future',
        certainty: 'Possible',
        areaDesc: ['Odisha', 'West Bengal', 'Andhra Pradesh'],
        effective: new Date(baseTime - 8 * 60 * 60 * 1000),
        expires: new Date(baseTime + 72 * 60 * 60 * 1000),
        sent: new Date(baseTime - 8 * 60 * 60 * 1000),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        instruction: 'Coastal communities monitor updates. Fishermen avoid deep sea areas.',
        web: 'https://mausam.imd.gov.in/',
        contact: '+91-674-2534177',
        headline: 'Cyclone Formation Alert: Bay of Bengal',
        event: 'Cyclone Watch',
        responseType: 'Monitor',
        pubDate: new Date(baseTime - 8 * 60 * 60 * 1000).toISOString(),
        link: 'https://sachet.ndma.gov.in/',
        isProcessed: true
      },
      {
        id: `sachet-demo-${baseTime}-5`,
        title: 'Flood Alert: River Water Levels Rising',
        description: 'Heavy rainfall in catchment areas causing rise in river water levels. Low-lying areas along Ganga, Yamuna, and Brahmaputra at risk of flooding.',
        conciseSummary: 'Flood Alert: Rising river levels, low areas at risk',
        severity: 'severe',
        category: 'flood',
        urgency: 'Immediate',
        certainty: 'Observed',
        areaDesc: ['Uttar Pradesh', 'Bihar', 'Assam', 'West Bengal'],
        effective: new Date(baseTime - 3 * 60 * 60 * 1000),
        expires: new Date(baseTime + 48 * 60 * 60 * 1000),
        sent: new Date(baseTime - 3 * 60 * 60 * 1000),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        instruction: 'Move to higher ground. Avoid wading through flood water.',
        web: 'https://cwc.gov.in/',
        contact: '+91-11-26192709',
        headline: 'Flood Alert: River Water Levels Rising',
        event: 'Flood',
        responseType: 'Evacuate',
        pubDate: new Date(baseTime - 3 * 60 * 60 * 1000).toISOString(),
        link: 'https://sachet.ndma.gov.in/',
        isProcessed: true
      }
    ];

    // Cache the demo alerts
    this.setCachedData(this.demoAlerts);
    console.log(`Generated ${this.demoAlerts.length} comprehensive demo SACHET alerts`);
  }

  private startDemoRotation(): void {
    // Rotate demo alerts every 10 minutes to simulate real updates
    this.intervalId = setInterval(() => {
      this.rotateDemoAlerts();
    }, this.UPDATE_INTERVAL);
  }

  private rotateDemoAlerts(): void {
    console.log('Rotating demo SACHET alerts for realistic updates...');
    
    // Update timestamps to make alerts feel current
    this.demoAlerts.forEach(alert => {
      if (Math.random() > 0.7) { // 30% chance to update
        const newTime = Date.now() - Math.random() * 4 * 60 * 60 * 1000; // Within last 4 hours
        alert.sent = new Date(newTime);
        alert.effective = new Date(newTime);
        alert.pubDate = new Date(newTime).toISOString();
      }
    });

    // Cache updated alerts
    this.setCachedData(this.demoAlerts);
  }

  private getCacheKey(): string {
    return 'demo-sachet-alerts';
  }

  private getCachedData(): SACHETAlert[] | null {
    const cached = this.cache.get(this.getCacheKey());
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(data: SACHETAlert[]): void {
    this.cache.set(this.getCacheKey(), {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Main method to get SACHET alerts - Demo data only (no network calls)
   */
  async fetchSACHETAlerts(): Promise<SACHETAlert[]> {
    // Check cache first
    const cached = this.getCachedData();
    if (cached) {
      console.log('Returning cached SACHET demo alerts');
      return cached;
    }

    // Return demo alerts (no network calls)
    console.log('Returning fresh SACHET demo alerts');
    return this.demoAlerts;
  }

  /**
   * Get location-based alerts for weather panel
   */
  getLocationBasedAlerts(alerts: SACHETAlert[], latitude: number, longitude: number, state?: string, district?: string): SACHETAlert[] {
    return alerts.filter(alert => {
      const areaDesc = alert.areaDesc.map(area => area.toLowerCase());
      
      // Check state match
      if (state && areaDesc.some(area => area.includes(state.toLowerCase()))) {
        return true;
      }
      
      // Check district match
      if (district && areaDesc.some(area => area.includes(district.toLowerCase()))) {
        return true;
      }
      
      // Check for national alerts
      if (areaDesc.some(area => 
        area.includes('india') || area.includes('national') || area.includes('entire')
      )) {
        return true;
      }
      
      return false;
    });
  }

  formatAlertTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes > 0 ? `${diffMinutes}m ago` : 'Just now';
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',  
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStatus(): { isCached: boolean; lastUpdate: number | null; size: number; sources: number } {
    const cached = this.cache.get(this.getCacheKey());
    
    return {
      isCached: !!cached,
      lastUpdate: cached?.timestamp || null,
      size: cached?.data.length || 0,
      sources: 1 // Demo source
    };
  }

  cleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.cache.clear();
  }
}

export const sachetService = new SACHETService();
export type { SACHETAlert };