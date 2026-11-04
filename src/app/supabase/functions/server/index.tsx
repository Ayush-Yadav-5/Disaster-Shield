import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://*.supabase.co'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

// Health check endpoint
app.get('/make-server-3f6e5e28/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Weather API proxy endpoints
const OPENWEATHER_API_KEY = '6b0e4f51ec59bbaf14594ef24676f8c0'
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const OPENWEATHER_GEO_URL = 'https://api.openweathermap.org/geo/1.0'

// Cache for API responses to reduce external API calls
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  return null
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

async function fetchWithCache<T>(url: string): Promise<T> {
  const cacheKey = btoa(url)
  const cached = getCachedData<T>(cacheKey)
  
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}

// Current weather endpoint
app.get('/make-server-3f6e5e28/weather/current/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat')
    const lon = c.req.param('lon')
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400)
    }
    
    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    const data = await fetchWithCache(url)
    
    return c.json(data)
  } catch (error) {
    console.error('Current weather fetch error:', error)
    return c.json({ error: 'Failed to fetch weather data' }, 500)
  }
})

// UV Index endpoint
app.get('/make-server-3f6e5e28/weather/uv/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat')
    const lon = c.req.param('lon')
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400)
    }
    
    const url = `${OPENWEATHER_BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    const data = await fetchWithCache(url)
    
    return c.json(data)
  } catch (error) {
    console.error('UV Index fetch error:', error)
    return c.json({ error: 'Failed to fetch UV data', value: 0 })
  }
})

// Air Quality endpoint
app.get('/make-server-3f6e5e28/weather/air-quality/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat')
    const lon = c.req.param('lon')
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400)
    }
    
    const url = `${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    const data = await fetchWithCache(url)
    
    return c.json(data)
  } catch (error) {
    console.error('Air Quality fetch error:', error)
    return c.json({ error: 'Failed to fetch air quality data', list: [{ main: { aqi: 0 } }] })
  }
})

// Location search endpoint
app.get('/make-server-3f6e5e28/weather/search/:query', async (c) => {
  try {
    const query = c.req.param('query')
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400)
    }
    
    const url = `${OPENWEATHER_GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`
    const data = await fetchWithCache(url)
    
    return c.json(data)
  } catch (error) {
    console.error('Location search error:', error)
    return c.json({ error: 'Failed to search locations' }, 500)
  }
})

// Reverse geocoding endpoint
app.get('/make-server-3f6e5e28/weather/reverse/:lat/:lon', async (c) => {
  try {
    const lat = c.req.param('lat')
    const lon = c.req.param('lon')
    
    if (!lat || !lon) {
      return c.json({ error: 'Latitude and longitude are required' }, 400)
    }
    
    const url = `${OPENWEATHER_GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
    const data = await fetchWithCache(url)
    
    return c.json(data)
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return c.json({ error: 'Failed to reverse geocode' }, 500)
  }
})

// Comprehensive weather data endpoint
app.get('/make-server-3f6e5e28/weather/comprehensive/:lat/:lon', async (c) => {
  try {
    const lat = parseFloat(c.req.param('lat') || '0')
    const lon = parseFloat(c.req.param('lon') || '0')
    const locationName = c.req.query('location')
    
    if (!lat || !lon) {
      return c.json({ error: 'Valid latitude and longitude are required' }, 400)
    }
    
    // Fetch all weather data concurrently
    const [weatherResult, uvResult, aqResult, locationResult] = await Promise.allSettled([
      fetchWithCache(`${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
      fetchWithCache(`${OPENWEATHER_BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`),
      fetchWithCache(`${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`),
      locationName ? Promise.resolve(null) : fetchWithCache(`${OPENWEATHER_GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`)
    ])

    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null
    if (!weather) {
      throw new Error('Failed to fetch weather data')
    }

    // Calculate dew point using Magnus formula
    const calculateDewPoint = (temperature: number, humidity: number): number => {
      const a = 17.27
      const b = 237.7
      const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100)
      return (b * alpha) / (a - alpha)
    }

    const dewPoint = calculateDewPoint(weather.main.temp, weather.main.humidity)

    // Format times
    const formatTime = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    // Generate alerts based on weather conditions
    const alerts: any[] = []
    
    if (weather.main.temp > 40) {
      alerts.push({
        id: 'heat-warning',
        title: 'Heat Wave Warning',
        description: 'Extreme heat conditions. Stay hydrated and avoid outdoor activities.',
        severity: 'severe',
        start: 'Now',
        end: 'Until further notice',
        source: 'OpenWeatherMap'
      })
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
      })
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
      })
    }

    const location = locationName || 
      (locationResult.status === 'fulfilled' && locationResult.value?.[0] ? 
        `${locationResult.value[0].name}, ${locationResult.value[0].state || ''} ${locationResult.value[0].country}`.trim() : 
        'Unknown Location'
      )

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
    }

    return c.json(weatherData)
  } catch (error) {
    console.error('Comprehensive weather data fetch error:', error)
    return c.json({ error: 'Failed to fetch comprehensive weather data' }, 500)
  }
})

// Cache statistics endpoint
app.get('/make-server-3f6e5e28/weather/cache-stats', (c) => {
  return c.json({
    size: cache.size,
    keys: Array.from(cache.keys()).slice(0, 10) // Show first 10 keys for debugging
  })
})

// Clear cache endpoint
app.delete('/make-server-3f6e5e28/weather/cache', (c) => {
  cache.clear()
  return c.json({ message: 'Cache cleared successfully' })
})

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

// Start server
Deno.serve(app.fetch)