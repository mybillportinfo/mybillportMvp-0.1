'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

type CountryStatus = 'live' | 'weeks' | 'months' | 'exploring';

interface CountryData {
  name: string;
  numericId: string;
  status: CountryStatus;
  timeline: string;
}

const countries: CountryData[] = [
  { name: 'Canada', numericId: '124', status: 'live', timeline: 'Live now' },
  { name: 'Australia', numericId: '036', status: 'weeks', timeline: 'Coming in weeks' },
  { name: 'New Zealand', numericId: '554', status: 'weeks', timeline: 'Coming in weeks' },
  { name: 'United Kingdom', numericId: '826', status: 'months', timeline: 'Coming in months' },
  { name: 'France', numericId: '250', status: 'months', timeline: 'Coming in months' },
  { name: 'Germany', numericId: '276', status: 'months', timeline: 'Coming in months' },
  { name: 'India', numericId: '356', status: 'months', timeline: 'Coming in months' },
  { name: 'South Africa', numericId: '710', status: 'exploring', timeline: 'Exploring' },
  { name: 'Brazil', numericId: '076', status: 'exploring', timeline: 'Exploring' },
  { name: 'Mexico', numericId: '484', status: 'exploring', timeline: 'Exploring' },
  { name: 'Indonesia', numericId: '360', status: 'exploring', timeline: 'Exploring' },
  { name: 'Malaysia', numericId: '458', status: 'exploring', timeline: 'Exploring' },
  { name: 'Philippines', numericId: '608', status: 'exploring', timeline: 'Exploring' },
  { name: 'Thailand', numericId: '764', status: 'exploring', timeline: 'Exploring' },
  { name: 'Vietnam', numericId: '704', status: 'exploring', timeline: 'Exploring' },
];

const statusColors: Record<CountryStatus, { fill: string; stroke: string }> = {
  live: { fill: '#10b981', stroke: '#34d399' },
  weeks: { fill: '#f59e0b', stroke: '#fbbf24' },
  months: { fill: '#3b82f6', stroke: '#60a5fa' },
  exploring: { fill: '#6b7280', stroke: '#9ca3af' },
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
            Bill management without borders. Expanding worldwide.
          </p>
        </div>

        <div className="relative bg-[#0d1a2d] border border-white/5 rounded-2xl p-4 md:p-6 overflow-hidden">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 160, center: [10, 10] }}
            width={800}
            height={420}
            className="w-full h-auto"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const country = countries.find((c) => c.numericId === geo.id);
                  const fillColor = country
                    ? statusColors[country.status].fill
                    : '#1e293b';
                  const strokeColor = country
                    ? statusColors[country.status].stroke
                    : '#334155';
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={country ? 1 : 0.3}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          fill: country ? statusColors[country.status].stroke : '#334155',
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
            <span className="text-slate-300">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Coming in weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Coming in months</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-500" />
            <span className="text-slate-300">Exploring</span>
          </div>
        </div>
      </div>
    </section>
  );
}
