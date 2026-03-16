import Link from "next/link";
import { CheckCircle, X, ArrowRight, Zap, Building2, Users, ShieldCheck, Sparkles, Bell, Globe, TrendingUp, Mail } from "lucide-react";
import { LogoFull } from "../components/Logo";

export const metadata = {
  title: "Pricing – MyBillPort",
  description: "Simple, transparent pricing. Start free, upgrade when you need more. No hidden fees, no bank login required.",
};

const proFeatures = [
  { icon: Zap, text: "Unlimited bills" },
  { icon: Sparkles, text: "AI bill scanning (photo & PDF)" },
  { icon: Bell, text: "Smart push notifications" },
  { icon: TrendingUp, text: "Price spike & anomaly alerts" },
  { icon: Mail, text: "Email forwarding auto-import" },
  { icon: ShieldCheck, text: "Biometric payment verification" },
  { icon: Globe, text: "120+ billers + Google fallback" },
  { icon: Users, text: "Bill negotiation scripts" },
];

const hobbyFeatures = [
  "Up to 5 bills",
  "Due date reminders",
  "One-click payment links",
  "PDF & photo scanning",
  "AI chat assistant",
];

const enterpriseFeatures = [
  "Unlimited seats",
  "SSO / SAML login",
  "Custom biller integrations",
  "Dedicated onboarding",
  "SLA & compliance docs",
  "Volume pricing",
];

const comparisonRows: { feature: string; hobby: boolean | string; pro: boolean | string; enterprise: boolean | string }[] = [
  { feature: "Bills tracked", hobby: "Up to 5", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "AI bill scanning", hobby: true, pro: true, enterprise: true },
  { feature: "Push notifications", hobby: true, pro: true, enterprise: true },
  { feature: "Email forwarding import", hobby: false, pro: true, enterprise: true },
  { feature: "Price spike alerts", hobby: false, pro: true, enterprise: true },
  { feature: "Biometric verification", hobby: false, pro: true, enterprise: true },
  { feature: "Negotiation scripts", hobby: false, pro: true, enterprise: true },
  { feature: "Switch & save recommendations", hobby: false, pro: true, enterprise: true },
  { feature: "Semantic bill search", hobby: false, pro: true, enterprise: true },
  { feature: "Custom biller integrations", hobby: false, pro: false, enterprise: true },
  { feature: "SSO / SAML", hobby: false, pro: false, enterprise: true },
  { feature: "SLA & compliance docs", hobby: false, pro: false, enterprise: true },
  { feature: "Priority support", hobby: false, pro: true, enterprise: true },
];

const faqs = [
  {
    q: "Do I need to connect my bank account?",
    a: "No. MyBillPort never asks for your banking credentials. You add bills by uploading a photo or PDF, or by forwarding your email invoices to a unique address we give you. Zero bank access.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes — cancel from your account settings in seconds. Your data stays in your account on the Hobby plan. No retention calls, no friction.",
  },
  {
    q: "What happens when I hit the 5-bill limit on Hobby?",
    a: "You can view and manage your existing 5 bills indefinitely. Adding a 6th will prompt you to upgrade to Pro. Nothing is locked or deleted.",
  },
  {
    q: "Is the $69/yr deal locked in?",
    a: "Yes. If you subscribe annually, that rate is locked for as long as you keep your subscription active.",
  },
  {
    q: "What does Enterprise pricing look like?",
    a: "It depends on your team size, biller integrations needed, and compliance requirements. Email us at mybillportinfo@gmail.com and we'll put together a proposal within 24 hours.",
  },
  {
    q: "Is my bill data private?",
    a: "Absolutely. Each user's data is strictly isolated in our Firestore database. We never sell data, never access Gmail, and never use bots to scrape your inbox. Bill images uploaded for AI scanning are processed in memory and never stored on our servers.",
  },
];

function Check() {
  return <CheckCircle className="w-4.5 h-4.5 text-[#6BCB77] flex-shrink-0" />;
}
function XMark() {
  return <X className="w-4 h-4 text-slate-600 flex-shrink-0" />;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#1E2A3A] text-white" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <header className="sticky top-0 z-50 bg-[#1E2A3A]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/"><LogoFull height={32} /></Link>
          <nav className="hidden sm:flex items-center gap-7 text-sm text-slate-400">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/#how" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/pricing" className="text-white font-semibold">Pricing</Link>
          </nav>
          <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5">
            Get started free
          </Link>
        </div>
      </header>

      <section className="pt-16 pb-12 px-5 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-[#4D6A9F] text-sm font-semibold uppercase tracking-wider">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Simple, honest pricing.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Start free. Upgrade when it makes sense. Cancel anytime — no questions asked.
          </p>
          <p className="text-xs text-slate-500">No credit card required for Hobby plan</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-20">
        <div className="grid md:grid-cols-3 gap-5 items-start">

          <div className="bg-[#263244] border border-white/5 rounded-2xl p-7 space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hobby</p>
              <p className="text-5xl font-extrabold text-white">Free</p>
              <p className="text-xs text-slate-500 mt-1.5">Forever · No credit card</p>
            </div>
            <Link href="/login" className="block w-full border border-[#4D6A9F]/40 text-[#4D6A9F] hover:bg-[#4D6A9F]/10 font-semibold py-3 rounded-full transition-colors text-sm text-center">
              Get started free
            </Link>
            <ul className="space-y-3 text-sm text-slate-300">
              {hobbyFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#263244] border-2 border-[#4D6A9F]/60 rounded-2xl p-7 space-y-6 relative shadow-[0_0_40px_rgba(77,106,159,0.12)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4D6A9F] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
              Most popular
            </div>
            <div>
              <p className="text-xs font-bold text-[#4D6A9F] uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-extrabold text-white">$7</p>
                <span className="text-slate-400 text-base mb-1.5">/month</span>
              </div>
              <p className="text-xs text-[#6BCB77] font-semibold mt-1.5">or $69/year — save 18%</p>
            </div>
            <Link href="/login" className="block w-full bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold py-3 rounded-full transition-colors text-sm text-center shadow-lg shadow-[#4D6A9F]/20 flex items-center justify-center gap-2">
              Start Pro <ArrowRight className="w-4 h-4" />
            </Link>
            <ul className="space-y-3 text-sm text-slate-300">
              {proFeatures.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                  {text}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-slate-400">
                <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                Everything in Hobby
              </li>
            </ul>
          </div>

          <div className="bg-[#263244] border border-white/5 rounded-2xl p-7 space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Enterprise</p>
              <p className="text-5xl font-extrabold text-white">Custom</p>
              <p className="text-xs text-slate-500 mt-1.5">Tailored to your team</p>
            </div>
            <a href="mailto:mybillportinfo@gmail.com" className="block w-full border border-white/10 text-slate-300 hover:bg-white/5 font-semibold py-3 rounded-full transition-colors text-sm text-center">
              Talk to us
            </a>
            <ul className="space-y-3 text-sm text-slate-300">
              {enterpriseFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#FFB347] flex-shrink-0" />
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0" />
                Everything in Pro
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Full plan comparison</h2>
          <p className="text-slate-400 text-sm mt-2">Every feature, side by side.</p>
        </div>
        <div className="bg-[#263244] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-slate-400 font-medium w-1/2">Feature</th>
                <th className="px-4 py-4 text-center text-slate-400 font-medium">Hobby</th>
                <th className="px-4 py-4 text-center text-[#4D6A9F] font-bold">Pro</th>
                <th className="px-4 py-4 text-center text-slate-400 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                  <td className="px-6 py-3 text-slate-300">{row.feature}</td>
                  <td className="px-4 py-3 text-center">
                    {typeof row.hobby === "boolean"
                      ? row.hobby ? <CheckCircle className="w-4 h-4 text-[#6BCB77] mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />
                      : <span className="text-slate-300 text-xs">{row.hobby}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {typeof row.pro === "boolean"
                      ? row.pro ? <CheckCircle className="w-4 h-4 text-[#6BCB77] mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />
                      : <span className="text-[#4D6A9F] text-xs font-medium">{row.pro}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {typeof row.enterprise === "boolean"
                      ? row.enterprise ? <CheckCircle className="w-4 h-4 text-[#6BCB77] mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />
                      : <span className="text-slate-300 text-xs">{row.enterprise}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-24 space-y-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
        </div>
        {faqs.map((faq) => (
          <details key={faq.q} className="bg-[#263244] border border-white/5 rounded-xl group">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-white font-medium text-sm list-none select-none">
              {faq.q}
              <span className="ml-4 flex-shrink-0 text-slate-400 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">+</span>
            </summary>
            <p className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              {faq.a}
            </p>
          </details>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-24">
        <div className="bg-gradient-to-br from-[#4D6A9F]/15 to-[#6BCB77]/10 border border-[#4D6A9F]/15 rounded-3xl p-10 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Still not sure? Start free.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto">
            Hobby is free forever. No card, no commitment. Upgrade only when you want more.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg shadow-[#4D6A9F]/20">
            Create free account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-slate-500">No credit card required</p>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <LogoFull height={24} />
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:mybillportinfo@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} MyBillPort Inc.</p>
        </div>
      </footer>
    </div>
  );
}
