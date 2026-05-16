import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { getCurrentPosition } from '../utils/geolocation';

interface WeatherAlert {
  message: string;
  severity: 'warning' | 'danger';
}

async function fetchWeatherAlert(lat: number, lon: number): Promise<WeatherAlert | null> {
  try {
    // Open-Meteo free API — precipitation + wind
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,windspeed_10m,weathercode&timezone=auto`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const { precipitation, windspeed_10m: wind, weathercode: code } = data.current;

    // Weather codes: 51-67 = rain, 71-77 = snow, 80-99 = heavy/storms
    if (code >= 95)  return { message: '⛈ Thunderstorm alert — extreme road risk', severity: 'danger' };
    if (code >= 80)  return { message: '🌧 Heavy rain alert — elevated road risk', severity: 'warning' };
    if (precipitation > 3) return { message: `☔ ${precipitation}mm/h rain — reduce speed`, severity: 'warning' };
    if (wind > 50)   return { message: `💨 Strong winds ${wind} km/h — drive carefully`, severity: 'warning' };
    return null;
  } catch {
    return null;
  }
}

export function WeatherAlertBanner() {
  const [alert, setAlert] = useState<WeatherAlert | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getCurrentPosition().then(async pos => {
      const a = await fetchWeatherAlert(pos.lat, pos.lng);
      setAlert(a);
    });
  }, []);

  return (
    <AnimatePresence>
      {alert && !dismissed && (
        <motion.div
          key="weather"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          role="alert"
          aria-live="polite"
          className={`mx-4 p-3 flex items-center justify-between gap-3 rounded-2xl border ${
            alert.severity === 'danger' 
              ? 'bg-red/10 border-red/20' 
              : 'bg-amber/10 border-amber/20'
          }`}
        >
          <p className={`m-0 font-medium text-[13px] leading-relaxed flex-1 ${
            alert.severity === 'danger' ? 'text-red' : 'text-amber'
          }`}>
            {alert.message}
          </p>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss weather alert"
            className="bg-transparent border-none cursor-pointer p-1 shrink-0 text-white/40 text-lg hover:text-white/60 transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
