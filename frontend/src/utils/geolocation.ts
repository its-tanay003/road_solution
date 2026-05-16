// Chennai coordinates as fallback for demo
const FALLBACK = { lat: 13.0827, lng: 80.2707 }

export interface GeoPosition { 
  lat: number; 
  lng: number; 
  accuracy: number;
  speed: number | null;
}

function isGeoAvailable(): boolean {
  return !!(
    navigator.geolocation &&
    (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  )
}

export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve) => {
    if (!isGeoAvailable()) {
      console.info('[Geo] Not available — using Chennai demo coordinates')
      resolve({ ...FALLBACK, accuracy: 1000, speed: 0 })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ 
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude, 
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed
      }),
      (err) => {
        console.info('[Geo] Using fallback coordinates. Reason:', err.message)
        resolve({ ...FALLBACK, accuracy: 1000, speed: 0 })
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    )
  })
}

let watchId: number | null = null
export function watchPosition(
  onUpdate: (pos: GeoPosition) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isGeoAvailable()) {
    // Simulate gentle movement for demo
    let { lat, lng } = FALLBACK
    const id = window.setInterval(() => {
      lat += (Math.random() - 0.5) * 0.0002
      lng += (Math.random() - 0.5) * 0.0002
      onUpdate({ lat, lng, accuracy: 50, speed: Math.random() * 5 }) // Random demo speed
    }, 8000)
    return () => clearInterval(id)
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => onUpdate({ 
      lat: pos.coords.latitude, 
      lng: pos.coords.longitude, 
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed
    }),
    (err) => {
      onError?.(new Error(err.message))
      onUpdate({ ...FALLBACK, accuracy: 1000, speed: 0 })
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  )

  return () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
  }
}
