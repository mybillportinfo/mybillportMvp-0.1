'use client';

import { Users, Globe, Receipt, Shield } from 'lucide-react';

const stats = [
  { icon: Globe, value: '15+', label: 'Countries on our roadmap' },
  { icon: Receipt, value: '120+', label: 'Billers supported' },
  { icon: Users, value: 'Growing', label: 'Global user base' },
  { icon: Shield, value: '0', label: 'Data breaches, ever' },
];

export function SocialProof() {
  return (
    <section className="py-14 px-5 border-y border-white/5 bg-[#152032]">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label} className="space-y-2">
            <div className="w-10 h-10 mx-auto bg-[#4D6A9F]/10 rounded-xl flex items-center justify-center">
              <s.icon className="w-5 h-5 text-[#4D6A9F]" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
