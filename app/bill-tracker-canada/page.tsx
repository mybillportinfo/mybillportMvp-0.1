import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, MapPin, Clock, Bell, Brain, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Bill Tracker Canada – Manage Utilities, Internet, Phone | MyBillPort',
  description: 'Looking for a Canadian bill tracker? MyBillPort helps you track Rogers, Hydro, Enbridge and more – all in one dashboard. Free to start.',
  alternates: { canonical: 'https://mybillport.com/bill-tracker-canada' },
  openGraph: {
    title: 'Best Bill Tracker Canada | MyBillPort',
    description: 'Track Rogers, Bell, Enbridge, Toronto Hydro and 120+ Canadian billers in one dashboard.',
    url: 'https://mybillport.com/bill-tracker-canada',
  },
};

const CANADIAN_BILLERS = [
  { category: 'Telecom', billers: ['Rogers', 'Bell Canada', 'TELUS', 'Freedom Mobile', 'Fido', 'Koodo', 'Virgin Plus', 'Public Mobile', 'Chatr', 'Videotron'] },
  { category: 'Internet', billers: ['Rogers Ignite', 'Bell Fibe', 'Shaw/Rogers', 'TekSavvy', 'Oxio', 'Start.ca', 'Distributel', 'Cogeco', 'Eastlink', 'Xplornet'] },
  { category: 'Utilities', billers: ['Enbridge Gas', 'Toronto Hydro', 'Hydro One', 'BC Hydro', 'Hydro-Québec', 'EPCOR', 'ATCO Gas', 'FortisBC', 'Union Gas', 'Alectra Utilities'] },
  { category: 'Insurance', billers: ['Intact Insurance', 'Aviva Canada', 'TD Insurance', 'Sonnet', 'belairdirect', 'Wawanesa', 'Desjardins', 'Co-operators', 'CAA Insurance', 'Allstate Canada'] },
  { category: 'Streaming', billers: ['Netflix', 'Crave', 'Disney+', 'Amazon Prime', 'Apple TV+', 'Spotify', 'YouTube Premium', 'TSN Direct', 'DAZN', 'Apple Music'] },
  { category: 'Financial', billers: ['TD Bank', 'RBC', 'BMO', 'Scotiabank', 'CIBC', 'National Bank', 'Tangerine', 'Simplii', 'PC Financial', 'Desjardins'] },
];

export default function BillTrackerCanadaPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Bill Tracker Canada</span>
        </nav>

        {/* Hero */}
        <header className="space-y-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#6BCB77]" />
            <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">Made for Canadians</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            The Canadian Bill Tracker You've Been Looking For
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Generic bill apps don't understand Canadian billers, billing cycles, or the specific challenges of managing utilities across multiple provinces. MyBillPort was built specifically for Canadians — with support for 120+ billers including Rogers, Bell, Enbridge, Toronto Hydro, BC Hydro, and more.
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>7 min read · Updated March 2026</span>
          </div>
        </header>

        {/* Canadian billing challenges */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">The Canadian Billing Challenge</h2>
          <p className="text-slate-400 leading-relaxed">
            Canadians face some unique bill management challenges that make generic tools fall short:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Provincial Variation',
                body: 'Hydro, gas, and insurance rates vary significantly by province. A tool that doesn\'t understand these differences gives inaccurate comparisons.',
              },
              {
                title: 'High Telecom Bills',
                body: 'Canada has some of the highest mobile and internet rates in the world. Tracking these carefully — and knowing when to switch providers — saves real money.',
              },
              {
                title: 'Seasonal Utility Swings',
                body: 'Heating bills in Ontario or BC can swing dramatically between summer and winter. A good bill tracker flags unusual spikes before you\'re surprised.',
              },
              {
                title: 'Complex Insurance Billing',
                body: 'Home, auto, and tenant insurance renewals often come with mid-year adjustments. Tracking these ensures you\'re never caught off guard.',
              },
            ].map(c => (
              <div key={c.title} className="bg-[#1a2535] border border-white/5 rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-white text-sm">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Supported billers */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">120+ Supported Canadian Billers</h2>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort supports all major Canadian providers across every category. Add any bill manually or scan it with AI — the app recognizes and categorizes it automatically.
          </p>
          <div className="space-y-4">
            {CANADIAN_BILLERS.map(cat => (
              <div key={cat.category} className="bg-[#1a2535] border border-white/5 rounded-xl p-5">
                <p className="text-xs font-semibold text-[#4D6A9F] uppercase tracking-wider mb-3">{cat.category}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.billers.map(b => (
                    <span key={b} className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-sm">Plus hundreds more — if your biller isn't in the list, you can add it manually and MyBillPort will track it the same way.</p>
        </section>

        {/* Why MyBillPort */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Why MyBillPort Works for Canadians</h2>
          <div className="space-y-4">
            {[
              {
                icon: Brain,
                title: 'AI Bill Scanning — Reads Any Canadian Bill',
                body: 'Photograph any Canadian bill or upload a PDF. The AI reads the provider name, account number, amount, and due date automatically — even from Rogers, Bell, or Enbridge format bills.',
              },
              {
                icon: Bell,
                title: 'Push Notifications Before Due Dates',
                body: 'Get a reminder on your phone before every bill is due. Works on iOS and Android. Set your preferred notice period — 3, 5, or 7 days in advance.',
              },
              {
                icon: Zap,
                title: 'Switch & Save — Canadian Provider Comparisons',
                body: 'MyBillPort compares your current telecom and internet bills against competitor rates from Rogers, Fido, Koodo, TekSavvy, and others. If you\'re overpaying, you\'ll see exactly how much you could save by switching.',
              },
              {
                icon: CheckCircle,
                title: 'One-Tap Payment Redirect',
                body: 'When a bill is due, tap "Pay Now" to go directly to your biller\'s official Canadian payment page. No middleman — you pay them directly, securely.',
              },
            ].map(f => (
              <div key={f.title} className="flex gap-4 p-5 bg-[#1a2535] border border-white/5 rounded-xl">
                <div className="w-10 h-10 bg-[#4D6A9F]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-[#4D6A9F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="space-y-4 bg-[#1a2535] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white">Related Guides</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/how-to-track-bills" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> How to track all your bills in one place →
              </Link>
            </li>
            <li>
              <Link href="/avoid-late-fees" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> How to avoid late fees on bills →
              </Link>
            </li>
            <li>
              <Link href="/blog/simple-bill-tracker-for-beginners" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> Simple bill tracker for beginners →
              </Link>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#4D6A9F]/20 to-[#6BCB77]/10 border border-[#4D6A9F]/20 rounded-3xl p-8 text-center space-y-5">
          <h2 className="text-2xl font-bold text-white">Canada's Bill Tracker — Free to Start</h2>
          <p className="text-slate-400 max-w-md mx-auto">Track Rogers, Bell, Enbridge, and 120+ other Canadian billers in one dashboard. Takes 2 minutes to set up.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
