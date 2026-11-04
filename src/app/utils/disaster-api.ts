import { useState, useEffect, useCallback } from 'react';

// Demo data for the disaster management system
const DEMO_INCIDENTS = [
  {
    id: "inc-001",
    type: "Flood",
    severity: "Critical" as const,
    location: "Mumbai, Maharashtra",
    coordinates: { lat: 19.0760, lng: 72.8777 },
    description: "Heavy rainfall causing severe flooding in low-lying areas. Water levels rising rapidly.",
    status: "Active" as const,
    reportedBy: "NDMA Emergency Response",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resources: 25,
    radius: 15
  },
  {
    id: "inc-002", 
    type: "Heat Wave",
    severity: "High" as const,
    location: "Delhi, NCR",
    coordinates: { lat: 28.6139, lng: 77.2090 },
    description: "Extreme temperatures (47°C) recorded. Heat stroke cases reported in multiple hospitals.",
    status: "Monitoring" as const,
    reportedBy: "IMD Weather Station",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resources: 12,
    radius: 25
  },
  {
    id: "inc-003",
    type: "Cyclone",
    severity: "Critical" as const,
    location: "Visakhapatnam, Andhra Pradesh",
    coordinates: { lat: 17.6868, lng: 83.2185 },
    description: "Cyclone approaching coast with wind speeds of 120 kmph. Evacuation in progress.",
    status: "Active" as const,
    reportedBy: "Coast Guard Station",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    resources: 45,
    radius: 50
  }
];

const DEMO_VOLUNTEERS = [
  {
    id: "vol-001",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91-9876543210",
    specialty: "Medical Response",
    coordinates: { lat: 19.0760, lng: 72.8777 },
    status: "Active" as const,
    currentTask: {
      title: "Medical Aid - Flood Relief",
      description: "Providing medical assistance at emergency shelter",
      priority: "High"
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: "vol-002",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com", 
    phone: "+91-9876543211",
    specialty: "Search & Rescue",
    coordinates: { lat: 28.6139, lng: 77.2090 },
    status: "Available" as const,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "vol-003",
    name: "Anita Reddy",
    email: "anita.reddy@email.com",
    phone: "+91-9876543212", 
    specialty: "Logistics Support",
    coordinates: { lat: 17.6868, lng: 83.2185 },
    status: "En Route" as const,
    currentTask: {
      title: "Supply Distribution",
      description: "Distributing relief supplies to affected areas",
      priority: "Medium"
    },
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
];

const DEMO_RELIEF_CENTERS = [
  {
    id: "rc-001",
    name: "Mumbai Emergency Shelter",
    capacity: 500,
    current: 342,
    location: "Bandra, Mumbai",
    coordinates: { lat: 19.0596, lng: 72.8295 },
    resources: ["Food", "Water", "Medical Aid", "Blankets"],
    status: "Active",
    contact: "+91-22-26420000",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: "rc-002", 
    name: "Delhi Heat Relief Center",
    capacity: 300,
    current: 89,
    location: "Connaught Place, Delhi",
    coordinates: { lat: 28.6304, lng: 77.2177 },
    resources: ["Cooling Facilities", "Water", "Medical Aid", "ORS"],
    status: "Active",
    contact: "+91-11-23320000",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: "rc-003",
    name: "Visakhapatnam Cyclone Shelter", 
    capacity: 800,
    current: 654,
    location: "MVP Colony, Visakhapatnam",
    coordinates: { lat: 17.7231, lng: 83.3011 },
    resources: ["Food", "Water", "Medical Aid", "Emergency Supplies"],
    status: "Full",
    contact: "+91-891-2500000",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

const DEMO_ALERTS = [
  {
    id: "alert-001",
    type: "Weather", 
    title: "Heavy Rainfall Alert",
    message: "Orange alert issued for Mumbai and surrounding areas. Expect 100-200mm rainfall in next 24 hours.",
    severity: "High",
    area: "Mumbai, Thane, Raigad",
    coordinates: { lat: 19.0760, lng: 72.8777 },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    active: true
  },
  {
    id: "alert-002",
    type: "Health",
    title: "Heat Wave Warning", 
    message: "Extreme heat conditions. Temperature may reach 47°C. Avoid outdoor activities during 11 AM - 4 PM.",
    severity: "Critical",
    area: "Delhi, Haryana, Punjab",
    coordinates: { lat: 28.6139, lng: 77.2090 },
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    active: true
  },
  {
    id: "alert-003", 
    type: "Cyclone",
    title: "Cyclone Alert",
    message: "Severe cyclonic storm approaching coast. Wind speed 120-140 kmph. Coastal evacuation advised.",
    severity: "Critical",
    area: "Andhra Pradesh, Odisha Coast",
    coordinates: { lat: 17.6868, lng: 83.2185 },
    expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    active: true
  }
];

class DisasterAPI {
  private static instance: DisasterAPI;
  private eventListeners: Map<string, Function[]> = new Map();
  private channels: Map<string, any> = new Map();
  private initialized = false;
  private demoMode = true;

  static getInstance(): DisasterAPI {
    if (!DisasterAPI.instance) {
      DisasterAPI.instance = new DisasterAPI();
    }
    return DisasterAPI.instance;
  }

  private constructor() {
    console.log('Disaster API initialized in comprehensive demo mode');
  }

  // Mock API request method that returns demo data
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    const method = options.method || 'GET';
    console.log(`Demo API: ${method} ${endpoint}`);
    
    try {
      // Route to appropriate demo data based on endpoint
      if (endpoint === '/incidents') {
        if (method === 'POST') {
          const newIncident = JSON.parse(options.body);
          const incident = {
            id: `inc-${Date.now()}`,
            ...newIncident,
            status: 'Active' as const,
            reportedBy: newIncident.reportedBy || 'Emergency Reporter',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resources: newIncident.resources || 0,
            radius: newIncident.radius || 10
          };
          return { success: true, data: incident };
        }
        return { success: true, data: DEMO_INCIDENTS };
      }
      
      if (endpoint.startsWith('/incidents/')) {
        const incidentId = endpoint.split('/')[2];
        if (method === 'PUT') {
          const updates = JSON.parse(options.body);
          return { success: true, data: { id: incidentId, ...updates, updatedAt: new Date().toISOString() } };
        }
      }
      
      if (endpoint === '/volunteers') {
        if (method === 'POST') {
          const body = JSON.parse(options.body);
          if (body.id) {
            // Update volunteer
            return { success: true, data: { ...body, updatedAt: new Date().toISOString() } };
          } else {
            // Register new volunteer
            const volunteer = {
              id: `vol-${Date.now()}`,
              ...body,
              status: 'Available' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            return { success: true, data: volunteer };
          }
        }
        return { success: true, data: DEMO_VOLUNTEERS };
      }
      
      if (endpoint.startsWith('/volunteers/') && endpoint.includes('/assign-task')) {
        const volunteerId = endpoint.split('/')[2];
        const taskData = JSON.parse(options.body);
        return { 
          success: true, 
          data: { 
            volunteerId, 
            task: taskData.task,
            assignedAt: new Date().toISOString()
          } 
        };
      }
      
      if (endpoint === '/relief-centers') {
        return { success: true, data: DEMO_RELIEF_CENTERS };
      }
      
      if (endpoint.startsWith('/relief-centers/')) {
        const centerId = endpoint.split('/')[2];
        if (method === 'PUT') {
          const updates = JSON.parse(options.body);
          return { success: true, data: { id: centerId, ...updates, updatedAt: new Date().toISOString() } };
        }
      }
      
      if (endpoint === '/alerts') {
        if (method === 'POST') {
          const alertData = JSON.parse(options.body);
          const alert = {
            id: `alert-${Date.now()}`,
            type: alertData.type || 'General',
            ...alertData,
            expiresAt: alertData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            active: true
          };
          return { success: true, data: alert };
        }
        return { success: true, data: DEMO_ALERTS };
      }
      
      if (endpoint === '/stats') {
        const stats = {
          incidents: {
            total: DEMO_INCIDENTS.length,
            active: DEMO_INCIDENTS.filter(i => i.status === 'Active').length,
            resolved: DEMO_INCIDENTS.filter(i => i.status === 'Resolved').length
          },
          volunteers: {
            total: DEMO_VOLUNTEERS.length,
            active: DEMO_VOLUNTEERS.filter(v => v.status === 'Active').length,
            available: DEMO_VOLUNTEERS.filter(v => v.status === 'Available').length,
            enRoute: DEMO_VOLUNTEERS.filter(v => v.status === 'En Route').length
          },
          reliefCenters: {
            total: DEMO_RELIEF_CENTERS.length,
            totalCapacity: DEMO_RELIEF_CENTERS.reduce((sum, center) => sum + center.capacity, 0),
            currentOccupancy: DEMO_RELIEF_CENTERS.reduce((sum, center) => sum + center.current, 0),
            occupancyRate: `${Math.round((DEMO_RELIEF_CENTERS.reduce((sum, center) => sum + center.current, 0) / DEMO_RELIEF_CENTERS.reduce((sum, center) => sum + center.capacity, 0)) * 100)}%`
          },
          alerts: {
            active: DEMO_ALERTS.filter(a => a.active).length,
            total: DEMO_ALERTS.length
          },
          resources: {
            deployed: DEMO_INCIDENTS.reduce((sum, incident) => sum + incident.resources, 0)
          },
          lastUpdated: new Date().toISOString()
        };
        return { success: true, data: stats };
      }
      
      if (endpoint === '/init-sample-data') {
        return { 
          success: true, 
          data: { 
            message: 'Demo data initialized successfully',
            incidents: DEMO_INCIDENTS.length,
            volunteers: DEMO_VOLUNTEERS.length,
            reliefCenters: DEMO_RELIEF_CENTERS.length,
            alerts: DEMO_ALERTS.length
          } 
        };
      }
      
      if (endpoint === '/health') {
        return { 
          success: true, 
          data: { 
            status: 'operational',
            mode: 'demo',
            timestamp: new Date().toISOString(),
            uptime: '100%'
          } 
        };
      }
      
      // Default response for unknown endpoints
      return { success: false, error: `Demo endpoint not found: ${endpoint}` };
      
    } catch (error) {
      console.error('Demo API error:', error);
      return { success: false, error: 'Demo API processing error' };
    }
  }

  // Lazy initialization of real-time channels (demo mode)
  private initializeRealtimeChannels() {
    if (this.initialized) return;
    
    this.initialized = true;
    console.log('Demo real-time channels initialized');

    // Simulate periodic updates for demo
    setInterval(() => {
      this.simulateRealtimeUpdate('incidents', { 
        type: 'update', 
        message: 'Demo incident status updated',
        timestamp: new Date().toISOString()
      });
    }, 30000); // Every 30 seconds

    setInterval(() => {
      this.simulateRealtimeUpdate('volunteers', { 
        type: 'status_change', 
        message: 'Demo volunteer status updated',
        timestamp: new Date().toISOString()
      });
    }, 45000); // Every 45 seconds
  }

  private simulateRealtimeUpdate(channel: string, data: any) {
    this.notifyListeners(channel, data);
  }

  // Event listener management
  addEventListener(channel: string, callback: Function) {
    // Initialize channels when first listener is added
    if (!this.initialized) {
      this.initializeRealtimeChannels();
    }
    
    if (!this.eventListeners.has(channel)) {
      this.eventListeners.set(channel, []);
    }
    this.eventListeners.get(channel)!.push(callback);
  }

  removeEventListener(channel: string, callback: Function) {
    const listeners = this.eventListeners.get(channel);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(channel: string, data: any) {
    const listeners = this.eventListeners.get(channel);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Cleanup method for when app unmounts
  cleanup() {
    this.eventListeners.clear();
    this.initialized = false;
    console.log('Demo API cleaned up');
  }

  // Public API methods that use the makeRequest method
  async getIncidents() {
    return this.makeRequest('/incidents');
  }

  async createIncident(incidentData: {
    type: string;
    severity: string;
    location: string;
    coordinates: { lat: number; lng: number };
    description: string;
    reportedBy?: string;
    radius?: number;
  }) {
    return this.makeRequest('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  }

  async updateIncident(id: string, updates: any) {
    return this.makeRequest(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getReliefCenters() {
    return this.makeRequest('/relief-centers');
  }

  async updateReliefCenter(id: string, updates: { current?: number; status?: string }) {
    return this.makeRequest(`/relief-centers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getVolunteers() {
    return this.makeRequest('/volunteers');
  }

  async registerVolunteer(volunteerData: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    coordinates: { lat: number; lng: number };
  }) {
    return this.makeRequest('/volunteers', {
      method: 'POST',
      body: JSON.stringify(volunteerData),
    });
  }

  async updateVolunteer(id: string, updates: any) {
    return this.makeRequest('/volunteers', {
      method: 'POST',
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async assignTaskToVolunteer(volunteerId: string, task: {
    title: string;
    description: string;
    priority: string;
    location: string;
    coordinates: { lat: number; lng: number };
    estimatedDuration?: number;
  }) {
    return this.makeRequest(`/volunteers/${volunteerId}/assign-task`, {
      method: 'POST',
      body: JSON.stringify({ task }),
    });
  }

  async getAlerts() {
    return this.makeRequest('/alerts');
  }

  async createAlert(alertData: {
    type?: string;
    title: string;
    message: string;
    severity?: string;
    area: string;
    coordinates?: { lat: number; lng: number };
    expiresAt?: string;
  }) {
    return this.makeRequest('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async getStatistics() {
    return this.makeRequest('/stats');
  }

  async initializeSampleData() {
    return this.makeRequest('/init-sample-data', {
      method: 'POST',
    });
  }

  async healthCheck() {
    return this.makeRequest('/health');
  }
}

// Singleton instance
export const disasterAPI = DisasterAPI.getInstance();

// Type definitions
export interface Incident {
  id: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  status: 'Active' | 'Monitoring' | 'Resolved';
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  resources: number;
  radius: number;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  coordinates: { lat: number; lng: number };
  status: 'Active' | 'Available' | 'En Route' | 'Offline';
  currentTask?: {
    title: string;
    description: string;
    priority: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReliefCenter {
  id: string;
  name: string;
  capacity: number;
  current: number;
  location: string;
  coordinates: { lat: number; lng: number };
  resources: string[];
  status: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  area: string;
  coordinates?: { lat: number; lng: number };
  expiresAt: string;
  createdAt: string;
  active: boolean;
}

export interface Statistics {
  incidents: {
    total: number;
    active: number;
    resolved: number;
  };
  volunteers: {
    total: number;
    active: number;
    available: number;
    enRoute: number;
  };
  reliefCenters: {
    total: number;
    totalCapacity: number;
    currentOccupancy: number;
    occupancyRate: string;
  };
  alerts: {
    active: number;
    total: number;
  };
  resources: {
    deployed: number;
  };
  lastUpdated: string;
}

// React hooks for easier integration
export function useRealtimeData<T>(
  endpoint: string,
  channel: string,
  initialData: T[] = []
): {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await disasterAPI.makeRequest(endpoint);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch demo data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo data error');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();

    // Set up real-time listener for demo updates
    const handleUpdate = (payload: any) => {
      console.log(`Demo real-time update on ${channel}:`, payload);
      // Refetch data when updates occur
      fetchData();
    };

    disasterAPI.addEventListener(channel, handleUpdate);

    return () => {
      disasterAPI.removeEventListener(channel, handleUpdate);
    };
  }, [fetchData, channel]);

  return { data, loading, error, refetch: fetchData };
}