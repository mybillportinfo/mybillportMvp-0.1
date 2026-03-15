import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Bill Tracker App — Never Miss a Payment',
  description: 'Track all your bills in one app. MyBillPort shows due dates, sends reminders, flags price increases, and connects to 120+ billers. Free to use.',
  alternates: {
    canonical: 'https://mybillport.com/bill-tracker',
  },
  openGraph: {
    title: 'Best Bill Tracker App — MyBillPort',
    description: 'See all your bills, due dates, and payment status in one clean dashboard.',
    url: 'https://mybillport.com/bill-tracker',
  },
};

export default function BillTrackerPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-4xl mx-auto px-5 py-16 space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            The Bill Tracker That
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D6A9F] to-[#FFB347]">
              Actually Works
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Spreadsheets are tedious. Calendar reminders miss context. Bank apps only show what you've already paid.
            MyBillPort gives you a complete picture of every bill — past, present, and upcoming.
          </p>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#4D6A9F] text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Try it free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">What makes MyBillPort different</h2>
          <div className="space-y-4">
            {[
              { title: 'One dashboard for everything', desc: 'Electric, phone, internet, insurance, subscriptions — all in one view with clear status badges: Unpaid, Partial, Paid, Overdue.' },
              { title: 'AI-powered bill import', desc: 'No tedious data entry. Take a photo of your bill and our AI reads the vendor, amount, due date, and account number.' },
              { title: 'Price increase detection', desc: 'MyBillPort tracks your recurring bills and flags when an amount is significantly higher than usual — before the charge hits.' },
              { title: 'Cash flow calendar', desc: 'See your bills and income on a monthly calendar. Know exactly when money goes out and when it comes in.' },
              { title: 'Push notifications', desc: 'Real native notifications on your phone — not just email. Get alerted 7 days, 2 days, and the day of each due date.' },
              { title: 'One-click payment', desc: 'Click Pay and go directly to your biller\'s official website. We support 120+ billers and growing.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-[#4D6A9F] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Bill tracker comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-slate-400 font-medium">Feature</th>
                  <th className="text-center py-3 text-[#4D6A9F] font-semibold">MyBillPort</th>
                  <th className="text-center py-3 text-slate-400 font-medium">Spreadsheets</th>
                  <th className="text-center py-3 text-slate-400 font-medium">Bank Apps</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  ['All bills in one place', true, false, false],
                  ['AI bill scanning', true, false, false],
                  ['Due date reminders', true, false, true],
                  ['Price increase alerts', true, false, false],
                  ['One-click biller payment', true, false, false],
                  ['Works across all billers', true, true, false],
                  ['Free to use', true, true, true],
                ].map(([feature, mbp, sheets, bank]) => (
                  <tr key={feature as string} className="border-b border-white/5">
                    <td className="py-3">{feature as string}</td>
                    <td className="text-center py-3">{mbp ? '✅' : '—'}</td>
                    <td className="text-center py-3">{sheets ? '✅' : '—'}</td>
                    <td className="text-center py-3">{bank ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#4D6A9F]/15 to-[#6BCB77]/10 border border-[#4D6A9F]/15 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Start tracking your bills today</h2>
          <p className="text-slate-400">Free to start. No credit card. Under 2 minutes to set up.</p>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#4D6A9F] text-white font-bold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2">
              Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
