import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Shield, Bell, Zap, Camera, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bill Management App — Track & Pay All Your Bills in One Place',
  description: 'The easiest way to manage bills worldwide. Track due dates, get reminders, and pay 120+ billers from one dashboard. AI-powered bill scanning included. Free to start.',
  alternates: {
    canonical: 'https://mybillport.com/bill-management',
  },
  openGraph: {
    title: 'Bill Management App — MyBillPort',
    description: 'Track due dates, get smart reminders, and pay 120+ billers from one dashboard. Works worldwide.',
    url: 'https://mybillport.com/bill-management',
  },
};

const billerCategories = [
  { category: 'Electricity', examples: ['Local power companies', 'National grid providers', 'Solar energy providers'] },
  { category: 'Gas & Heating', examples: ['Natural gas utilities', 'Heating oil providers', 'District heating'] },
  { category: 'Water & Sewer', examples: ['Municipal water services', 'Regional water authorities'] },
  { category: 'Internet & TV', examples: ['Major ISPs', 'Cable providers', 'Fiber optic services', 'Streaming platforms'] },
  { category: 'Mobile & Phone', examples: ['National carriers', 'MVNOs', 'Prepaid providers', 'Landline services'] },
  { category: 'Insurance', examples: ['Home insurance', 'Auto insurance', 'Health insurance', 'Life insurance'] },
  { category: 'Subscriptions', examples: ['Netflix', 'Spotify', 'Disney+', 'Apple', 'Amazon Prime', 'Cloud storage'] },
  { category: 'Other', examples: ['Rent & mortgage', 'Gym memberships', 'Loan payments', 'Credit cards'] },
];

export default function BillManagementPage() {
  return (
    <div className="min-h-screen bg-[#1E2A3A] text-white">
      <div className="max-w-4xl mx-auto px-5 py-16 space-y-16">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#4D6A9F]/10 border border-[#4D6A9F]/20 text-[#4D6A9F] text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
            <Globe className="w-3.5 h-3.5" />
            Available worldwide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Bill Management
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D6A9F] to-[#FFB347]">
              Made Simple
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Most people juggle 8-12 recurring bills every month — utilities, telecom, insurance, subscriptions.
            MyBillPort brings them all into one clean dashboard so you never miss a payment again.
          </p>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Start for free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Why people choose MyBillPort</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Camera, title: 'AI Bill Scanning', desc: 'Snap a photo of any bill and our AI extracts the details instantly — vendor, amount, due date, account number.' },
              { icon: Bell, title: 'Smart Reminders', desc: 'Get notified before every due date — by push notification, right on your phone. Never miss a payment.' },
              { icon: Zap, title: 'One-Click Payments', desc: 'Direct links to your biller\'s official payment page. Find your bill, click Pay, done.' },
              { icon: Shield, title: 'Bank-Grade Security', desc: '256-bit encryption, biometric auth, and we never connect to your bank or store payment info.' },
            ].map((f) => (
              <div key={f.title} className="bg-[#263244] border border-white/5 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 bg-[#4D6A9F]/10 rounded-lg flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-[#4D6A9F]" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Manage every type of bill</h2>
          <p className="text-slate-400">
            From electricity and gas to subscriptions and insurance — MyBillPort handles all your bills regardless of where you live.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {billerCategories.map((cat) => (
              <div key={cat.category} className="bg-[#263244] border border-white/5 rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-white">{cat.category}</h3>
                <p className="text-sm text-slate-400">{cat.examples.join(' · ')}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 text-center">120+ billers supported and growing. Add any biller manually too.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How bill management works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Add your bills', desc: 'Upload a photo or PDF and our AI reads the details. Or add manually — takes under a minute either way.' },
              { step: '2', title: 'Get smart reminders', desc: 'Receive push notifications 7 days, 2 days, and the day each bill is due. Works even when the app is closed.' },
              { step: '3', title: 'Pay with one click', desc: 'Click Pay to go directly to your biller\'s official payment portal. No middleman, no fees.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#4D6A9F]/20 rounded-full flex items-center justify-center text-[#4D6A9F] font-bold flex-shrink-0">
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

        <section className="bg-gradient-to-br from-[#4D6A9F]/15 to-[#6BCB77]/10 border border-[#4D6A9F]/15 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready to simplify your bills?</h2>
          <p className="text-slate-400">Free forever plan available. No credit card required.</p>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
