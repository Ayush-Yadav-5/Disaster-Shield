import { ndmaCAPService, type CAPAlert, type LocationInfo, type ProcessedAlerts } from './ndma-cap-service';

interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  conciseSummary: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  category: 'weather' | 'flood' | 'earthquake' | 'fire' | 'health' | 'security' | 'general' | 'cyclone' | 'drought' | 'landslide' | 'tsunami' | 'heatwave' | 'coldwave';
  source: string;
  sourceUrl: string;
  location: {
    state?: string;
    district?: string;
    coordinates?: [number, number];
    affectedAreas: string[];
  };
  validFrom: Date;
  validUntil: Date;
  instructions: string[];
  contacts: {
    emergency: string;
    local?: string;
  };
  isActive: boolean;
  priority: number;
  languages: string[];
  lastUpdated: Date;
  alertType?: 'advisory' | 'warning' | 'watch' | 'emergency';
  officialId?: string;
  timeAgo?: string;
  formattedDate?: string;
  isLiveData: boolean;
  
  // CAP-specific fields
  urgency?: string;
  certainty?: string;
  event?: string;
  responseType?: string;
  isDemoSystem?: boolean;
}

interface LocationContext {
  latitude: number;
  longitude: number;
  state?: string;
  district?: string;
  city?: string;
}

interface AlertSummary {
  event: string;
  count: number;
  severity: string;
  areas: string[];
  conciseSummary: string;
  lastUpdated: Date;
  alerts: EmergencyAlert[];
}

class AlertService {
  private notificationPermission: NotificationPermission = 'default';
  private notificationShownAlerts = new Set<string>();
  private currentLocation: LocationInfo | null = null;
  private locationUpdateCallbacks: ((location: LocationInfo | null) => void)[] = [];

  constructor() {
    this.initializeNotifications();
    this.initializeLocationTracking();
    console.log('Emergency Alert Service initialized - Comprehensive demo system active');
  }

  private async initializeNotifications(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  private initializeLocationTracking(): void {
    // Listen for location updates from weather service or other sources
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: LocationInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.updateLocation(newLocation);
        },
        (error) => {
          console.log('GPS location not available, using manual location selection');
        },
        {
          enableHighAccuracy: false,
          maximumAge: 600000, // 10 minutes
          timeout: 15000
        }
      );
    }
  }

  /**
   * Update current location and notify NDMA service
   */
  updateLocation(location: LocationInfo): void {
    this.currentLocation = location;
    ndmaCAPService.setLocation(location);
    
    // Notify callbacks
    this.locationUpdateCallbacks.forEach(callback => {
      callback(location);
    });
    
    console.log('Location updated in emergency alert service:', location);
  }

  /**
   * Add location update listener
   */
  addLocationListener(callback: (location: LocationInfo | null) => void): () => void {
    this.locationUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.locationUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Convert CAP alert to Emergency alert format
   */
  private convertCAPToEmergencyAlert(capAlert: CAPAlert): EmergencyAlert {
    const isDemoSystem = capAlert.sender.includes('Demo') || capAlert.sender.includes('Emergency Demo System');
    const sourceText = isDemoSystem ? 'NDMA Emergency Demo System' : 'NDMA SACHET';
    
    return {
      id: capAlert.id,
      title: capAlert.headline,
      description: capAlert.description,
      conciseSummary: capAlert.conciseSummary,
      severity: this.mapCAPSeverity(capAlert.severity),
      category: this.mapCAPCategory(capAlert.category, capAlert.event),
      source: sourceText,
      sourceUrl: capAlert.web || 'https://sachet.ndma.gov.in/',
      location: {
        coordinates: capAlert.coordinates?.[0],
        affectedAreas: [capAlert.areaDesc, ...capAlert.affectedStates].filter(Boolean)
      },
      validFrom: capAlert.sent,
      validUntil: capAlert.expires || new Date(capAlert.sent.getTime() + 48 * 60 * 60 * 1000),
      instructions: capAlert.instruction ? [capAlert.instruction] : [
        'Follow local authority instructions',
        'Monitor official updates regularly',
        'Keep emergency supplies ready'
      ],
      contacts: {
        emergency: '112',
        local: capAlert.contact || '+91-11-26701728'
      },
      isActive: capAlert.isActive,
      priority: this.calculatePriority(capAlert.severity),
      languages: ['English', 'Hindi'],
      lastUpdated: capAlert.sent,
      alertType: this.mapCAPMsgType(capAlert.msgType),
      officialId: capAlert.identifier,
      timeAgo: capAlert.timeAgo,
      formattedDate: capAlert.formattedDate,
      isLiveData: true, // Demo system is the live system for this implementation
      
      // CAP-specific
      urgency: capAlert.urgency,
      certainty: capAlert.certainty,
      event: capAlert.event,
      responseType: capAlert.responseType,
      isDemoSystem: isDemoSystem
    };
  }

  private mapCAPSeverity(severity: CAPAlert['severity']): 'minor' | 'moderate' | 'severe' | 'extreme' {
    switch (severity) {
      case 'Extreme': return 'extreme';
      case 'Severe': return 'severe';
      case 'Moderate': return 'moderate';
      case 'Minor': return 'minor';
      default: return 'moderate';
    }
  }

  private mapCAPCategory(category: CAPAlert['category'], event: string): EmergencyAlert['category'] {
    const eventLower = event.toLowerCase();
    
    if (eventLower.includes('cyclone')) return 'cyclone';
    if (eventLower.includes('flood')) return 'flood';
    if (eventLower.includes('earthquake')) return 'earthquake';
    if (eventLower.includes('heat')) return 'heatwave';
    if (eventLower.includes('cold')) return 'coldwave';
    if (eventLower.includes('drought')) return 'drought';
    if (eventLower.includes('landslide')) return 'landslide';
    if (eventLower.includes('tsunami')) return 'tsunami';
    if (eventLower.includes('fire')) return 'fire';
    
    switch (category) {
      case 'Geo': return eventLower.includes('earthquake') ? 'earthquake' : 'landslide';
      case 'Met': return 'weather';
      case 'Fire': return 'fire';
      case 'Health': return 'health';
      case 'Security': return 'security';
      default: return 'weather';
    }
  }

  private mapCAPMsgType(msgType: CAPAlert['msgType']): 'advisory' | 'warning' | 'watch' | 'emergency' {
    switch (msgType) {
      case 'Alert': return 'warning';
      case 'Update': return 'warning';
      case 'Cancel': return 'advisory';
      default: return 'warning';
    }
  }

  private calculatePriority(severity: CAPAlert['severity']): number {
    switch (severity) {
      case 'Extreme': return 5;
      case 'Severe': return 4;
      case 'Moderate': return 3;
      case 'Minor': return 2;
      default: return 1;
    }
  }

  private showNotification(alert: EmergencyAlert): void {
    // Only show notifications for severe and extreme alerts to avoid spam
    if (alert.severity !== 'severe' && alert.severity !== 'extreme') return;
    if (this.notificationPermission !== 'granted') return;
    if (this.notificationShownAlerts.has(alert.id)) return;

    const notificationTitle = `🚨 ${alert.event || alert.title}${alert.isDemoSystem ? ' (Demo)' : ''}`;
    const notificationBody = `${alert.conciseSummary}\n📍 ${alert.location.affectedAreas.join(', ')}\n⏰ ${alert.timeAgo}`;

    const notification = new Notification(notificationTitle, {
      body: notificationBody,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: alert.id,
      requireInteraction: alert.severity === 'extreme',
      data: { 
        alertId: alert.id, 
        severity: alert.severity, 
        event: alert.event,
        urgency: alert.urgency,
        isDemoSystem: alert.isDemoSystem
      }
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    this.notificationShownAlerts.add(alert.id);

    // Auto-close non-extreme notifications
    if (alert.severity !== 'extreme') {
      setTimeout(() => notification.close(), 30000);
    }
  }

  /**
   * Get all alerts for the current location
   */
  async getAllAlerts(): Promise<EmergencyAlert[]> {
    try {
      const allCAPAlerts = await ndmaCAPService.getAllAlerts();
      const convertedAlerts = allCAPAlerts.map(alert => this.convertCAPToEmergencyAlert(alert));
      
      // Sort by priority and time
      return convertedAlerts.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      });
      
    } catch (error) {
      console.error('Failed to fetch all alerts:', error);
      return [];
    }
  }

  /**
   * Get location-based alerts (for weather panel)
   */
  async getLocationBasedAlerts(location?: LocationContext): Promise<EmergencyAlert[]> {
    try {
      const targetLocation: LocationInfo = location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        state: location.state,
        district: location.district
      } : this.currentLocation || { latitude: 28.6139, longitude: 77.2090 }; // Default to Delhi
      
      const processedAlerts = await ndmaCAPService.getAlertsForLocation(targetLocation);
      const convertedAlerts = processedAlerts.alertsForLocation.map(alert => 
        this.convertCAPToEmergencyAlert(alert)
      );
      
      // Show notifications for severe alerts (only for demo system notifications if enabled)
      convertedAlerts
        .filter(alert => (alert.severity === 'severe' || alert.severity === 'extreme') && 
                !this.notificationShownAlerts.has(alert.id))
        .forEach(alert => this.showNotification(alert));
      
      return convertedAlerts;
      
    } catch (error) {
      console.error('Failed to fetch location-based alerts:', error);
      return [];
    }
  }

  /**
   * Get deduplicated alerts for the top panel
   */
  async getDedupedAlerts(location?: LocationContext): Promise<AlertSummary[]> {
    try {
      const targetLocation: LocationInfo = location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        state: location.state,
        district: location.district
      } : this.currentLocation || { latitude: 28.6139, longitude: 77.2090 };
      
      const processedAlerts = await ndmaCAPService.getAlertsForLocation(targetLocation);
      
      return processedAlerts.dedupedAlerts.map(deduped => ({
        event: deduped.event,
        count: deduped.count,
        severity: deduped.severity,
        areas: deduped.areas,
        conciseSummary: deduped.conciseSummary,
        lastUpdated: deduped.lastUpdated,
        alerts: deduped.alerts.map(alert => this.convertCAPToEmergencyAlert(alert))
      }));
      
    } catch (error) {
      console.error('Failed to fetch deduplicated alerts:', error);
      return [];
    }
  }

  /**
   * Get alerts by category
   */
  async getAlertsByCategory(category: string): Promise<EmergencyAlert[]> {
    const allAlerts = await this.getAllAlerts();
    return allAlerts.filter(alert => alert.category === category);
  }

  /**
   * Refresh all alerts
   */
  async refreshAllAlerts(): Promise<void> {
    try {
      await ndmaCAPService.refreshAlerts();
      this.notificationShownAlerts.clear();
      console.log('Emergency alert system refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      this.notificationPermission = await Notification.requestPermission();
      return this.notificationPermission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Get notification permission status
   */
  getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  /**
   * Get service status
   */
  getStatus(): {
    isOnline: boolean;
    lastFetchTime: number;
    cacheSize: number;
    currentLocation: LocationInfo | null;
    hasLocationPermission: boolean;
    consecutiveFailures: number;
    usingFallback: boolean;
  } {
    const ndmaStatus = ndmaCAPService.getStatus();
    
    return {
      isOnline: ndmaStatus.isOnline,
      lastFetchTime: ndmaStatus.lastFetchTime,
      cacheSize: ndmaStatus.cacheSize,
      currentLocation: ndmaStatus.currentLocation,
      hasLocationPermission: this.currentLocation !== null,
      consecutiveFailures: 0, // Demo system doesn't have failures
      usingFallback: false // This IS the main system
    };
  }

  /**
   * Get merged alert statistics
   */
  getMergedAlertStats(alerts: EmergencyAlert[]): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    active: number;
    resolved: number;
  } {
    const stats = {
      total: alerts.length,
      bySeverity: {
        extreme: 0,
        severe: 0,
        moderate: 0,
        minor: 0
      } as Record<string, number>,
      byCategory: {
        flood: 0,
        earthquake: 0,
        cyclone: 0,
        weather: 0,
        fire: 0,
        health: 0,
        security: 0,
        landslide: 0,
        tsunami: 0
      } as Record<string, number>,
      active: 0,
      resolved: 0
    };

    alerts.forEach(alert => {
      // Count by severity
      if (alert.severity) {
        stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      }

      // Count by category
      if (alert.category) {
        stats.byCategory[alert.category] = (stats.byCategory[alert.category] || 0) + 1;
      }

      // Count active vs resolved
      if (alert.status === 'resolved') {
        stats.resolved++;
      } else {
        stats.active++;
      }
    });

    return stats;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const alerts = await ndmaCAPService.getAllAlerts();
      return alerts.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current location
   */
  getCurrentLocation(): LocationInfo | null {
    return this.currentLocation;
  }

  /**
   * Set manual location (for location selection)
   */
  setManualLocation(state: string, district?: string, coordinates?: [number, number]): void {
    const location: LocationInfo = {
      latitude: coordinates?.[0] || 28.6139,
      longitude: coordinates?.[1] || 77.2090,
      state,
      district
    };
    
    this.updateLocation(location);
  }

  /**
   * Clear cache and reset
   */
  clearCache(): void {
    this.notificationShownAlerts.clear();
    // NDMA service handles its own cache clearing
  }

  /**
   * Get last update time
   */
  getLastUpdateTime(): Date {
    const status = ndmaCAPService.getStatus();
    return new Date(status.lastFetchTime);
  }

  /**
   * Check if service is online
   */
  isOnlineMode(): boolean {
    return ndmaCAPService.getStatus().isOnline;
  }

  /**
   * Get system type for UI display
   */
  getSystemType(): 'demo' | 'live' {
    return 'demo'; // This comprehensive demo system
  }
}

// Create singleton instance
export const alertService = new AlertService();
export type { EmergencyAlert, LocationContext, AlertSummary };