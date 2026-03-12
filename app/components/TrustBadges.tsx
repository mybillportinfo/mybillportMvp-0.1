'use client';

import { ShieldCheck, Lock, Globe, Fingerprint } from 'lucide-react';

const badges = [
  {
    icon: Lock,
    title: '256-bit Encryption',
    description: 'Bank-grade AES-256 encryption protects your data in transit and at rest.',
  },
  {
    icon: ShieldCheck,
    title: 'SOC 2 Practices',
    description: 'We follow SOC 2 security practices for access control and monitoring.',
  },
  {
    icon: Globe,
    title: '100% Canadian',
    description: 'Built in Canada, for Canadians. Supporting 120+ Canadian billers.',
  },
  {
    icon: Fingerprint,
    title: 'Biometric Security',
    description: 'Optional fingerprint or face verification before every payment.',
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Your security is our foundation
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            We never sell your data, never connect to your bank, and never store payment information.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="bg-[#0d1a2d] border border-white/5 rounded-xl p-5 text-center space-y-3 hover:border-teal-500/20 transition-colors"
            >
              <div className="w-12 h-12 mx-auto bg-teal-500/10 rounded-xl flex items-center justify-center">
                <badge.icon className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">{badge.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
