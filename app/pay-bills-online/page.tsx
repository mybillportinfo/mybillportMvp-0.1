import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pay Bills Online — One-Click Payment to 120+ Billers Worldwide',
  description: 'Pay your bills online with one click. MyBillPort connects you directly to 120+ billers worldwide. No middleman, no fees. Free to use.',
  alternates: {
    canonical: 'https://mybillport.com/pay-bills-online',
  },
  openGraph: {
    title: 'Pay Bills Online — MyBillPort',
    description: 'One-click payment links to 120+ billers worldwide. No middleman, no fees.',
    url: 'https://mybillport.com/pay-bills-online',
  },
};

const categories = [
  { name: 'Electricity & Power', examples: ['Electric utilities', 'Solar providers', 'Grid companies', 'Energy co-ops'] },
  { name: 'Gas & Heating', examples: ['Natural gas providers', 'Propane services', 'Heating oil', 'District heating'] },
  { name: 'Water & Sewer', examples: ['Municipal water', 'Regional water boards', 'Waste water services'] },
  { name: 'Internet & Cable', examples: ['Broadband ISPs', 'Fiber providers', 'Cable TV', 'Satellite services'] },
  { name: 'Mobile & Phone', examples: ['National carriers', 'Prepaid providers', 'MVNOs', 'Landline services'] },
  { name: 'Insurance', examples: ['Home', 'Auto', 'Health', 'Life', 'Renters'] },
  { name: 'Streaming & Digital', examples: ['Netflix', 'Disney+', 'Spotify', 'Apple', 'Amazon Prime', 'YouTube Premium'] },
  { name: 'Other Bills', examples: ['Rent', 'Mortgage', 'Gym', 'Loans', 'Credit cards', 'Childcare'] },
];

export default function PayBillsOnlinePage() {
  return (
    <div className="min-h-screen bg-[#1E2A3A] text-white">
      <div className="max-w-4xl mx-auto px-5 py-16 space-y-16">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#6BCB77]/10 border border-[#6BCB77]/20 text-[#6BCB77] text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
            <Globe className="w-3.5 h-3.5" />
            Works worldwide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Pay Bills Online
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D6A9F] to-[#FFB347]">
              With One Click
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop bookmarking dozens of different biller websites. MyBillPort gives you one-click payment links
            to your billers — utilities, telecom, insurance, and more — no matter where you are.
          </p>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Start paying bills smarter <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How one-click bill payment works</h2>
          <div className="bg-[#263244] border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex gap-4 items-start">
              <span className="text-[#4D6A9F] font-bold text-lg">1.</span>
              <p className="text-slate-300">Add your bill to MyBillPort — snap a photo, upload a PDF, or type it in manually.</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-[#4D6A9F] font-bold text-lg">2.</span>
              <p className="text-slate-300">When it's time to pay, click the <span className="text-white font-medium">Pay</span> button on your bill card.</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-[#4D6A9F] font-bold text-lg">3.</span>
              <p className="text-slate-300">You're taken directly to your biller's official payment page — no middleman, no fees.</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            MyBillPort doesn't process payments. We redirect you to the official biller website so you pay them directly, safely.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Bills you can manage</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div key={c.name} className="bg-[#263244] border border-white/5 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-white">{c.name}</h3>
                <ul className="space-y-1.5">
                  {c.examples.map((b) => (
                    <li key={b} className="text-sm text-slate-400 flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-[#6BCB77]" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 text-center">
            120+ billers supported and growing. You can also add any biller manually.
          </p>
        </section>

        <section className="bg-gradient-to-br from-[#4D6A9F]/15 to-[#6BCB77]/10 border border-[#4D6A9F]/15 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">All your billers, one dashboard</h2>
          <p className="text-slate-400">Free to start. No credit card required. 120+ billers supported worldwide.</p>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
