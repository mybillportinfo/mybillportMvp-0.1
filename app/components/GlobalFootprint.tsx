'use client';

import { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';

const geoUrl = '/world-110m.json';

type CountryStatus = 'live' | 'weeks' | 'months' | 'exploring';

interface CountryData {
  name: string;
  numericId: string;
  status: CountryStatus;
  timeline: string;
}

const countries: CountryData[] = [
  { name: 'United States', numericId: '840', status: 'live', timeline: 'Live now' },
  { name: 'Canada', numericId: '124', status: 'live', timeline: 'Live now' },
  { name: 'United Kingdom', numericId: '826', status: 'live', timeline: 'Live now' },
  { name: 'Australia', numericId: '036', status: 'live', timeline: 'Live now' },
  { name: 'New Zealand', numericId: '554', status: 'weeks', timeline: 'Coming in weeks' },
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

const countryMap = new Map(countries.map(c => [c.numericId, c]));

const statusColors: Record<CountryStatus, string> = {
  live: '#4D6A9F',
  weeks: '#FFB347',
  months: '#6BCB77',
  exploring: '#6b7280',
};

const defaultFill = '#2a3a52';
const defaultStroke = '#3d4f66';

const MapChart = memo(function MapChart() {
  return (
    <ComposableMap
      projection="geoEqualEarth"
      projectionConfig={{ scale: 155, center: [10, 5] }}
      width={800}
      height={400}
      style={{ width: '100%', height: 'auto' }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const country = geo.id ? countryMap.get(geo.id) : undefined;
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={country ? statusColors[country.status] : defaultFill}
                stroke={country ? statusColors[country.status] : defaultStroke}
                strokeWidth={country ? 1.2 : 0.3}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none', fill: country ? statusColors[country.status] : '#3d4f66' },
                  pressed: { outline: 'none' },
                } as any}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
});

export function GlobalFootprint() {
  return (
    <section className="py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[#4D6A9F] text-sm font-semibold uppercase tracking-wider mb-2">Global expansion</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Our global roadmap
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Bill management without borders. Expanding worldwide.
          </p>
        </div>

        <div className="bg-[#263244] border border-white/5 rounded-2xl p-4 md:p-8 overflow-hidden">
          <MapChart />
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#4D6A9F]" />
            <span className="text-slate-300">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFB347]" />
            <span className="text-slate-300">Coming in weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#6BCB77]" />
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
