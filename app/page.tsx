'use client';

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Receipt, DollarSign, Mail, CheckCircle,
  Bell, ShieldCheck, TrendingUp, Clock, Eye, Zap
} from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1a] text-white" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#060d1a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_0_12px_rgba(20,184,166,0.4)]">
              <Receipt className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">MyBillPort</span>
          </div>
          <nav className="hidden sm:flex items-center gap-7 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <Link href="/login">
            <button className="bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5">
              Get started free
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-teal-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
            Early access · Free to start
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Every bill you pay.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              One place to manage them.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">
            Stop juggling due dates, hunting for invoices, and getting blindsided by price increases.
            MyBillPort keeps all your bills organised, visible, and on time.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/login">
              <button className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-colors flex items-center gap-2 text-base shadow-lg shadow-teal-900/40">
                Start for free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <a href="#how">
              <button className="border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium px-8 py-4 rounded-full transition-colors text-base">
                See how it works
              </button>
            </a>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            No credit card required · No bank login needed · Cancel anytime
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-white/5 bg-white/[0.02] py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-slate-500">
          {["100+ billers supported worldwide", "Reminders before every due date", "Secure · Private · No data selling", "Rogers · Bell · Telus · and more"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 space-y-28 py-24">

        {/* Features */}
        <section id="features" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Built around how people actually pay bills
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              No bloated dashboards. No confusing charts. Just a clear, calm view of what you owe and when it's due.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Eye,
                title: "See everything at a glance",
                body: "All your bills — hydro, internet, phone, insurance — on one clean dashboard. No more logging into five different portals.",
              },
              {
                icon: Bell,
                title: "Reminders that actually help",
                body: "Get notified 7 days out, 2 days out, and the day a bill is due. Never pay a late fee again.",
              },
              {
                icon: TrendingUp,
                title: "Spot price increases early",
                body: "MyBillPort flags when a bill is higher than usual so you can call your provider before the charge hits.",
              },
              {
                icon: Zap,
                title: "Pay in one click",
                body: "Direct links to your biller's payment page. Find your bill, click Pay, done.",
              },
              {
                icon: Clock,
                title: "Track what's paid and what's pending",
                body: "Clear status on every bill — Unpaid, Partial, Paid, Overdue. You'll always know exactly where you stand.",
              },
              {
                icon: ShieldCheck,
                title: "Private and secure by design",
                body: "Your data stays yours. We never sell your information or connect to your bank account.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#0d1a2d] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-teal-500/20 transition-colors group">
                <div className="w-10 h-10 bg-teal-500/10 group-hover:bg-teal-500/20 rounded-xl flex items-center justify-center transition-colors">
                  <f.icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Up and running in minutes</h2>
            <p className="text-slate-400 text-base">No lengthy setup. No tutorials. Just add your first bill and go.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Add your bills",
                body: "Upload a PDF or photo and we extract the details automatically — or type it in manually. Either way takes under a minute.",
              },
              {
                step: "02",
                title: "We watch the due dates",
                body: "MyBillPort tracks every due date and sends you reminders so nothing slips through the cracks, even during busy months.",
              },
              {
                step: "03",
                title: "Pay and mark as done",
                body: "Click the Pay button to go straight to your biller's website. Mark it paid and move on with your day.",
              },
            ].map((s) => (
              <div key={s.step} className="relative bg-[#0d1a2d] border border-white/5 rounded-2xl p-7 space-y-4">
                <span className="text-5xl font-black text-teal-500/15 leading-none block">{s.step}</span>
                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Straightforward pricing</h2>
            <p className="text-slate-400 text-base">
              Start free. Upgrade only when it makes sense for you.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 items-start">
            <div className="bg-[#0d1a2d] border border-white/5 rounded-2xl p-7 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-1">Starter</p>
                <p className="text-4xl font-extrabold text-white">Free</p>
                <p className="text-xs text-slate-500 mt-1">Forever · No credit card</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {["Track up to 10 bills", "Due date reminders", "One-click payment links", "100+ billers supported", "PDF & photo bill upload"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <button className="w-full border border-teal-500/40 text-teal-400 hover:bg-teal-500/10 font-semibold py-3 rounded-full transition-colors text-sm">
                  Get started free
                </button>
              </Link>
            </div>

            <div className="bg-[#0d1a2d] border-2 border-teal-500/50 rounded-2xl p-7 space-y-5 relative shadow-[0_0_30px_rgba(20,184,166,0.08)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most popular
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-400 mb-1">Pro</p>
                <p className="text-4xl font-extrabold text-white">$7<span className="text-xl font-medium text-slate-400"> /mo</span></p>
                <p className="text-xs text-slate-500 mt-1">Coming soon during pilot</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {["Everything in Starter", "Unlimited bills", "Gmail auto-import", "Price spike alerts", "Recurring bill detection", "Priority support"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full bg-teal-500/30 text-teal-300 font-semibold py-3 rounded-full text-sm cursor-not-allowed opacity-70">
                Coming soon
              </button>
            </div>

            <div className="bg-[#0d1a2d] border border-white/5 rounded-2xl p-7 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-1">Concierge</p>
                <p className="text-4xl font-extrabold text-white">$29<span className="text-xl font-medium text-slate-400">+</span></p>
                <p className="text-xs text-slate-500 mt-1">One-time fee</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {["Personal bill review", "Find overpriced services", "Negotiation scripts included", "Expert recommendations", "Money-back if no savings found"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <a href="mailto:mybillportinfo@gmail.com">
                <button className="w-full border border-white/10 text-slate-300 hover:bg-white/5 font-semibold py-3 rounded-full transition-colors text-sm">
                  Contact us
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-teal-900/30 to-cyan-900/10 border border-teal-500/15 rounded-3xl p-10 md:p-16 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Your bills aren't going anywhere.<br />
            <span className="text-teal-400">Your stress can.</span>
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-base leading-relaxed">
            Join thousands who've taken back control of their bills. Free to start, takes two minutes to set up.
          </p>
          {submitted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-teal-400 font-medium">You're on the list — we'll be in touch.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <Link href="/login">
                <button className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-10 py-4 rounded-full transition-colors inline-flex items-center gap-2 text-base shadow-lg shadow-teal-900/50">
                  Start managing your bills free <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <p className="text-xs text-slate-500 mb-3">Or get notified when new features drop</p>
                <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-teal-500/50"
                  />
                  <button type="submit" className="bg-white/10 hover:bg-white/15 text-white rounded-full px-5 py-3 text-sm font-medium flex items-center gap-1.5 justify-center transition-colors">
                    <Mail className="w-4 h-4" /> Notify me
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <Receipt className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white tracking-tight">MyBillPort</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:mybillportinfo@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} MyBillPort · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
