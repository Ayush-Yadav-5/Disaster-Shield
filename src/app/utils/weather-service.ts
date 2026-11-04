interface WeatherData {
  location: string;
  coordinates: [number, number];
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
  icon: string;
  alerts: WeatherAlert[];
  lastUpdated: Date;
  sunrise?: string;
  sunset?: string;
  aqi?: {
    value: number; // US standard 0-500 scale
    category: string;
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    healthRecommendations: string[];
  };
  country?: string;
  state?: string;
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: string;
  end: string;
  source: string;
}

interface LocationResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  local_names?: { [key: string]: string };
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

class WeatherService {
  private readonly API_KEY = 'acd739c1934f858d293e2f9fd9cd5077';
  private readonly BASE_URL = 'https://api.openweathermap.org';
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds
  
  private readonly MOCK_LOCATIONS: LocationResult[] = [
    { name: "New Delhi", country: "IN", state: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Mumbai", country: "IN", state: "Maharashtra", lat: 19.0760, lon: 72.8777 },
    { name: "Bangalore", country: "IN", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", country: "IN", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
    { name: "Kolkata", country: "IN", state: "West Bengal", lat: 22.5726, lon: 88.3639 },
    { name: "Hyderabad", country: "IN", state: "Telangana", lat: 17.3850, lon: 78.4867 },
    { name: "Pune", country: "IN", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
    { name: "Ahmedabad", country: "IN", state: "Gujarat", lat: 23.0225, lon: 72.5714 },
    { name: "Jaipur", country: "IN", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
    { name: "Lucknow", country: "IN", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  ];

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private isOfflineMode = false;
  private locationWatchId: number | null = null;
  private currentLocation: LocationCoordinates | null = null;
  private locationListeners: Set<(location: LocationCoordinates | null) => void> = new Set();
  private apiRetryCount = 0;
  private readonly MAX_API_RETRIES = 3;

  constructor() {
    this.initializeLocationServices();
    
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOfflineMode = false;
      this.apiRetryCount = 0;
      console.log('Weather service: Back online');
    });
    
    window.addEventListener('offline', () => {
      this.isOfflineMode = true;
      console.log('Weather service: Offline mode');
    });
  }

  private initializeLocationServices(): void {
    if (!('geolocation' in navigator)) {
      console.log('Geolocation not supported by this browser');
      return;
    }

    try {
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' })
          .then((result) => {
            console.log('Geolocation permission state:', result.state);
            if (result.state === 'granted') {
              this.startLocationTracking();
            }
          })
          .catch((error) => {
            console.log('Permission query not supported or failed:', error.message);
          });
      }
    } catch (error) {
      console.log('Failed to initialize location services:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private getCacheKey(key: string): string {
    return btoa(key);
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(this.getCacheKey(key));
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(this.getCacheKey(key), { 
      data, 
      timestamp: Date.now()
    });
  }

  private async fetchWeatherAPI<T>(endpoint: string): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}appid=${this.API_KEY}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DisasterGuard/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded - too many requests');
        } else if (response.status === 401) {
          throw new Error('Invalid API key');
        } else if (response.status >= 500) {
          throw new Error('Server error - service temporarily unavailable');
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Reset retry count on successful request
      this.apiRetryCount = 0;
      this.isOfflineMode = false;
      
      return data;
    } catch (error) {
      console.error('Weather API fetch error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        } else if (error.message.includes('fetch')) {
          // Network error
          this.apiRetryCount++;
          if (this.apiRetryCount >= this.MAX_API_RETRIES) {
            this.isOfflineMode = true;
            console.warn('Max API retries reached, switching to offline mode');
          }
          throw new Error('Network error - check your internet connection');
        }
      }
      
      throw error;
    }
  }

  // GPS Location Services
  async requestLocationPermission(): Promise<boolean> {
    if (!('geolocation' in navigator)) {
      console.log('Geolocation not supported');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location permission granted');
          this.updateCurrentLocation(position);
          resolve(true);
        },
        (error) => {
          let errorMessage = 'Location access denied';
          
          switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case GeolocationPositionError.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error';
              break;
          }
          
          console.log('Location error:', errorMessage);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  startLocationTracking(): void {
    if (!('geolocation' in navigator) || this.locationWatchId !== null) {
      return;
    }

    console.log('Starting location tracking...');
    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Location updated:', position.coords.latitude, position.coords.longitude);
        this.updateCurrentLocation(position);
      },
      (error) => {
        let errorMessage = 'Location tracking error';
        
        switch (error.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            this.currentLocation = null;
            this.notifyLocationListeners();
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = 'Location timeout';
            break;
          default:
            errorMessage = 'Unknown location error';
            break;
        }
        
        console.log('Location tracking error:', errorMessage);
        // Don't clear location on temporary errors unless permission denied
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  }

  stopLocationTracking(): void {
    if (this.locationWatchId !== null) {
      console.log('Stopping location tracking...');
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
      this.currentLocation = null;
      this.notifyLocationListeners();
    }
  }

  private updateCurrentLocation(position: GeolocationPosition): void {
    this.currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };
    this.notifyLocationListeners();
  }

  private notifyLocationListeners(): void {
    this.locationListeners.forEach(listener => {
      try {
        listener(this.currentLocation);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }

  addLocationListener(listener: (location: LocationCoordinates | null) => void): () => void {
    this.locationListeners.add(listener);
    // Immediately call with current location
    try {
      listener(this.currentLocation);
    } catch (error) {
      console.error('Error calling location listener:', error);
    }
    
    return () => {
      this.locationListeners.delete(listener);
    };
  }

  getCurrentLocation(): LocationCoordinates | null {
    return this.currentLocation;
  }

  isLocationAvailable(): boolean {
    return this.currentLocation !== null;
  }

  getLocationAccuracy(): string {
    if (!this.currentLocation) return 'No location';
    
    const accuracy = this.currentLocation.accuracy;
    if (accuracy < 10) return 'High accuracy';
    if (accuracy < 100) return 'Good accuracy';
    if (accuracy < 1000) return 'Fair accuracy';
    return 'Low accuracy';
  }

  // Convert European AQI (1-5) to US AQI (0-500) standard
  private convertToUSAQI(europeanAqi: number, components: any): { value: number; category: string; healthRecommendations: string[] } {
    // Convert PM2.5 to US AQI as primary pollutant (most commonly used)
    const pm25 = components.pm2_5;
    let usAqi = 0;
    let category = 'Good';
    let healthRecommendations: string[] = [];

    if (pm25 <= 12.0) {
      // Good (0-50)
      usAqi = Math.round((50 / 12.0) * pm25);
      category = 'Good';
      healthRecommendations = [
        'Air quality is considered satisfactory',
        'Air pollution poses little or no risk'
      ];
    } else if (pm25 <= 35.4) {
      // Moderate (51-100)
      usAqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
      category = 'Moderate';
      healthRecommendations = [
        'Air quality is acceptable for most people',
        'Unusually sensitive people may experience minor symptoms'
      ];
    } else if (pm25 <= 55.4) {
      // Unhealthy for Sensitive Groups (101-150)
      usAqi = Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
      category = 'Unhealthy for Sensitive Groups';
      healthRecommendations = [
        'Sensitive groups may experience health effects',
        'General public is not likely to be affected'
      ];
    } else if (pm25 <= 150.4) {
      // Unhealthy (151-200)
      usAqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
      category = 'Unhealthy';
      healthRecommendations = [
        'Everyone may begin to experience health effects',
        'Sensitive groups may experience more serious effects'
      ];
    } else if (pm25 <= 250.4) {
      // Very Unhealthy (201-300)
      usAqi = Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
      category = 'Very Unhealthy';
      healthRecommendations = [
        'Health warnings of emergency conditions',
        'Everyone may experience more serious health effects'
      ];
    } else {
      // Hazardous (301-500)
      usAqi = Math.min(500, Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301));
      category = 'Hazardous';
      healthRecommendations = [
        'Emergency conditions: everyone affected',
        'Avoid all outdoor activities'
      ];
    }

    // Fallback calculation if PM2.5 data is not reliable
    if (usAqi === 0 || isNaN(usAqi)) {
      switch (europeanAqi) {
        case 1:
          usAqi = 25;
          category = 'Good';
          break;
        case 2:
          usAqi = 75;
          category = 'Moderate';
          break;
        case 3:
          usAqi = 125;
          category = 'Unhealthy for Sensitive Groups';
          break;
        case 4:
          usAqi = 175;
          category = 'Unhealthy';
          break;
        case 5:
          usAqi = 250;
          category = 'Very Unhealthy';
          break;
        default:
          usAqi = 50;
          category = 'Good';
      }
    }

    return { value: usAqi, category, healthRecommendations };
  }

  // Generate realistic mock weather data with US AQI
  private generateMockWeatherData(lat: number, lon: number, locationName: string): WeatherData {
    const seed = Math.abs(Math.sin(lat) * Math.cos(lon)) * 1000;
    
    const baseTemp = 35 - Math.abs(lat - 20) * 0.8 + (seed % 15) - 7;
    const temperature = Math.round(Math.max(5, Math.min(45, baseTemp)));
    
    const humidity = Math.round(40 + (seed * 7) % 50);
    const windSpeed = Math.round(5 + (seed * 3) % 25);
    const pressure = Math.round(1010 + (seed * 2) % 30 - 15);
    const cloudCover = Math.round((seed * 5) % 100);
    
    let description = "clear sky";
    let icon = "01d";
    
    if (cloudCover > 80) {
      description = "overcast clouds";
      icon = "04d";
    } else if (cloudCover > 60) {
      description = "broken clouds";
      icon = "04d";
    } else if (cloudCover > 30) {
      description = "scattered clouds";
      icon = "03d";
    } else if (cloudCover > 10) {
      description = "few clouds";
      icon = "02d";
    }

    // Generate mock AQI data with US standards
    const europeanAqi = Math.round(1 + (seed % 4));
    const mockComponents = {
      co: Math.round(300 + (seed * 3) % 200),
      no: Math.round(10 + (seed * 2) % 20),
      no2: Math.round(20 + (seed * 4) % 40),
      o3: Math.round(50 + (seed * 5) % 60),
      so2: Math.round(5 + (seed * 2) % 20),
      pm2_5: Math.round(15 + (seed * 6) % 35),
      pm10: Math.round(25 + (seed * 7) % 50),
      nh3: Math.round(5 + (seed * 3) % 15)
    };

    const usAqiData = this.convertToUSAQI(europeanAqi, mockComponents);
    
    const aqi = {
      value: usAqiData.value,
      category: usAqiData.category,
      components: mockComponents,
      healthRecommendations: usAqiData.healthRecommendations
    };

    const alerts: WeatherAlert[] = [];
    
    if (temperature > 42) {
      alerts.push({
        id: 'heat-warning',
        title: 'Extreme Heat Warning',
        description: 'Dangerous heat conditions. Avoid outdoor activities during peak hours.',
        severity: 'severe',
        start: 'Now',
        end: 'Until evening',
        source: 'Weather Service'
      });
    }

    if (windSpeed > 30) {
      alerts.push({
        id: 'wind-warning',
        title: 'High Wind Advisory',
        description: 'Strong winds expected. Secure loose objects.',
        severity: 'moderate',
        start: 'Now',
        end: 'Next 6 hours',
        source: 'Weather Service'
      });
    }

    if (aqi.value >= 151) {
      alerts.push({
        id: 'air-quality-warning',
        title: 'Unhealthy Air Quality Alert',
        description: `Air quality is ${aqi.category.toLowerCase()}. ${aqi.healthRecommendations[0]}`,
        severity: aqi.value >= 201 ? 'severe' : 'moderate',
        start: 'Now',
        end: 'Until further notice',
        source: 'Air Quality Monitor'
      });
    }

    const feelsLike = Math.round(temperature + (humidity > 70 ? 2 : 0) + (windSpeed > 20 ? -2 : 0));
    const dewPoint = Math.round(temperature - ((100 - humidity) / 5));
    
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, Math.round(30 + lat * 0.5), 0, 0);
    const sunset = new Date(now);
    sunset.setHours(18, Math.round(30 - lat * 0.5), 0, 0);

    return {
      location: locationName,
      coordinates: [lat, lon],
      temperature,
      feelsLike,
      description,
      humidity,
      windSpeed,
      windDirection: Math.round((seed * 11) % 360),
      visibility: Math.round(8 + (seed % 7)),
      pressure,
      uvIndex: Math.min(11, Math.round(2 + (40 - Math.abs(lat)) / 5)),
      dewPoint,
      cloudCover,
      icon,
      alerts,
      lastUpdated: new Date(),
      sunrise: sunrise.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      sunset: sunset.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      aqi,
      country: locationName.includes(',') ? locationName.split(',').pop()?.trim() : 'IN',
      state: locationName.includes(',') ? locationName.split(',')[1]?.trim() : undefined
    };
  }

  async searchLocations(query: string): Promise<LocationResult[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = this.getCachedData<LocationResult[]>(cacheKey);
    if (cached) return cached;
    
    try {
      if (this.isOfflineMode) {
        throw new Error('Offline mode - using local search');
      }
      
      const data = await this.fetchWeatherAPI<LocationResult[]>(`/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8`);
      
      this.setCachedData(cacheKey, data);
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.warn('Location search API failed, using local search:', error);
      
      const filtered = this.MOCK_LOCATIONS.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.state?.toLowerCase().includes(query.toLowerCase()) ||
        location.country.toLowerCase().includes(query.toLowerCase())
      );
      
      this.setCachedData(cacheKey, filtered);
      return filtered;
    }
  }

  async getLocationByCoordinates(lat: number, lon: number): Promise<LocationResult | null> {
    const cacheKey = `reverse:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    const cached = this.getCachedData<LocationResult[]>(cacheKey);
    if (cached && cached.length > 0) return cached[0];
    
    try {
      if (this.isOfflineMode) {
        throw new Error('Offline mode - using closest location');
      }
      
      const data = await this.fetchWeatherAPI<LocationResult[]>(`/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1`);
      
      this.setCachedData(cacheKey, data);
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
      
    } catch (error) {
      console.warn('Reverse geocoding API failed, using closest mock location:', error);
      
      let closest = this.MOCK_LOCATIONS[0];
      let minDistance = this.getDistance(lat, lon, closest.lat, closest.lon);
      
      for (const location of this.MOCK_LOCATIONS) {
        const distance = this.getDistance(lat, lon, location.lat, location.lon);
        if (distance < minDistance) {
          minDistance = distance;
          closest = location;
        }
      }
      
      return closest;
    }
  }

  async getComprehensiveWeatherData(lat: number, lon: number, locationName?: string): Promise<WeatherData> {
    const cacheKey = `weather:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    const cached = this.getCachedData<WeatherData>(cacheKey);
    if (cached) {
      return {
        ...cached,
        lastUpdated: new Date(cached.lastUpdated)
      };
    }

    try {
      if (this.isOfflineMode) {
        throw new Error('Offline mode - using mock data');
      }

      const [weatherResult, uvResult, aqiResult] = await Promise.allSettled([
        this.fetchWeatherAPI<any>(`/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`),
        this.fetchWeatherAPI<any>(`/data/2.5/uvi?lat=${lat}&lon=${lon}`),
        this.fetchWeatherAPI<any>(`/data/2.5/air_pollution?lat=${lat}&lon=${lon}`)
      ]);

      if (weatherResult.status !== 'fulfilled') {
        throw new Error('Failed to fetch weather data');
      }

      const data = weatherResult.value;
      
      let aqi = undefined;
      if (aqiResult.status === 'fulfilled' && aqiResult.value?.list?.[0]) {
        const aqiInfo = aqiResult.value.list[0];
        const usAqiData = this.convertToUSAQI(aqiInfo.main.aqi, aqiInfo.components);
        
        aqi = {
          value: usAqiData.value,
          category: usAqiData.category,
          components: {
            co: aqiInfo.components.co,
            no: aqiInfo.components.no,
            no2: aqiInfo.components.no2,
            o3: aqiInfo.components.o3,
            so2: aqiInfo.components.so2,
            pm2_5: aqiInfo.components.pm2_5,
            pm10: aqiInfo.components.pm10,
            nh3: aqiInfo.components.nh3
          },
          healthRecommendations: usAqiData.healthRecommendations
        };
      }

      const processedWeatherData: WeatherData = {
        location: locationName || `${data.name}, ${data.sys.country}`,
        coordinates: [lat, lon],
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        windDirection: data.wind.deg || 0,
        visibility: Math.round(data.visibility / 1000),
        pressure: data.main.pressure,
        uvIndex: uvResult.status === 'fulfilled' ? Math.round(uvResult.value?.value || 0) : 0,
        dewPoint: Math.round(data.main.temp - ((100 - data.main.humidity) / 5)),
        cloudCover: data.clouds.all,
        icon: data.weather[0].icon,
        alerts: this.generateWeatherAlerts(data, aqi),
        lastUpdated: new Date(),
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        aqi,
        country: data.sys.country,
      };
      
      this.setCachedData(cacheKey, processedWeatherData);
      this.isOfflineMode = false;
      
      return processedWeatherData;
      
    } catch (error) {
      console.warn('Weather API failed, using mock data:', error);
      this.isOfflineMode = true;
      
      const mockData = this.generateMockWeatherData(lat, lon, locationName || 'Selected Location');
      this.setCachedData(cacheKey, mockData);
      return mockData;
    }
  }

  private generateWeatherAlerts(weatherData: any, aqi?: any): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    
    if (weatherData.main.temp > 40) {
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

    if (weatherData.wind.speed > 14) {
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

    if (weatherData.weather[0].main.toLowerCase().includes('thunderstorm')) {
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

    if (aqi && aqi.value >= 151) {
      alerts.push({
        id: 'air-quality-warning',
        title: `${aqi.category} Air Quality Alert`,
        description: `Air quality is ${aqi.category.toLowerCase()}. ${aqi.healthRecommendations[0]}`,
        severity: aqi.value >= 201 ? 'severe' : 'moderate',
        start: 'Now',
        end: 'Until further notice',
        source: 'Air Quality Monitor'
      });
    }

    return alerts;
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.fetchWeatherAPI('/data/2.5/weather?q=London&units=metric');
      this.isOfflineMode = false;
      this.apiRetryCount = 0;
      return true;
    } catch (error) {
      console.warn('API connection test failed:', error);
      this.isOfflineMode = true;
      return false;
    }
  }

  getAPIMode(): 'online' | 'offline' {
    return this.isOfflineMode ? 'offline' : 'online';
  }

  setOfflineMode(offline: boolean): void {
    this.isOfflineMode = offline;
    if (!offline) {
      this.apiRetryCount = 0;
    }
  }

  cleanup(): void {
    this.stopLocationTracking();
    this.locationListeners.clear();
    this.clearCache();
  }
}

export const weatherService = new WeatherService();
export type { WeatherData, WeatherAlert, LocationResult, LocationCoordinates };