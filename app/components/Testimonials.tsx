'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Toronto',
    quote: "I used to miss at least one bill every month. Since using MyBillPort, I haven't paid a single late fee in six months. The reminders are a lifesaver.",
    rating: 5,
    avatar: 'SM',
  },
  {
    name: 'Raj P.',
    location: 'Vancouver',
    quote: "The AI bill scanning is incredible — I just snap a photo of my bill and everything fills in automatically. Saves me so much time.",
    rating: 5,
    avatar: 'RP',
  },
  {
    name: 'Marie-Claire D.',
    location: 'Montreal',
    quote: "MyBillPort caught a $40/month increase on my internet bill that I completely missed. The price alert paid for itself instantly.",
    rating: 5,
    avatar: 'MD',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-wider mb-2">What our users say</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Trusted by users around the world
          </h2>
          <p className="text-slate-400">
            Real people, real bill management results.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-[#0d1a2d] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-teal-500/15 transition-colors"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
