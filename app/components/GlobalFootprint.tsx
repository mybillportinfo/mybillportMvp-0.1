'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';

type CountryStatus = 'live' | 'weeks' | 'months' | 'exploring';

interface CountryData {
  name: string;
  isoA3: string;
  status: CountryStatus;
  timeline: string;
}

const countries: CountryData[] = [
  { name: 'Canada', isoA3: 'CAN', status: 'live', timeline: 'Live now' },
  { name: 'Australia', isoA3: 'AUS', status: 'weeks', timeline: 'Coming in weeks' },
  { name: 'New Zealand', isoA3: 'NZL', status: 'weeks', timeline: 'Coming in weeks' },
  { name: 'United Kingdom', isoA3: 'GBR', status: 'months', timeline: 'Coming in months' },
  { name: 'France', isoA3: 'FRA', status: 'months', timeline: 'Coming in months' },
  { name: 'Germany', isoA3: 'DEU', status: 'months', timeline: 'Coming in months' },
  { name: 'India', isoA3: 'IND', status: 'months', timeline: 'Coming in months' },
  { name: 'South Africa', isoA3: 'ZAF', status: 'exploring', timeline: 'Exploring' },
  { name: 'Brazil', isoA3: 'BRA', status: 'exploring', timeline: 'Exploring' },
  { name: 'Mexico', isoA3: 'MEX', status: 'exploring', timeline: 'Exploring' },
  { name: 'Indonesia', isoA3: 'IDN', status: 'exploring', timeline: 'Exploring' },
  { name: 'Malaysia', isoA3: 'MYS', status: 'exploring', timeline: 'Exploring' },
  { name: 'Philippines', isoA3: 'PHL', status: 'exploring', timeline: 'Exploring' },
  { name: 'Thailand', isoA3: 'THA', status: 'exploring', timeline: 'Exploring' },
  { name: 'Vietnam', isoA3: 'VNM', status: 'exploring', timeline: 'Exploring' },
];

const statusColors: Record<CountryStatus, { fill: string; stroke: string; dashed?: boolean }> = {
  live: { fill: '#10b981', stroke: '#10b981' },
  weeks: { fill: '#fef3c7', stroke: '#f59e0b', dashed: true },
  months: { fill: '#1e3a5f', stroke: '#3b82f6', dashed: true },
  exploring: { fill: 'transparent', stroke: '#4b5563', dashed: false },
};

export function GlobalFootprint() {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent, country: CountryData) => {
    setTooltipContent(`${country.name} — ${country.timeline}`);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  return (
    <section className="py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-wider mb-2">Global expansion</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Our global roadmap
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Starting in Canada, expanding worldwide. Bill management without borders.
          </p>
        </div>

        <div className="relative bg-[#0d1a2d] border border-white/5 rounded-2xl p-4 md:p-6">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 140, center: [0, 20] }}
            className="w-full h-auto"
            style={{ maxHeight: '400px' }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const country = countries.find((c) => c.isoA3 === geo.properties.ISO_A3);
                  const style = country
                    ? statusColors[country.status]
                    : { fill: '#111d30', stroke: '#1e293b' };
                  const strokeDasharray = style.dashed ? '4,3' : undefined;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={0.5}
                      strokeDasharray={strokeDasharray}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          fill: country ? style.fill : '#1a2740',
                          outline: 'none',
                          cursor: country ? 'pointer' : 'default',
                        },
                        pressed: { outline: 'none' },
                      } as any}
                      onMouseMove={(e) => country && handleMouseMove(e, country)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {tooltipContent && (
            <div
              className="fixed bg-[#0d1a2d] border border-white/10 text-white text-sm px-3 py-1.5 rounded-lg pointer-events-none z-50 shadow-lg"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 30,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {tooltipContent}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Live — Canada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border-2 border-amber-500 bg-amber-100" />
            <span className="text-slate-300">Weeks — Australia, NZ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border-2 border-blue-500 bg-[#1e3a5f]" />
            <span className="text-slate-300">Months — UK, EU, India</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border border-gray-500 bg-transparent" />
            <span className="text-slate-300">Exploring — Americas, Africa, SE Asia</span>
          </div>
        </div>
      </div>
    </section>
  );
}
