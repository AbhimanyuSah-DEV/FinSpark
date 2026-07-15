/**
 * Fetch the user's approximate location from their public IP address.
 * Uses ipapi.co — free, no API key, works client-side.
 * Falls back gracefully if blocked or unavailable.
 */
export interface GeoLocation {
  city: string
  region: string
  country: string
  latitude: number
  longitude: number
  display: string   // "Mumbai, Maharashtra, IN"
}
export interface GeoData {
  location: string
  ip: string
}

let _cachedGeo: GeoData | null = null

export const getGeoDataFromIP = async (): Promise<GeoData> => {
  if (_cachedGeo) return _cachedGeo

  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error('ipapi failed')
    const data = await res.json()
    const parts = [data.city, data.region, data.country_code].filter(Boolean)
    _cachedGeo = {
      location: parts.join(', ') || 'Unknown',
      ip: data.ip || 'Unknown'
    }
    return _cachedGeo
  } catch {
    // Fallback: try ip-api.com
    try {
      const res = await fetch('http://ip-api.com/json/?fields=city,regionName,countryCode,query', {
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) throw new Error('ip-api failed')
      const data = await res.json()
      const parts = [data.city, data.regionName, data.countryCode].filter(Boolean)
      _cachedGeo = {
        location: parts.join(', ') || 'Unknown',
        ip: data.query || 'Unknown'
      }
      return _cachedGeo
    } catch {
      return { location: 'Unknown', ip: 'Unknown' }
    }
  }
}
