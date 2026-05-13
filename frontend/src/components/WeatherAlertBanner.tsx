import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    navigator.geolocation.getCurrentPosition(async pos => {
      const a = await fetchWeatherAlert(pos.coords.latitude, pos.coords.longitude);
      setAlert(a);
    }, undefined, { enableHighAccuracy: false, timeout: 5000 });
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
          style={{
            margin: '0 var(--sp-4)',
            background: alert.severity === 'danger' ? 'rgba(255,23,68,0.12)' : 'rgba(255,179,0,0.12)',
            border: `1px solid ${alert.severity === 'danger' ? 'var(--red)' : 'var(--amber)'}40`,
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}
        >
          <p style={{
            margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
            color: alert.severity === 'danger' ? 'var(--red)' : 'var(--amber)',
            lineHeight: 1.4,
          }}>
            {alert.message}
          </p>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss weather alert"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, flexShrink: 0,
              color: 'var(--text-hint)', fontSize: 18,
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
