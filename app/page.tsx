import Link from "next/link";
import {
  ArrowRight, DollarSign, Mail, CheckCircle,
  Bell, ShieldCheck, TrendingUp, Clock, Eye, Zap,
  Sparkles, Camera, Globe, Lock, X
} from "lucide-react";
import { LogoFull, LogoIcon } from "./components/Logo";
import { TrustBadges } from "./components/TrustBadges";
import { Testimonials } from "./components/Testimonials";
import { SocialProof } from "./components/SocialProof";
import { FAQ } from "./components/FAQ";
import { GlobalFootprint } from "./components/GlobalFootprint";
import { FAQJsonLd, SoftwareApplicationJsonLd } from "./components/JsonLd";
import { WaitlistForm } from "./components/WaitlistForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1E2A3A] text-white" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <FAQJsonLd />
      <SoftwareApplicationJsonLd />

      <header className="sticky top-0 z-50 bg-[#1E2A3A]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <LogoFull height={32} />
          <nav className="hidden sm:flex items-center gap-7 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5">
              Get started free
          </Link>
        </div>
      </header>

      <section className="pt-20 pb-24 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-[#4D6A9F]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#4D6A9F]/10 border border-[#4D6A9F]/20 text-[#4D6A9F] text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
            <Globe className="w-3.5 h-3.5" />
            Available worldwide
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Never miss a bill again.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D6A9F] to-[#FFB347]">
              All your bills, one place.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">
            Stop juggling due dates, hunting for invoices, and getting blindsided by price increases.
            MyBillPort keeps every bill organised, visible, and paid on time — with AI-powered scanning and smart reminders.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-8 py-4 rounded-full transition-colors flex items-center gap-2 text-base shadow-lg shadow-[#4D6A9F]/20">
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
          {["120+ billers supported", "AI-powered bill scanning", "256-bit encryption", "Available worldwide"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <SocialProof />

      <div className="max-w-5xl mx-auto px-5 space-y-28 py-24">

        <section id="features" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-[#4D6A9F] text-sm font-semibold uppercase tracking-wider">Features</p>
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
                body: "All your bills — electricity, internet, phone, insurance — on one clean dashboard. No more logging into five different portals.",
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
                body: "Direct links to your biller's official payment page. Find your bill, click Pay, done. Supports 120+ billers worldwide.",
              },
              {
                icon: ShieldCheck,
                title: "Private and secure",
                body: "256-bit encryption, biometric verification, and strict data isolation. We never sell your information or connect to your bank.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#263244] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-[#4D6A9F]/20 transition-colors group">
                <div className="w-10 h-10 bg-[#4D6A9F]/10 group-hover:bg-[#4D6A9F]/20 rounded-xl flex items-center justify-center transition-colors">
                  <f.icon className="w-5 h-5 text-[#4D6A9F]" />
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#4D6A9F]/10 to-[#6BCB77]/10 border border-[#4D6A9F]/15 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#FFB347]/10 border border-[#FFB347]/20 text-[#FFB347] text-xs font-semibold px-3 py-1 rounded-full">
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
                    <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#263244] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#4D6A9F]/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#4D6A9F]" />
                </div>
                <span className="text-sm font-medium text-white">MyBillPort AI</span>
              </div>
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 max-w-[80%]">
                What bills do I have due this week?
              </div>
              <div className="bg-[#4D6A9F]/10 rounded-xl px-4 py-3 text-sm text-slate-300 max-w-[85%] ml-auto">
                You have 2 bills due this week: <span className="text-white font-medium">Internet ($85.50)</span> on Thursday and <span className="text-white font-medium">Electric ($142.30)</span> on Friday. Total: $227.80.
              </div>
            </div>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#6BCB77]/10 border border-[#6BCB77]/20 text-[#6BCB77] text-xs font-semibold px-4 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5" />
              Privacy-first by design
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              No Gmail access.<br />No bots. Just your bills.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Most bill trackers demand your bank login or email password. MyBillPort doesn&apos;t.
              We built a privacy-first alternative that works without giving us access to anything sensitive.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Mail,
                title: "No Gmail bots",
                body: "We never ask for your Gmail password or connect to your inbox. Instead, you get a unique forwarding address — forward any invoice email to it and we parse it automatically.",
                tag: "vs. competitors that use email bots",
              },
              {
                icon: ShieldCheck,
                title: "No bank login",
                body: "We never ask for your banking credentials. Bills are added by photo, PDF upload, or email forwarding — all controlled entirely by you.",
                tag: "vs. Mint, PocketGuard, YNAB",
              },
              {
                icon: Lock,
                title: "Local AI processing",
                body: "When you upload a bill image, our AI reads it in memory to extract the details, then discards it. Your document is never stored on our servers.",
                tag: "BYOK-ready in Business",
              },
            ].map((card) => (
              <div key={card.title} className="bg-[#263244] border border-[#6BCB77]/10 rounded-2xl p-6 space-y-4 hover:border-[#6BCB77]/25 transition-colors">
                <div className="w-10 h-10 bg-[#6BCB77]/10 rounded-xl flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-[#6BCB77]" />
                </div>
                <h3 className="text-base font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.body}</p>
                <p className="text-xs text-slate-600 italic">{card.tag}</p>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <h3 className="text-center text-lg font-bold text-white">How we compare</h3>
            <div className="bg-[#263244] border border-white/5 rounded-2xl overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-4 text-slate-400 font-medium">Feature</th>
                    {["MyBillPort", "Mint*", "PocketGuard", "YNAB", "Copilot"].map((app) => (
                      <th key={app} className={`px-4 py-4 text-center font-semibold ${app === "MyBillPort" ? "text-[#4D6A9F]" : "text-slate-500"}`}>{app}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "No bank login required",         vals: [true, false, false, false, false] },
                    { feature: "No email/Gmail access",          vals: [true, true,  true,  true,  true ] },
                    { feature: "AI bill scanning (photo/PDF)",   vals: [true, false, false, false, false] },
                    { feature: "Push notifications",             vals: [true, false, true,  false, true ] },
                    { feature: "Email forwarding import",        vals: [true, false, false, false, false] },
                    { feature: "Payment redirect (no data stored)", vals: [true, false, false, false, false] },
                    { feature: "Available outside the US",       vals: [true, false, false, true,  false] },
                    { feature: "Free tier",                      vals: [true, "N/A", true,  false, false] },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                      <td className="px-5 py-3 text-slate-300 text-sm">{row.feature}</td>
                      {row.vals.map((v, j) => (
                        <td key={j} className="px-4 py-3 text-center">
                          {typeof v === "boolean"
                            ? v
                              ? <CheckCircle className="w-4 h-4 text-[#6BCB77] mx-auto" />
                              : <X className="w-4 h-4 text-slate-600 mx-auto" />
                            : <span className="text-xs text-slate-500">{v}</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-600 text-center">* Mint shut down in January 2024. Comparison based on last known feature set.</p>
          </div>
        </section>

        <section id="how" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">How it works</p>
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
              <div key={s.step} className="relative bg-[#263244] border border-white/5 rounded-2xl p-7 space-y-4">
                <span className="text-5xl font-black text-[#4D6A9F]/15 leading-none block">{s.step}</span>
                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-[#4D6A9F] text-sm font-semibold uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Straightforward pricing</h2>
            <p className="text-slate-400 text-base">
              Start free. Upgrade only when it makes sense for you.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 items-start">
            <div className="bg-[#263244] border border-white/5 rounded-2xl p-7 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-1">Free</p>
                <p className="text-4xl font-extrabold text-white">Free</p>
                <p className="text-xs text-slate-500 mt-1">Forever · No credit card</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {["Track up to 5 bills", "Due date reminders", "One-click payment links", "AI bill scanning", "PDF & photo upload"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full border border-[#4D6A9F]/40 text-[#4D6A9F] hover:bg-[#4D6A9F]/10 font-semibold py-3 rounded-full transition-colors text-sm text-center">
                  Get started free
              </Link>
            </div>

            <div className="bg-[#263244] border-2 border-[#4D6A9F]/50 rounded-2xl p-7 space-y-5 relative shadow-[0_0_30px_rgba(77,106,159,0.08)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4D6A9F] text-white text-xs font-bold px-3 py-1 rounded-full">
                Most popular
              </div>
              <div>
                <p className="text-sm font-semibold text-[#4D6A9F] mb-1">Pro</p>
                <p className="text-4xl font-extrabold text-white">$7<span className="text-xl font-medium text-slate-400"> /mo</span></p>
                <p className="text-xs text-[#6BCB77] font-semibold mt-1">or $69/year — save 18%</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {["Unlimited bills", "Email forwarding import", "Price spike alerts", "Biometric verification", "Negotiation scripts", "Priority support"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold py-3 rounded-full transition-colors text-sm text-center">
                Start Pro
              </Link>
            </div>

            <div className="bg-[#263244] border border-white/5 rounded-2xl p-7 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-1">Business</p>
                <p className="text-4xl font-extrabold text-white">Custom</p>
                <p className="text-xs text-slate-500 mt-1">For teams Tailored to your team businesses</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {["Unlimited seats", "SSO / SAML login", "Custom biller integrations", "Dedicated onboarding", "SLA & compliance docs"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <a href="mailto:mybillportinfo@gmail.com" className="block w-full border border-white/10 text-slate-300 hover:bg-white/5 font-semibold py-3 rounded-full transition-colors text-sm text-center">
                  Talk to us
              </a>
            </div>
          </div>
          <div className="text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-[#4D6A9F] hover:text-white transition-colors font-medium">
              See full plan comparison <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      <TrustBadges />
      <Testimonials />
      <GlobalFootprint />

      <div className="max-w-5xl mx-auto px-5" id="faq">
        <FAQ />
      </div>

      <div className="max-w-5xl mx-auto px-5 py-24">
        <section className="bg-gradient-to-br from-[#4D6A9F]/15 to-[#6BCB77]/10 border border-[#4D6A9F]/15 rounded-3xl p-10 md:p-16 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Your bills aren't going anywhere.<br />
            <span className="text-[#4D6A9F]">Your stress can.</span>
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-base leading-relaxed">
            Take back control of your bills. Free to start, takes two minutes to set up.
          </p>
          <WaitlistForm />
        </section>
      </div>

      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <LogoFull height={28} />
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Never miss a bill again. The simplest way to manage all your bills in one place.
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
              © {new Date().getFullYear()} MyBillPort Inc. · All rights reserved
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6BCB77]" />
                256-bit encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#6BCB77]" />
                SOC 2 practices
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
