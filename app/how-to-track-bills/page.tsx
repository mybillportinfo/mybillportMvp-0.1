import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Bell, Brain, BarChart3, AlertTriangle, Smartphone, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Track Bills in One Place (Simple Guide) | MyBillPort',
  description: 'Learn the best way to track monthly bills without missing payments. Use our free bill tracker app to organize everything automatically.',
  alternates: { canonical: 'https://mybillport.com/how-to-track-bills' },
  openGraph: {
    title: 'How to Track Bills in One Place | MyBillPort',
    description: 'Stop losing track of bills. Learn the best methods and how a bill tracker app automates everything for you.',
    url: 'https://mybillport.com/how-to-track-bills',
  },
};

export default function HowToTrackBillsPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">How to Track Bills</span>
        </nav>

        {/* Hero */}
        <header className="space-y-5">
          <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">Bill Management Guide</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            How to Track Bills in One Place
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Most Canadians manage 8–14 recurring bills every month — hydro, internet, phone, insurance, streaming, and more. Without a system, it's easy to miss due dates, pay late fees, or lose track of what you owe. This guide walks you through the best methods to track monthly bills, and how a dedicated bill tracker app makes it effortless.
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>8 min read · Updated March 2026</span>
          </div>
        </header>

        {/* Why it matters */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Why Tracking Bills Matters</h2>
          <p className="text-slate-400 leading-relaxed">
            A missed bill payment can trigger a late fee, damage your credit score, or even result in service interruption. In Canada, late payment fees typically range from $15–$50 per bill, and some providers charge interest on unpaid balances. Over a year, disorganized bill management can easily cost hundreds of dollars in unnecessary fees.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Beyond fees, there's the mental load. Keeping track of which bill is due when — especially when billing cycles don't align — creates constant low-grade stress. A reliable bill tracking system eliminates that stress entirely.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {[
              { stat: '$35', label: 'Average late fee per bill in Canada' },
              { stat: '14+', label: 'Recurring bills the average household has' },
              { stat: '1 in 4', label: 'Canadians miss at least one bill per year' },
            ].map(s => (
              <div key={s.stat} className="bg-[#1a2535] border border-white/5 rounded-xl p-5 text-center">
                <p className="text-2xl font-extrabold text-[#4D6A9F]">{s.stat}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Methods */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-white">4 Ways to Track Monthly Bills</h2>

          <div className="space-y-6">
            {[
              {
                num: '01',
                title: 'Spreadsheet (Free, But Manual)',
                body: 'A simple Google Sheets or Excel spreadsheet with columns for biller name, amount, due date, and paid status works surprisingly well. The downside: you have to update it every month, and it won\'t remind you when something is due. Good for people who pay bills on a fixed schedule and already have a weekly review habit.',
                verdict: 'Best for: very organized people who review finances weekly.',
              },
              {
                num: '02',
                title: 'Calendar App (Better, Still Manual)',
                body: 'Setting repeating calendar events for each bill due date gives you visual reminders. This works better than a spreadsheet because your phone will ping you. The limitation: you still have to manually enter amounts and mark things as paid. There\'s no visibility into your total monthly spend or payment history.',
                verdict: 'Best for: people who live in their calendar app.',
              },
              {
                num: '03',
                title: 'Banking App Bill Pay (Convenient, But Limited)',
                body: 'Most Canadian banks offer a bill pay section that shows scheduled payments. This only covers bills you\'ve set up with that bank, though — it won\'t show Netflix, a gym membership on a separate credit card, or bills from a different account. You also can\'t see upcoming amounts until the bill arrives.',
                verdict: 'Best for: people who pay everything through one bank account.',
              },
              {
                num: '04',
                title: 'Dedicated Bill Tracker App (Automatic, Complete)',
                body: 'A purpose-built bill tracker like MyBillPort centralizes everything in one dashboard — regardless of how you pay. You add your bills once, and the app tracks due dates, sends push notifications before due dates, flags unusual increases, and shows your full payment history. AI bill scanning means you can add a bill just by photographing it.',
                verdict: 'Best for: anyone who wants to stop thinking about bills entirely.',
              },
            ].map(m => (
              <div key={m.num} className="bg-[#1a2535] border border-white/5 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-[#4D6A9F]/20">{m.num}</span>
                  <h3 className="text-lg font-bold text-white">{m.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{m.body}</p>
                <p className="text-xs text-[#6BCB77] font-medium">{m.verdict}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How MyBillPort automates it */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How MyBillPort Automates Bill Tracking</h2>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort is the simplest way to track all your monthly bills in one place — without manually updating a spreadsheet or setting a dozen calendar reminders.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: Brain,
                title: 'AI Bill Scanning',
                body: 'Photograph a bill or upload a PDF. The AI reads it and automatically fills in the vendor, amount, due date, and account number. Adding a bill takes under 30 seconds.',
              },
              {
                icon: Bell,
                title: 'Push Notifications Before Due Dates',
                body: 'Get a notification on your phone before every bill is due. You set the timing — 7 days, 3 days, or day-of. Never miss a due date again.',
              },
              {
                icon: AlertTriangle,
                title: 'Spike Alerts',
                body: 'If a bill is significantly higher than usual — say, your Enbridge gas bill jumps 30% — MyBillPort flags it automatically so you can review it before paying.',
              },
              {
                icon: BarChart3,
                title: 'Payment History & Annual Projection',
                body: 'See a full record of every payment, and get a projection of your annual bill spend so you can budget accurately.',
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

        {/* Step-by-step */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Step-by-Step: Set Up Your Bill Tracker in 5 Minutes</h2>
          <ol className="space-y-5">
            {[
              { step: 1, title: 'Create a free account', body: 'Sign up with your email or Google account. No credit card needed.' },
              { step: 2, title: 'Add your first bill', body: 'Snap a photo of a bill, upload a PDF, or type the details manually. The AI handles the data entry.' },
              { step: 3, title: 'Repeat for all your bills', body: 'Add each recurring bill — hydro, internet, phone, insurance, streaming services, gym, etc. Most people are done in under 5 minutes.' },
              { step: 4, title: 'Enable push notifications', body: 'Allow notifications so MyBillPort can ping you before each bill is due. Works on iPhone and Android.' },
              { step: 5, title: 'Pay bills from the dashboard', body: 'When a bill is due, tap "Pay Now" to go straight to the biller\'s official website. When done, tap "Mark as Paid" to keep your records clean.' },
            ].map(s => (
              <li key={s.step} className="flex gap-4">
                <div className="w-8 h-8 bg-[#6BCB77]/15 text-[#6BCB77] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{s.step}</div>
                <div>
                  <p className="font-semibold text-white">{s.title}</p>
                  <p className="text-slate-400 text-sm mt-1">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Internal links */}
        <section className="space-y-4 bg-[#1a2535] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white">Related Guides</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/avoid-late-fees" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> How to avoid late fees on bills →
              </Link>
            </li>
            <li>
              <Link href="/bill-tracker-canada" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> The best Canadian bill tracker →
              </Link>
            </li>
            <li>
              <Link href="/blog" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> More bill management guides →
              </Link>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#4D6A9F]/20 to-[#6BCB77]/10 border border-[#4D6A9F]/20 rounded-3xl p-8 text-center space-y-5">
          <h2 className="text-2xl font-bold text-white">Start Tracking Your Bills Today — Free</h2>
          <p className="text-slate-400 max-w-md mx-auto">No spreadsheets. No forgotten due dates. Just a clean dashboard that keeps you in control of every bill.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
