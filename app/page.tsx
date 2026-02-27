'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Receipt, DollarSign, Mail, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-[#0b1220] text-[#0f172a]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0b1220]/90 backdrop-blur border-b border-[#1f2937]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-sky-500 flex items-center justify-center">
              <div className="relative">
                <Receipt className="text-white w-4 h-4" />
                <DollarSign className="text-white w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5" />
              </div>
            </div>
            <span className="font-bold text-xl text-[#e5e7eb] tracking-tight">MyBillPort</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-[#9ca3af]">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <Link href="/login">
            <button className="bg-gradient-to-r from-green-500 to-sky-500 text-[#020617] font-semibold text-sm px-5 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5">
              Open App <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-6 pt-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-400">
            Early access · AI bill assistant
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-[#f9fafb] leading-tight max-w-3xl mx-auto">
            Cut your bills with an AI that actually watches them
          </h1>
          <p className="text-base md:text-lg text-[#d1d5db] max-w-xl mx-auto leading-relaxed">
            MyBillPort scans your bills, spots spikes, and surfaces savings opportunities in minutes —
            before your provider quietly hikes the price. No bank connection required to start.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/login">
              <button className="bg-gradient-to-r from-green-500 to-sky-500 text-[#020617] font-semibold px-7 py-3 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
                Get early access <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#how">
              <button className="border border-[#4b5563] text-[#e5e7eb] font-medium px-7 py-3 rounded-full hover:bg-[#1f2937] transition-colors">
                See how it works
              </button>
            </a>
          </div>
          <p className="text-xs text-[#6b7280]">
            Built in Canada for people who are done being surprised by their bills.
          </p>
        </section>

        {/* How it works */}
        <section id="how" className="space-y-8 scroll-mt-20">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#f9fafb] mb-2">How MyBillPort works</h2>
            <p className="text-sm text-[#9ca3af]">
              Think of it as a bill analyst on your side — fast, focused, and always watching for bad surprises.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Bring your bills in",
                body: "Snap a photo or upload a PDF and let AI extract the details, or enter a bill manually in under 30 seconds.",
              },
              {
                step: "2",
                title: "MBP reads and understands",
                body: "MyBillPort detects sudden increases, promo expiries, and classifies each bill by category.",
              },
              {
                step: "3",
                title: "Get clear, simple insights",
                body: "See exactly which bills jumped, which look overpriced, and what to say when you call your provider.",
              },
              {
                step: "4",
                title: "Turn insight into savings",
                body: "Use negotiation scripts or upgrade to a concierge audit and let us handle the hard calls for you.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5 space-y-3 hover:border-[#374151] transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-sky-500 flex items-center justify-center text-xs font-bold text-[#020617]">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-[#e5e7eb]">{item.title}</h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="space-y-8 scroll-mt-20">
          <h2 className="text-xl md:text-2xl font-bold text-[#f9fafb]">Why people use MyBillPort</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "Stop quiet overpayments",
                body: "MBP watches for fee creep and price hikes so you don't wake up to a bill that's 20% higher for no reason.",
              },
              {
                title: "Know your true recurring burn",
                body: "See, in one place, what's locked-in, what's negotiable, and what you can cancel this month to free up cash.",
              },
              {
                title: "Save time and headspace",
                body: "No more hunting through portals and PDFs. MyBillPort pulls out the signal and shows you where to act.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5 space-y-3 hover:border-[#374151] transition-colors">
                <h3 className="text-sm font-semibold text-[#e5e7eb]">{item.title}</h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="space-y-8 scroll-mt-20">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#f9fafb] mb-2">Simple, fair pricing</h2>
            <p className="text-sm text-[#9ca3af]">
              During our pilot, access is free while we learn from early users and tune the experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#e5e7eb]">Free (Pilot)</h3>
              <p className="text-3xl font-bold text-[#e5e7eb]">$0</p>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Track bills, upload documents, and get core AI insights while we're in early access.
              </p>
              <Link href="/login">
                <button className="w-full mt-2 border border-[#4b5563] text-[#e5e7eb] text-sm font-medium py-2 rounded-full hover:bg-[#1f2937] transition-colors">
                  Get started free
                </button>
              </Link>
            </div>

            <div className="bg-[#020617] border-2 border-green-500/60 rounded-2xl p-6 space-y-3 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-sky-500 text-[#020617] text-xs font-bold px-3 py-1 rounded-full">
                Most popular
              </div>
              <h3 className="text-sm font-semibold text-green-300">Pro (Coming soon)</h3>
              <p className="text-3xl font-bold text-green-300">$5–9<span className="text-base font-normal text-[#9ca3af]"> / mo</span></p>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Deeper forecasting, more accounts, and priority support once we prove consistent savings.
              </p>
              <button disabled className="w-full mt-2 bg-gradient-to-r from-green-500/30 to-sky-500/30 text-green-300 text-sm font-medium py-2 rounded-full cursor-not-allowed opacity-60">
                Coming soon
              </button>
            </div>

            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#e5e7eb]">Concierge audit</h3>
              <p className="text-3xl font-bold text-[#e5e7eb]">$29+<span className="text-base font-normal text-[#9ca3af]"> once</span></p>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                A one-time bill audit where we review your key bills and help unlock the top savings.
              </p>
              <a href="mailto:mybillportinfo@gmail.com">
                <button className="w-full mt-2 border border-[#4b5563] text-[#e5e7eb] text-sm font-medium py-2 rounded-full hover:bg-[#1f2937] transition-colors">
                  Contact us
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* CTA / Waitlist */}
        <section className="bg-[#020617] border border-[#1f2937] rounded-2xl p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#f9fafb]">
            Start managing your bills today
          </h2>
          <p className="text-[#9ca3af] max-w-md mx-auto text-sm leading-relaxed">
            Take control of your bills with a simple, trusted Canadian app. Free to start — no credit card needed.
          </p>
          {submitted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-green-400 font-medium">You're on the list! We'll be in touch.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Link href="/login">
                <button className="bg-gradient-to-r from-green-500 to-sky-500 text-[#020617] font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                  Get early access <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <p className="text-xs text-[#6b7280]">Or join the waitlist for updates</p>
              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-[#0f172a] border border-[#374151] text-white placeholder:text-[#4b5563] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                />
                <button type="submit" className="bg-[#1f2937] hover:bg-[#374151] text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 justify-center transition-colors">
                  <Mail className="w-4 h-4" /> Subscribe
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] mt-8">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-sky-500 flex items-center justify-center">
              <Receipt className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#e5e7eb]">MyBillPort</span>
          </div>
          <div className="flex gap-5 text-sm text-[#9ca3af]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:mybillportinfo@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-[#6b7280]">
            © {new Date().getFullYear()} MyBillPort · Not a bank. We help you understand and optimise your bills.
          </p>
        </div>
      </footer>
    </div>
  );
}
