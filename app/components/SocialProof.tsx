'use client';

import { Users, MapPin, Receipt, Shield } from 'lucide-react';

const stats = [
  { icon: Users, value: '2,500+', label: 'Canadians managing bills' },
  { icon: Receipt, value: '120+', label: 'Canadian billers supported' },
  { icon: MapPin, value: '10', label: 'Provinces covered' },
  { icon: Shield, value: '0', label: 'Data breaches, ever' },
];

export function SocialProof() {
  return (
    <section className="py-14 px-5 border-y border-white/5 bg-[#0a1628]">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label} className="space-y-2">
            <div className="w-10 h-10 mx-auto bg-teal-500/10 rounded-xl flex items-center justify-center">
              <s.icon className="w-5 h-5 text-teal-400" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
