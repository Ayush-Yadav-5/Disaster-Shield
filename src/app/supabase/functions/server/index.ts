import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.ts';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Weather API configuration
const OPENWEATHER_API_KEY = '6b0e4f51ec59bbaf14594ef24676f8c0';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Cache for API responses to reduce external API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithCache<T>(url: string): Promise<T> {
  const cacheKey = btoa(url);
  const cached = getCachedData<T>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Initialize buckets for file storage
async function initializeBuckets() {
  const buckets = ['make-3f6e5e28-incidents', 'make-3f6e5e28-reports'];
  
  for (const bucketName of buckets) {
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      await supabase.storage.createBucket(bucketName, { public: false });
    }
  }
}

// Initialize on startup
initializeBuckets().catch(console.error);

// Health check
app.get('/make-server-3f6e5e28/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ===== WEATHER API ENDPOINTS =====

// Current weather endpoint
app.get('/make-server-3f6e5e28/weather/current/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat');
    const lon = c.req.param('lon');
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }
    
    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const data = await fetchWithCache(url);
    
    return c.json(data);
  } catch (error) {
    console.error('Current weather fetch error:', error);
    return c.json({ error: 'Failed to fetch weather data' }, 500);
  }
});

// UV Index endpoint
app.get('/make-server-3f6e5e28/weather/uv/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat');
    const lon = c.req.param('lon');
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }
    
    const url = `${OPENWEATHER_BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const data = await fetchWithCache(url);
    
    return c.json(data);
  } catch (error) {
    console.error('UV Index fetch error:', error);
    return c.json({ error: 'Failed to fetch UV data', value: 0 });
  }
});

// Air Quality endpoint
app.get('/make-server-3f6e5e28/weather/air-quality/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat');
    const lon = c.req.param('lon');
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }
    
    const url = `${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const data = await fetchWithCache(url);
    
    return c.json(data);
  } catch (error) {
    console.error('Air Quality fetch error:', error);
    return c.json({ error: 'Failed to fetch air quality data', list: [{ main: { aqi: 0 } }] });
  }
});

// Location search endpoint
app.get('/make-server-3f6e5e28/weather/search/:query', async (c) => {
  try {
    const query = c.req.param('query');
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }
    
    const url = `${OPENWEATHER_GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`;
    const data = await fetchWithCache(url);
    
    return c.json(data);
  } catch (error) {
    console.error('Location search error:', error);
    return c.json({ error: 'Failed to search locations' }, 500);
  }
});

// Reverse geocoding endpoint
app.get('/make-server-3f6e5e28/weather/reverse/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat');
    const lon = c.req.param('lon');
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }
    
    const url = `${OPENWEATHER_GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const data = await fetchWithCache(url);
    
    return c.json(data);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return c.json({ error: 'Failed to reverse geocode' }, 500);
  }
});

// Comprehensive weather data endpoint
app.get('/make-server-3f6e5e28/weather/comprehensive/:lat/:lon', async (c) => {
  try {
    const lat = parseFloat(c.req.param('lat') || '0');
    const lon = parseFloat(c.req.param('lon') || '0');
    const locationName = c.req.query('location');
    
    if (!lat || !lon) {
      return c.json({ error: 'Valid latitude and longitude are required' }, 400);
    }
    
    // Fetch all weather data concurrently
    const [weatherResult, uvResult, aqResult, locationResult] = await Promise.allSettled([
      fetchWithCache(`${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
      fetchWithCache(`${OPENWEATHER_BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`),
      fetchWithCache(`${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`),
      locationName ? Promise.resolve(null) : fetchWithCache(`${OPENWEATHER_GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`)
    ]);

    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
    if (!weather) {
      throw new Error('Failed to fetch weather data');
    }

    // Calculate dew point using Magnus formula
    const calculateDewPoint = (temperature: number, humidity: number): number => {
      const a = 17.27;
      const b = 237.7;
      const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
      return (b * alpha) / (a - alpha);
    };

    const dewPoint = calculateDewPoint(weather.main.temp, weather.main.humidity);

    // Format times
    const formatTime = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Generate alerts based on weather conditions
    const alerts: any[] = [];
    
    if (weather.main.temp > 40) {
      alerts.push({
        id: 'heat-warning',
        title: 'Heat Wave Warning',
        description: 'Extreme heat conditions. Stay hydrated and avoid outdoor activities.',
        severity: 'severe',
        start: 'Now',
        end: 'Until further notice',
        source: 'OpenWeatherMap'
      });
    }

    if (weather.wind.speed > 14) { // 50 km/h in m/s
      alerts.push({
        id: 'wind-warning',
        title: 'High Wind Warning',
        description: 'Strong winds expected. Secure loose objects and avoid driving.',
        severity: 'moderate',
        start: 'Now',
        end: 'Next 6 hours',
        source: 'OpenWeatherMap'
      });
    }

    if (weather.weather[0].main.toLowerCase().includes('thunderstorm')) {
      alerts.push({
        id: 'thunderstorm-warning',
        title: 'Thunderstorm Warning',
        description: 'Severe thunderstorms with lightning. Stay indoors and avoid metal objects.',
        severity: 'severe',
        start: 'Now',
        end: 'Next 3 hours',
        source: 'OpenWeatherMap'
      });
    }

    const location = locationName || 
      (locationResult.status === 'fulfilled' && locationResult.value?.[0] ? 
        `${locationResult.value[0].name}, ${locationResult.value[0].state || ''} ${locationResult.value[0].country}`.trim() : 
        'Unknown Location'
      );

    const weatherData = {
      location,
      coordinates: [lat, lon],
      temperature: Math.round(weather.main.temp),
      feelsLike: Math.round(weather.main.feels_like),
      description: weather.weather[0].description,
      humidity: weather.main.humidity,
      windSpeed: Math.round(weather.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: weather.wind.deg || 0,
      visibility: Math.round(weather.visibility / 1000), // Convert to km
      pressure: weather.main.pressure,
      uvIndex: uvResult.status === 'fulfilled' ? Math.round(uvResult.value?.value || 0) : 0,
      dewPoint: Math.round(dewPoint),
      cloudCover: weather.clouds.all,
      icon: weather.weather[0].icon,
      alerts,
      lastUpdated: new Date().toISOString(),
      sunrise: formatTime(weather.sys.sunrise),
      sunset: formatTime(weather.sys.sunset),
      aqi: aqResult.status === 'fulfilled' ? aqResult.value?.list?.[0]?.main?.aqi : undefined,
      country: weather.sys.country,
      state: locationResult.status === 'fulfilled' && locationResult.value?.[0] ? locationResult.value[0].state : undefined
    };

    return c.json(weatherData);
  } catch (error) {
    console.error('Comprehensive weather data fetch error:', error);
    return c.json({ error: 'Failed to fetch comprehensive weather data' }, 500);
  }
});

// Cache statistics endpoint
app.get('/make-server-3f6e5e28/weather/cache-stats', (c) => {
  return c.json({
    size: cache.size,
    keys: Array.from(cache.keys()).slice(0, 10) // Show first 10 keys for debugging
  });
});

// Clear cache endpoint
app.delete('/make-server-3f6e5e28/weather/cache', (c) => {
  cache.clear();
  return c.json({ message: 'Cache cleared successfully' });
});

// ===== DISASTER MANAGEMENT ENDPOINTS =====

// Get all incidents
app.get('/make-server-3f6e5e28/incidents', async (c) => {
  try {
    const incidents = await kv.getByPrefix('incident:');
    const formattedIncidents = incidents.map(item => ({
      id: item.key.split(':')[1],
      ...item.value
    }));
    
    return c.json({ incidents: formattedIncidents });
  } catch (error) {
    console.log('Error fetching incidents:', error);
    return c.json({ error: 'Failed to fetch incidents' }, 500);
  }
});

// Create new incident
app.post('/make-server-3f6e5e28/incidents', async (c) => {
  try {
    const body = await c.req.json();
    const incidentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const incident = {
      id: incidentId,
      type: body.type,
      severity: body.severity,
      description: body.description,
      location: body.location,
      coordinates: body.coordinates,
      status: 'Active',
      reportedBy: body.reportedBy || 'System',
      reportedAt: new Date().toISOString(),
      resources: body.resources || 0,
      radius: body.radius || 500,
      images: body.images || []
    };
    
    await kv.set(`incident:${incidentId}`, incident);
    
    console.log(`New incident created: ${incidentId}`);
    return c.json({ success: true, incident });
  } catch (error) {
    console.log('Error creating incident:', error);
    return c.json({ error: 'Failed to create incident' }, 500);
  }
});

// Update incident status
app.put('/make-server-3f6e5e28/incidents/:id', async (c) => {
  try {
    const incidentId = c.req.param('id');
    const body = await c.req.json();
    
    const existingIncident = await kv.get(`incident:${incidentId}`);
    if (!existingIncident) {
      return c.json({ error: 'Incident not found' }, 404);
    }
    
    const updatedIncident = {
      ...existingIncident,
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`incident:${incidentId}`, updatedIncident);
    
    console.log(`Incident updated: ${incidentId}`);
    return c.json({ success: true, incident: updatedIncident });
  } catch (error) {
    console.log('Error updating incident:', error);
    return c.json({ error: 'Failed to update incident' }, 500);
  }
});

// Get all volunteers
app.get('/make-server-3f6e5e28/volunteers', async (c) => {
  try {
    const volunteers = await kv.getByPrefix('volunteer:');
    const formattedVolunteers = volunteers.map(item => ({
      id: item.key.split(':')[1],
      ...item.value
    }));
    
    return c.json({ volunteers: formattedVolunteers });
  } catch (error) {
    console.log('Error fetching volunteers:', error);
    return c.json({ error: 'Failed to fetch volunteers' }, 500);
  }
});

// Update volunteer status/location
app.put('/make-server-3f6e5e28/volunteers/:id', async (c) => {
  try {
    const volunteerId = c.req.param('id');
    const body = await c.req.json();
    
    const existingVolunteer = await kv.get(`volunteer:${volunteerId}`);
    if (!existingVolunteer) {
      return c.json({ error: 'Volunteer not found' }, 404);
    }
    
    const updatedVolunteer = {
      ...existingVolunteer,
      ...body,
      lastUpdate: new Date().toISOString()
    };
    
    await kv.set(`volunteer:${volunteerId}`, updatedVolunteer);
    
    console.log(`Volunteer updated: ${volunteerId}`);
    return c.json({ success: true, volunteer: updatedVolunteer });
  } catch (error) {
    console.log('Error updating volunteer:', error);
    return c.json({ error: 'Failed to update volunteer' }, 500);
  }
});

// Get all relief centers
app.get('/make-server-3f6e5e28/relief-centers', async (c) => {
  try {
    const centers = await kv.getByPrefix('relief-center:');
    const formattedCenters = centers.map(item => ({
      id: item.key.split(':')[1],
      ...item.value
    }));
    
    return c.json({ reliefCenters: formattedCenters });
  } catch (error) {
    console.log('Error fetching relief centers:', error);
    return c.json({ error: 'Failed to fetch relief centers' }, 500);
  }
});

// Update relief center capacity
app.put('/make-server-3f6e5e28/relief-centers/:id', async (c) => {
  try {
    const centerId = c.req.param('id');
    const body = await c.req.json();
    
    const existingCenter = await kv.get(`relief-center:${centerId}`);
    if (!existingCenter) {
      return c.json({ error: 'Relief center not found' }, 404);
    }
    
    const updatedCenter = {
      ...existingCenter,
      ...body,
      lastUpdate: new Date().toISOString()
    };
    
    await kv.set(`relief-center:${centerId}`, updatedCenter);
    
    console.log(`Relief center updated: ${centerId}`);
    return c.json({ success: true, reliefCenter: updatedCenter });
  } catch (error) {
    console.log('Error updating relief center:', error);
    return c.json({ error: 'Failed to update relief center' }, 500);
  }
});

// Submit emergency report with file upload
app.post('/make-server-3f6e5e28/reports', async (c) => {
  try {
    const body = await c.req.json();
    const reportId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const report = {
      id: reportId,
      type: body.type,
      description: body.description,
      location: body.location,
      coordinates: body.coordinates,
      priority: body.priority || 'Medium',
      reportedBy: body.reportedBy || 'Anonymous',
      reportedAt: new Date().toISOString(),
      status: 'Pending Review',
      images: body.images || [],
      contacts: body.contacts || {}
    };
    
    await kv.set(`report:${reportId}`, report);
    
    // Auto-create incident for high priority reports
    if (body.priority === 'Critical' || body.priority === 'High') {
      const incidentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const incident = {
        id: incidentId,
        type: body.type,
        severity: body.priority === 'Critical' ? 'Critical' : 'High',
        description: body.description,
        location: body.location,
        coordinates: body.coordinates,
        status: 'Active',
        reportedBy: 'Citizen Report',
        reportedAt: new Date().toISOString(),
        resources: 0,
        radius: 300,
        sourceReport: reportId
      };
      
      await kv.set(`incident:${incidentId}`, incident);
      console.log(`Auto-created incident from report: ${incidentId}`);
    }
    
    console.log(`New report submitted: ${reportId}`);
    return c.json({ success: true, report, autoIncidentCreated: body.priority === 'Critical' || body.priority === 'High' });
  } catch (error) {
    console.log('Error submitting report:', error);
    return c.json({ error: 'Failed to submit report' }, 500);
  }
});

// Upload file for incident/report
app.post('/make-server-3f6e5e28/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'incident';
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const fileName = `${Date.now()}-${file.name}`;
    const bucketName = type === 'report' ? 'make-3f6e5e28-reports' : 'make-3f6e5e28-incidents';
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);
      
    if (error) {
      console.log('Storage upload error:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }
    
    // Generate signed URL
    const { data: signedUrl } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600); // 1 hour expiry
    
    console.log(`File uploaded: ${fileName}`);
    return c.json({ 
      success: true, 
      fileName,
      url: signedUrl?.signedUrl,
      path: data.path 
    });
  } catch (error) {
    console.log('Error uploading file:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Get system statistics
app.get('/make-server-3f6e5e28/stats', async (c) => {
  try {
    const [incidents, volunteers, reliefCenters, reports] = await Promise.all([
      kv.getByPrefix('incident:'),
      kv.getByPrefix('volunteer:'),
      kv.getByPrefix('relief-center:'),
      kv.getByPrefix('report:')
    ]);
    
    const activeIncidents = incidents.filter(item => item.value.status === 'Active');
    const activeVolunteers = volunteers.filter(item => item.value.status === 'Active');
    const totalResources = incidents.reduce((sum, item) => sum + (item.value.resources || 0), 0);
    const recentReports = reports.filter(item => {
      const reportTime = new Date(item.value.reportedAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return reportTime > oneHourAgo;
    });
    
    const stats = {
      activeIncidents: activeIncidents.length,
      totalIncidents: incidents.length,
      activeVolunteers: activeVolunteers.length,
      totalVolunteers: volunteers.length,
      reliefCenters: reliefCenters.length,
      totalResources,
      recentReports: recentReports.length,
      totalReports: reports.length,
      systemStatus: 'operational',
      lastUpdate: new Date().toISOString()
    };
    
    return c.json({ stats });
  } catch (error) {
    console.log('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

// Initialize sample data
app.post('/make-server-3f6e5e28/init-sample-data', async (c) => {
  try {
    // Sample incidents
    const sampleIncidents = [
      {
        id: '1',
        type: 'Fire',
        severity: 'Critical',
        description: 'Large building fire with multiple units responding',
        location: 'Downtown Plaza, Manhattan',
        coordinates: { lat: 40.7589, lng: -73.9851 },
        status: 'Active',
        reportedBy: 'Fire Department',
        reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        resources: 12,
        radius: 500
      },
      {
        id: '2',
        type: 'Flood',
        severity: 'High',
        description: 'Flash flooding due to storm drainage overflow',
        location: 'Brooklyn Bridge Area',
        coordinates: { lat: 40.7061, lng: -73.9969 },
        status: 'Monitoring',
        reportedBy: 'Citizen Report',
        reportedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        resources: 8,
        radius: 800
      }
    ];
    
    // Sample volunteers
    const sampleVolunteers = [
      {
        id: '1',
        name: 'Sarah Johnson',
        coordinates: { lat: 40.7614, lng: -73.9776 },
        status: 'Active',
        specialty: 'Medical',
        contact: 'sarah.j@volunteer.org',
        certification: 'EMT-B',
        lastUpdate: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Mike Chen',
        coordinates: { lat: 40.7831, lng: -73.9712 },
        status: 'En Route',
        specialty: 'Search & Rescue',
        contact: 'mike.c@volunteer.org',
        certification: 'CERT Level 2',
        lastUpdate: new Date().toISOString()
      }
    ];
    
    // Sample relief centers
    const sampleReliefCenters = [
      {
        id: '1',
        name: 'Central Emergency Shelter',
        capacity: 500,
        current: 347,
        location: 'Madison Square Garden Area',
        coordinates: { lat: 40.7505, lng: -73.9934 },
        resources: ['Food', 'Medical', 'Shelter', 'Communications'],
        status: 'Active',
        contact: '(555) 123-4567',
        lastUpdate: new Date().toISOString()
      }
    ];
    
    // Store sample data
    for (const incident of sampleIncidents) {
      await kv.set(`incident:${incident.id}`, incident);
    }
    
    for (const volunteer of sampleVolunteers) {
      await kv.set(`volunteer:${volunteer.id}`, volunteer);
    }
    
    for (const center of sampleReliefCenters) {
      await kv.set(`relief-center:${center.id}`, center);
    }
    
    console.log('Sample data initialized');
    return c.json({ success: true, message: 'Sample data initialized' });
  } catch (error) {
    console.log('Error initializing sample data:', error);
    return c.json({ error: 'Failed to initialize sample data' }, 500);
  }
});

// Test endpoint to create a sample emergency incident
app.post('/make-server-3f6e5e28/test-emergency', async (c) => {
  try {
    const incidentId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const testIncident = {
      id: incidentId,
      type: 'Test Emergency',
      severity: 'High',
      description: 'This is a test emergency to demonstrate real-time updates',
      location: 'Test Location - NYC',
      coordinates: { lat: 40.7589 + (Math.random() - 0.5) * 0.01, lng: -73.9851 + (Math.random() - 0.5) * 0.01 },
      status: 'Active',
      reportedBy: 'System Test',
      reportedAt: new Date().toISOString(),
      resources: Math.floor(Math.random() * 15) + 1,
      radius: Math.floor(Math.random() * 800) + 200
    };
    
    await kv.set(`incident:${incidentId}`, testIncident);
    
    console.log(`Test incident created: ${incidentId}`);
    return c.json({ success: true, incident: testIncident, message: 'Test emergency created' });
  } catch (error) {
    console.log('Error creating test emergency:', error);
    return c.json({ error: 'Failed to create test emergency' }, 500);
  }
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

console.log('Emergency Management Server with Weather API starting...');
Deno.serve(app.fetch);