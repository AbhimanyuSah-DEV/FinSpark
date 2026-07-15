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
/**
 * Parse a raw navigator.userAgent string into a human-friendly device name.
 * Examples:
 *   "Chrome on Windows"
 *   "Safari on iPhone"
 *   "Firefox on Android"
 *   "Chrome on macOS"
 */
export const parseUserAgent = (ua: string): string => {
  if (!ua) return 'Unknown Device'

  // ── OS detection ────────────────────────────────────────
  let os = 'Unknown OS'
  if (/iPhone/i.test(ua))                    os = 'iPhone'
  else if (/iPad/i.test(ua))                 os = 'iPad'
  else if (/Android/i.test(ua))              os = 'Android'
  else if (/Windows NT/i.test(ua))           os = 'Windows'
  else if (/Macintosh|Mac OS X/i.test(ua))   os = 'macOS'
  else if (/Linux/i.test(ua))                os = 'Linux'
  else if (/CrOS/i.test(ua))                 os = 'ChromeOS'

  // ── Browser detection (order matters) ───────────────────
  let browser = 'Browser'
  if (/Edg\//i.test(ua))                     browser = 'Edge'
  else if (/OPR|Opera/i.test(ua))            browser = 'Opera'
  else if (/SamsungBrowser/i.test(ua))       browser = 'Samsung Browser'
  else if (/Firefox|FxiOS/i.test(ua))        browser = 'Firefox'
  else if (/CriOS/i.test(ua))               browser = 'Chrome'  // Chrome on iOS
  else if (/Chrome/i.test(ua))              browser = 'Chrome'
  else if (/Safari/i.test(ua))              browser = 'Safari'

  return `${browser} on ${os}`
}
