import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Shield, Bell, Zap, Camera } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bill Management in Canada — Track & Pay All Your Bills',
  description: 'The easiest way to manage bills in Canada. Track due dates, get reminders, and pay 120+ Canadian billers from one dashboard. AI-powered bill scanning included. Free to start.',
  alternates: {
    canonical: 'https://mybillport.com/bill-management-canada',
  },
  openGraph: {
    title: 'Bill Management in Canada — MyBillPort',
    description: 'Track due dates, get smart reminders, and pay 120+ Canadian billers from one dashboard.',
    url: 'https://mybillport.com/bill-management-canada',
  },
};

const billers = [
  'Rogers', 'Bell', 'Telus', 'Fido', 'Koodo', 'Freedom Mobile',
  'Hydro One', 'BC Hydro', 'Hydro-Québec', 'Toronto Hydro',
  'Enbridge', 'FortisBC', 'SaskPower', 'Manitoba Hydro',
  'Shaw', 'Cogeco', 'Videotron', 'SaskTel',
  'TD Insurance', 'Intact Insurance', 'Sun Life', 'Manulife',
  'Netflix', 'Disney+', 'Spotify', 'Apple',
];

export default function BillManagementCanadaPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-4xl mx-auto px-5 py-16 space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Bill Management in Canada
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Made Simple
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Canadians juggle an average of 8-12 recurring bills every month — utilities, telecom, insurance, subscriptions.
            MyBillPort brings them all into one clean dashboard so you never miss a payment again.
          </p>
          <Link href="/login" className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Start for free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Why Canadians choose MyBillPort</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Camera, title: 'AI Bill Scanning', desc: 'Snap a photo of any Canadian bill and our AI extracts the details instantly.' },
              { icon: Bell, title: 'Smart Reminders', desc: 'Get notified before every due date — by push notification, right on your phone.' },
              { icon: Zap, title: 'One-Click Payments', desc: 'Direct links to Rogers, Bell, Telus, Hydro, and 120+ more Canadian billers.' },
              { icon: Shield, title: 'Bank-Grade Security', desc: '256-bit encryption, biometric auth, and we never connect to your bank.' },
            ].map((f) => (
              <div key={f.title} className="bg-[#0d1a2d] border border-white/5 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">120+ Canadian billers supported</h2>
          <p className="text-slate-400">
            From major telecom providers to local utilities, MyBillPort supports billers across all 10 provinces.
          </p>
          <div className="flex flex-wrap gap-2">
            {billers.map((b) => (
              <span key={b} className="bg-[#0d1a2d] border border-white/5 text-sm text-slate-300 px-3 py-1.5 rounded-lg">
                {b}
              </span>
            ))}
            <span className="bg-teal-500/10 border border-teal-500/20 text-sm text-teal-400 px-3 py-1.5 rounded-lg">
              + 90 more
            </span>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How Canadian bill management works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Add your bills', desc: 'Upload a photo/PDF or add manually. Our AI reads Canadian bill formats from every province.' },
              { step: '2', title: 'Get smart reminders', desc: 'Receive push notifications 7 days, 2 days, and the day each bill is due.' },
              { step: '3', title: 'Pay with one click', desc: 'Click Pay to go directly to your biller\'s official Canadian payment portal.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-bold flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{s.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-teal-900/30 to-cyan-900/10 border border-teal-500/15 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready to simplify your bills?</h2>
          <p className="text-slate-400">Join 2,500+ Canadians already using MyBillPort. Free forever plan available.</p>
          <Link href="/login" className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
