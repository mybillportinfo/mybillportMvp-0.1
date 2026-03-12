import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pay Bills Online in Canada — One-Click Payment to 120+ Billers',
  description: 'Pay your Canadian bills online with one click. MyBillPort connects you directly to Rogers, Bell, Telus, Hydro One, BC Hydro, and 120+ more billers. No middleman, no fees.',
  alternates: {
    canonical: 'https://mybillport.com/pay-bills-online-canada',
  },
  openGraph: {
    title: 'Pay Bills Online in Canada — MyBillPort',
    description: 'One-click payment links to 120+ Canadian billers. No middleman, no fees.',
    url: 'https://mybillport.com/pay-bills-online-canada',
  },
};

const provinces = [
  { name: 'Ontario', billers: ['Hydro One', 'Toronto Hydro', 'Enbridge Gas', 'Alectra Utilities'] },
  { name: 'British Columbia', billers: ['BC Hydro', 'FortisBC', 'ICBC'] },
  { name: 'Alberta', billers: ['ATCO', 'EPCOR', 'Direct Energy'] },
  { name: 'Quebec', billers: ['Hydro-Québec', 'Énergir', 'Videotron'] },
  { name: 'Saskatchewan', billers: ['SaskPower', 'SaskEnergy', 'SaskTel'] },
  { name: 'Manitoba', billers: ['Manitoba Hydro', 'MPI'] },
];

export default function PayBillsOnlineCanadaPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-4xl mx-auto px-5 py-16 space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Pay Bills Online in Canada
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              With One Click
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop bookmarking 10 different biller websites. MyBillPort gives you one-click payment links
            to every major Canadian biller — utilities, telecom, insurance, and more.
          </p>
          <Link href="/login">
            <button className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Start paying bills smarter <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How one-click bill payment works</h2>
          <div className="bg-[#0d1a2d] border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex gap-4 items-start">
              <span className="text-teal-400 font-bold text-lg">1.</span>
              <p className="text-slate-300">Add your bill to MyBillPort — snap a photo, upload a PDF, or type it in manually.</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-teal-400 font-bold text-lg">2.</span>
              <p className="text-slate-300">When it's time to pay, click the <span className="text-white font-medium">Pay</span> button on your bill card.</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-teal-400 font-bold text-lg">3.</span>
              <p className="text-slate-300">You're taken directly to your biller's official payment page — no middleman, no fees.</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            MyBillPort doesn't process payments. We redirect you to the official biller website so you pay them directly, safely.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Billers by province</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {provinces.map((p) => (
              <div key={p.name} className="bg-[#0d1a2d] border border-white/5 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <ul className="space-y-1.5">
                  {p.billers.map((b) => (
                    <li key={b} className="text-sm text-slate-400 flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-teal-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            Plus national providers: Rogers, Bell, Telus, Fido, Koodo, Freedom Mobile, Shaw, Netflix, Disney+, Spotify, and 90+ more.
          </p>
        </section>

        <section className="bg-gradient-to-br from-teal-900/30 to-cyan-900/10 border border-teal-500/15 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">All your billers, one dashboard</h2>
          <p className="text-slate-400">Free to start. No credit card required. Supports 120+ Canadian billers.</p>
          <Link href="/login">
            <button className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Get started free <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
}
