import React, { useState, useEffect, useMemo } from 'react';

const DEATH_INTERVAL_SEC = 204;
const INJURY_RATIO = 2.88;

export const IndiaStatsTicker: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const secondsSinceYear = (now.getTime() - startOfYear.getTime()) / 1000;
    const secondsSinceDay = (now.getTime() - startOfDay.getTime()) / 1000;

    const deathsYear = Math.floor(secondsSinceYear / DEATH_INTERVAL_SEC);
    const deathsToday = Math.floor(secondsSinceDay / DEATH_INTERVAL_SEC);
    const injuriesToday = Math.floor(deathsToday * INJURY_RATIO);

    return { deathsYear, deathsToday, injuriesToday };
  }, [now]);

  return (
    <div className="flex items-center justify-center gap-8 h-full">
      <div className="flex items-center gap-2">
        <span className="text-(--clr-text-2) text-[9px] font-mono tracking-widest uppercase">DEATHS TODAY</span>
        <Odometer value={stats.deathsToday} color="text-(--clr-red)" />
      </div>

      <div className="flex items-center gap-2 border-l border-(--clr-border) pl-8">
        <span className="text-(--clr-text-2) text-[9px] font-mono tracking-widest uppercase">THIS YEAR</span>
        <Odometer value={stats.deathsYear} color="text-(--clr-text)" />
      </div>

      <div className="flex items-center gap-2 border-l border-(--clr-border) pl-8">
        <span className="text-(--clr-text-2) text-[9px] font-mono tracking-widest uppercase">SAVED BY RSOS</span>
        <span className="font-mono text-xs font-bold text-(--clr-green)">1,402</span>
      </div>
    </div>
  );
};

const Odometer: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  const digits = value.toString().padStart(value > 999 ? 6 : 2, '0').split('');
  
  return (
    <div className={`flex overflow-hidden h-4 font-mono font-bold text-xs ${color}`}>
      {digits.map((digit, idx) => (
        <div 
          key={idx} 
          className="relative w-[7px] flex flex-col transition-transform duration-500" 
          style={{ transform: `translateY(-${parseInt(digit) * 10}%)` } as React.CSSProperties}
        >
          {[0,1,2,3,4,5,6,7,8,9].map(num => (
            <span key={num} className="h-4 flex items-center justify-center">{num}</span>
          ))}
        </div>
      ))}
    </div>
  );
};
