import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3f6e5e28`;

export interface Incident {
  id: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'Active' | 'Monitoring' | 'Resolved';
  reportedBy: string;
  reportedAt: string;
  resources: number;
  radius: number;
  images?: string[];
}

export interface Volunteer {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  status: 'Active' | 'En Route' | 'Available' | 'Off Duty';
  specialty: string;
  contact?: string;
  certification?: string;
  lastUpdate: string;
}

export interface ReliefCenter {
  id: string;
  name: string;
  capacity: number;
  current: number;
  location: string;
  coordinates: { lat: number; lng: number };
  resources: string[];
  status: 'Active' | 'Full' | 'Closed';
  contact: string;
  lastUpdate: string;
}

export interface EmergencyReport {
  id?: string;
  type: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  reportedBy?: string;
  reportedAt?: string;
  status?: string;
  images?: string[];
  contacts?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export interface SystemStats {
  activeIncidents: number;
  totalIncidents: number;
  activeVolunteers: number;
  totalVolunteers: number;
  reliefCenters: number;
  totalResources: number;
  recentReports: number;
  totalReports: number;
  systemStatus: string;
  lastUpdate: string;
}

class EmergencyService {
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
  };

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`API Error (${response.status}):`, error);
      throw new Error(`API request failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Initialize sample data
  async initializeSampleData(): Promise<{ success: boolean; message: string }> {
    return this.request('/init-sample-data', {
      method: 'POST',
    });
  }

  // Incidents
  async getIncidents(): Promise<{ incidents: Incident[] }> {
    return this.request('/incidents');
  }

  async createIncident(incident: Omit<Incident, 'id' | 'reportedAt' | 'status'>): Promise<{ success: boolean; incident: Incident }> {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<{ success: boolean; incident: Incident }> {
    return this.request(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Volunteers
  async getVolunteers(): Promise<{ volunteers: Volunteer[] }> {
    return this.request('/volunteers');
  }

  async updateVolunteer(id: string, updates: Partial<Volunteer>): Promise<{ success: boolean; volunteer: Volunteer }> {
    return this.request(`/volunteers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Relief Centers
  async getReliefCenters(): Promise<{ reliefCenters: ReliefCenter[] }> {
    return this.request('/relief-centers');
  }

  async updateReliefCenter(id: string, updates: Partial<ReliefCenter>): Promise<{ success: boolean; reliefCenter: ReliefCenter }> {
    return this.request(`/relief-centers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Reports
  async submitReport(report: EmergencyReport): Promise<{ success: boolean; report: EmergencyReport; autoIncidentCreated: boolean }> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  // File upload
  async uploadFile(file: File, type: 'incident' | 'report' = 'incident'): Promise<{ success: boolean; fileName: string; url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Upload Error (${response.status}):`, error);
      throw new Error(`Upload failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Statistics
  async getStats(): Promise<{ stats: SystemStats }> {
    return this.request('/stats');
  }

  // Real-time data polling
  startPolling(callback: (data: { incidents: Incident[]; volunteers: Volunteer[]; reliefCenters: ReliefCenter[]; stats: SystemStats }) => void, interval: number = 10000) {
    const poll = async () => {
      try {
        const [incidentsResponse, volunteersResponse, reliefCentersResponse, statsResponse] = await Promise.all([
          this.getIncidents(),
          this.getVolunteers(),
          this.getReliefCenters(),
          this.getStats(),
        ]);

        callback({
          incidents: incidentsResponse.incidents,
          volunteers: volunteersResponse.volunteers,
          reliefCenters: reliefCentersResponse.reliefCenters,
          stats: statsResponse.stats,
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial fetch
    poll();

    // Set up polling interval
    const intervalId = setInterval(poll, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // Get current user location
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to NYC coordinates
          resolve({ lat: 40.7589, lng: -73.9851 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Find nearest relief center
  async findNearestReliefCenter(userLocation: { lat: number; lng: number }): Promise<ReliefCenter | null> {
    try {
      const { reliefCenters } = await this.getReliefCenters();
      
      let nearest: ReliefCenter | null = null;
      let minDistance = Infinity;

      for (const center of reliefCenters) {
        if (center.status !== 'Active' || center.current >= center.capacity) continue;

        const distance = this.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          center.coordinates.lat,
          center.coordinates.lng
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearest = center;
        }
      }

      return nearest;
    } catch (error) {
      console.error('Error finding nearest relief center:', error);
      return null;
    }
  }

  // Emergency quick actions
  async reportQuickEmergency(type: string, description: string): Promise<{ success: boolean; report: EmergencyReport; incident?: Incident }> {
    try {
      const location = await this.getCurrentLocation();
      
      const report: EmergencyReport = {
        type,
        description,
        location: 'Current Location',
        coordinates: location,
        priority: 'Critical',
        reportedBy: 'Mobile User',
      };

      const result = await this.submitReport(report);
      
      if (result.autoIncidentCreated) {
        // Fetch the newly created incident
        const { incidents } = await this.getIncidents();
        const newIncident = incidents.find(i => i.reportedAt === result.report.reportedAt);
        return { ...result, incident: newIncident };
      }

      return result;
    } catch (error) {
      console.error('Error reporting quick emergency:', error);
      throw error;
    }
  }
}

export const emergencyService = new EmergencyService();