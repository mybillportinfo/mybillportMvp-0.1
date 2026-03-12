'use client';

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, DollarSign, Mail, CheckCircle,
  Bell, ShieldCheck, TrendingUp, Clock, Eye, Zap,
  Sparkles, Camera, Globe
} from "lucide-react";
import { LogoFull, LogoIcon } from "./components/Logo";
import { TrustBadges } from "./components/TrustBadges";
import { Testimonials } from "./components/Testimonials";
import { SocialProof } from "./components/SocialProof";
import { FAQ } from "./components/FAQ";
import { FAQJsonLd, SoftwareApplicationJsonLd } from "./components/JsonLd";

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
      <FAQJsonLd />
      <SoftwareApplicationJsonLd />

      <header className="sticky top-0 z-50 bg-[#060d1a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <LogoFull height={32} />
          <nav className="hidden sm:flex items-center gap-7 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <Link href="/login" className="bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5">
              Get started free
          </Link>
        </div>
      </header>

      <section className="pt-20 pb-24 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-teal-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
            <Globe className="w-3.5 h-3.5" />
            Trusted by 2,500+ Canadians
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Never miss a bill again.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              All your bills, one place.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">
            Stop juggling due dates, hunting for invoices, and getting blindsided by price increases.
            MyBillPort keeps every bill organised, visible, and paid on time — with AI-powered scanning and smart reminders.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/login" className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-colors flex items-center gap-2 text-base shadow-lg shadow-teal-900/40">
                Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how" className="border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium px-8 py-4 rounded-full transition-colors text-base inline-block">
                See how it works
            </a>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            No credit card required · No bank login needed · Cancel anytime
          </p>
        </div>
      </section>

      <div className="border-y border-white/5 bg-white/[0.02] py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-slate-500">
          {["120+ Canadian billers", "AI-powered bill scanning", "256-bit encryption", "Rogers · Bell · Telus · and more"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <SocialProof />

      <div className="max-w-5xl mx-auto px-5 space-y-28 py-24">

        <section id="features" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-teal-400 text-sm font-semibold uppercase tracking-wider">Features</p>
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
                icon: Camera,
                title: "AI bill scanning",
                body: "Snap a photo or upload a PDF — our AI extracts the vendor, amount, due date, and account number instantly. No typing required.",
              },
              {
                icon: Eye,
                title: "See everything at a glance",
                body: "All your bills — hydro, internet, phone, insurance — on one clean dashboard. No more logging into five different portals.",
              },
              {
                icon: Bell,
                title: "Smart reminders",
                body: "Get notified 7 days out, 2 days out, and the day a bill is due. Push notifications work even when the app is closed.",
              },
              {
                icon: TrendingUp,
                title: "Price increase alerts",
                body: "MyBillPort flags when a recurring bill is higher than usual so you can call your provider before the charge hits.",
              },
              {
                icon: Zap,
                title: "One-click payment",
                body: "Direct links to your biller's official payment page. Find your bill, click Pay, done. Supports 120+ Canadian billers.",
              },
              {
                icon: ShieldCheck,
                title: "Private and secure",
                body: "256-bit encryption, biometric verification, and strict data isolation. We never sell your information or connect to your bank.",
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

        <section className="bg-gradient-to-br from-teal-900/20 to-cyan-900/10 border border-teal-500/15 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Your personal bill assistant
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Ask our AI assistant anything about your bills — &ldquo;What&rsquo;s due this week?&rdquo;,
                &ldquo;How much did I spend on utilities last month?&rdquo;, or &ldquo;Did my phone bill go up?&rdquo;
                Get instant, accurate answers.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                {["AI bill scanning from photos & PDFs", "Negotiation scripts for lower rates", "Switch & save recommendations", "Monthly spending insights"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0d1a2d] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-sm font-medium text-white">MyBillPort AI</span>
              </div>
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 max-w-[80%]">
                What bills do I have due this week?
              </div>
              <div className="bg-teal-500/10 rounded-xl px-4 py-3 text-sm text-slate-300 max-w-[85%] ml-auto">
                You have 2 bills due this week: <span className="text-white font-medium">Rogers ($85.50)</span> on Thursday and <span className="text-white font-medium">Hydro One ($142.30)</span> on Friday. Total: $227.80.
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-teal-400 text-sm font-semibold uppercase tracking-wider">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Up and running in minutes</h2>
            <p className="text-slate-400 text-base">No lengthy setup. No tutorials. Just add your first bill and go.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Add your bills",
                body: "Upload a PDF or snap a photo — our AI extracts the details automatically. Or type it in manually. Either way takes under a minute.",
              },
              {
                step: "02",
                title: "We watch the due dates",
                body: "MyBillPort tracks every due date and sends push notifications to your phone so nothing slips through the cracks.",
              },
              {
                step: "03",
                title: "Pay and mark as done",
                body: "Click the Pay button to go straight to your biller's official website. Mark it paid and move on with your day.",
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

        <section id="pricing" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-teal-400 text-sm font-semibold uppercase tracking-wider">Pricing</p>
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
                {["Track up to 10 bills", "Due date reminders", "One-click payment links", "120+ billers supported", "PDF & photo bill upload"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full border border-teal-500/40 text-teal-400 hover:bg-teal-500/10 font-semibold py-3 rounded-full transition-colors text-sm text-center">
                  Get started free
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
                {["Everything in Starter", "Unlimited bills", "AI bill scanning", "Price spike alerts", "Recurring bill detection", "Priority support"].map((i) => (
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
              <a href="mailto:mybillportinfo@gmail.com" className="block w-full border border-white/10 text-slate-300 hover:bg-white/5 font-semibold py-3 rounded-full transition-colors text-sm text-center">
                  Contact us
              </a>
            </div>
          </div>
        </section>
      </div>

      <TrustBadges />
      <Testimonials />

      <div className="max-w-5xl mx-auto px-5" id="faq">
        <FAQ />
      </div>

      <div className="max-w-5xl mx-auto px-5 py-24">
        <section className="bg-gradient-to-br from-teal-900/30 to-cyan-900/10 border border-teal-500/15 rounded-3xl p-10 md:p-16 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Your bills aren't going anywhere.<br />
            <span className="text-teal-400">Your stress can.</span>
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-base leading-relaxed">
            Join 2,500+ Canadians who've taken back control of their bills. Free to start, takes two minutes to set up.
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
              <Link href="/login" className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-10 py-4 rounded-full transition-colors inline-flex items-center gap-2 text-base shadow-lg shadow-teal-900/50">
                  Start managing your bills free <ArrowRight className="w-5 h-5" />
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

      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <LogoFull height={28} />
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Never miss a bill again. The simplest way for Canadians to manage all their bills in one place.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Product</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Support</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="mailto:mybillportinfo@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Help Centre</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} MyBillPort Inc. · All rights reserved · Made in Canada 🇨🇦
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                256-bit encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                SOC 2 practices
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
