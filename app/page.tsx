import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, DollarSign, Mail, CheckCircle,
  Bell, ShieldCheck, TrendingUp, Clock, Eye, Zap,
  Sparkles, Camera, Globe, Lock, X, PlusCircle, CreditCard, MapPin
} from "lucide-react";
import { SiInstagram, SiTiktok, SiReddit, SiX, SiLinkedin } from "react-icons/si";
import { LogoFull, LogoIcon } from "./components/Logo";
import { TrustBadges } from "./components/TrustBadges";
import { Testimonials } from "./components/Testimonials";
import { SocialProof } from "./components/SocialProof";
import { FAQ } from "./components/FAQ";
import { FAQJsonLd, SoftwareApplicationJsonLd } from "./components/JsonLd";
import { WaitlistForm } from "./components/WaitlistForm";

export const metadata: Metadata = {
  title: "Never Miss a Bill Again | MyBillPort – Smart Bill Tracker",
  description: "MyBillPort is the simple Canadian bill tracker that reminds you before due dates, helps you avoid late fees, and organizes all your bills in one place. Free to start.",
  keywords: [
    "bill management app Canada",
    "bill tracker Canada",
    "pay bills online Canada",
    "bill payment app",
    "track bills online",
    "bill reminder app Canada",
    "utility bill tracker",
    "never miss a bill",
    "bill organizer Canada",
    "hydro bill tracker",
    "Rogers Bell TELUS bill",
    "Canadian bill payment",
    "manage bills online",
    "bill due date reminder",
    "AI bill scanner",
  ],
  alternates: { canonical: "https://mybillport.com" },
  openGraph: {
    title: "MyBillPort — Never Miss a Bill Again | Free Bill Management App",
    description: "Canada's bill management app. Track every bill, AI-powered reminders, pay with one tap. Supports Rogers, Bell, TELUS & 120+ Canadian billers.",
    url: "https://mybillport.com",
    type: "website",
    images: [{ url: "https://mybillport.com/icon-512.png", width: 512, height: 512, alt: "MyBillPort — Bill Management App" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyBillPort — Never Miss a Bill Again",
    description: "Canada's bill management app. Track every bill, get AI-powered reminders, and pay with one tap. 120+ billers supported.",
    images: ["https://mybillport.com/icon-512.png"],
  },
};

function PhoneMockup({ children, shadow = "0 32px 64px rgba(0,0,0,0.4)" }: { children: ReactNode; shadow?: string }) {
  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      <div style={{ width: 200, height: 410, borderRadius: "2.2rem", border: "9px solid #1E293B", background: "#0F172A", boxShadow: shadow, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 70, height: 16, background: "#1E293B", borderRadius: "0 0 0.9rem 0.9rem", zIndex: 10 }} />
        <div style={{ position: "absolute", left: -12, top: 66, width: 4, height: 25, background: "#0F172A", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: -12, top: 100, width: 4, height: 40, background: "#0F172A", borderRadius: 2 }} />
        <div style={{ position: "absolute", right: -12, top: 100, width: 4, height: 55, background: "#0F172A", borderRadius: 2 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "1.9rem", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen() {
  const bills = [
    { name: "Internet", amount: "$85", due: "Due in 2 days", accent: "#FFB347" },
    { name: "Hydro", amount: "$142", due: "Due in 5 days", accent: "#6BCB77" },
    { name: "Rogers", amount: "$67", due: "Overdue", accent: "#ef4444" },
    { name: "Netflix", amount: "$18", due: "Due in 12 days", accent: "#6BCB77" },
  ];
  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg, #1E2A3A 0%, #263244 100%)", paddingTop: 22, overflow: "hidden" }}>
      <div style={{ padding: "0 12px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 2 }}>Good morning 👋</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>My<span style={{ color: "#6BCB77" }}>Bill</span>Port</div>
        </div>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #6BCB77, #4DA85A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "white" }} />
        </div>
      </div>
      <div style={{ margin: "0 12px 8px", background: "linear-gradient(135deg, #4D6A9F, #3d5a8f)", borderRadius: 13, padding: "10px 12px" }}>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>Total due this month</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>$312.50</div>
        <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
          {[{ l: "Bills", v: "4" }, { l: "Paid", v: "2" }, { l: "Overdue", v: "1" }].map(s => (
            <div key={s.l} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 7, padding: "3px 0", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{s.v}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.55)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 5 }}>
        {bills.map(b => (
          <div key={b.name} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 9, padding: "7px 9px", display: "flex", alignItems: "center", gap: 7, border: `1px solid ${b.accent === '#ef4444' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
            <div style={{ width: 27, height: 27, borderRadius: 7, background: b.accent + "25", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 12, height: 9, background: b.accent, borderRadius: 2 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: "white" }}>{b.name}</div>
              <div style={{ fontSize: 7.5, color: b.accent === '#ef4444' ? '#ef4444' : b.accent === '#FFB347' ? '#FFB347' : '#94a3b8', marginTop: 1 }}>{b.due}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{b.amount}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(15,23,42,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "7px 0 10px", display: "flex", justifyContent: "space-around" }}>
        {[{ icon: "🏠", label: "Home", active: true }, { icon: "📅", label: "Calendar" }, { icon: "➕", label: "Add" }, { icon: "⚙️", label: "Settings" }].map(n => (
          <div key={n.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ fontSize: 12 }}>{n.icon}</div>
            <div style={{ fontSize: 7, color: n.active ? "#6BCB77" : "#64748b", fontWeight: n.active ? 700 : 400 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddBillScreen() {
  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg, #1E2A3A 0%, #263244 100%)", paddingTop: 22, overflow: "hidden" }}>
      <div style={{ padding: "0 12px 10px" }}>
        <div style={{ fontSize: 7.5, color: "#94a3b8", marginBottom: 3 }}>← Back</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #6BCB77, #4DA85A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "white", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>+</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Add a Bill</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6BCB77" }} />
          <div style={{ fontSize: 7.5, color: "#94a3b8" }}>Choose how to import</div>
        </div>
      </div>
      <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ background: "linear-gradient(135deg, #263244, #2d3d55)", border: "1px solid rgba(77,106,159,0.4)", borderRadius: 13, padding: "9px 11px", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #4D6A9F, #3d5a8f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 13, height: 9, background: "white", borderRadius: 2, opacity: 0.8 }} />
          </div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: "white" }}>Add Manually</div>
            <div style={{ fontSize: 7, color: "#94a3b8" }}>Type in your bill details</div>
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(107,203,119,0.12), rgba(77,106,159,0.08))", border: "1px solid rgba(107,203,119,0.35)", borderRadius: 13, padding: "9px 11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #6BCB77, #4DA85A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 13 }}>✦</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "white" }}>Scan or Upload</div>
                <div style={{ fontSize: 6, fontWeight: 700, background: "#FFB347", color: "#1E2A3A", padding: "1px 4px", borderRadius: 5 }}>AI</div>
              </div>
              <div style={{ fontSize: 7, color: "#94a3b8" }}>Reads amount, date & provider</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            {["📷 Camera", "🖼 Photo", "📄 PDF"].map(btn => (
              <div key={btn} style={{ background: "rgba(107,203,119,0.12)", border: "1px solid rgba(107,203,119,0.3)", borderRadius: 7, padding: "5px 0", textAlign: "center", fontSize: 7, color: "white", fontWeight: 600 }}>{btn}</div>
            ))}
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(255,179,71,0.1), rgba(77,106,159,0.06))", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 13, padding: "9px 11px", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #FFB347, #f09020)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 13 }}>✉</span>
          </div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: "white" }}>Forward Emails</div>
            <div style={{ fontSize: 7, color: "#94a3b8" }}>Auto-import from inbox</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen() {
  const rows = [
    { icon: "🔔", label: "Notifications", color: "#6BCB77" },
    { icon: "🛡️", label: "Privacy", color: "#4D6A9F" },
    { icon: "🔒", label: "Security", color: "#FFB347" },
    { icon: "💬", label: "Feedback", color: "#6BCB77" },
  ];
  return (
    <div style={{ height: "100%", background: "linear-gradient(160deg, #1E2A3A 0%, #263244 100%)", paddingTop: 22, overflow: "hidden" }}>
      <div style={{ padding: "0 12px 10px" }}>
        <div style={{ fontSize: 7.5, color: "#94a3b8", marginBottom: 3 }}>← Back</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #4D6A9F, #3d5a8f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚙️</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Settings</div>
        </div>
      </div>
      <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ background: "linear-gradient(135deg, #263244, #2d3d55)", border: "1px solid rgba(107,203,119,0.25)", borderRadius: 13, padding: "9px 11px", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6BCB77, #4DA85A)", border: "2px solid #6BCB77", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: "white" }}>MyBillPort User</div>
            <div style={{ fontSize: 7, color: "#94a3b8" }}>user@email.com</div>
          </div>
          <div style={{ fontSize: 10, color: "#475569" }}>›</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(255,179,71,0.1), rgba(77,106,159,0.08))", border: "1px solid rgba(255,179,71,0.25)", borderRadius: 13, padding: "9px 11px", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,179,71,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>💳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: "white" }}>Free Plan</div>
            <div style={{ fontSize: 7, color: "#94a3b8" }}>Up to 5 bills</div>
          </div>
          <div style={{ fontSize: 7, fontWeight: 700, background: "rgba(255,179,71,0.2)", color: "#FFB347", padding: "2px 5px", borderRadius: 5 }}>FREE</div>
        </div>
        <div style={{ background: "#263244", border: "1px solid rgba(71,85,105,0.25)", borderRadius: 13, overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{ padding: "7px 9px", display: "flex", alignItems: "center", gap: 7, borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: r.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{r.icon}</div>
              <div style={{ flex: 1, fontSize: 8.5, color: "white", fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>›</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 13, padding: "8px 11px", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>🚪</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: "#f87171" }}>Sign Out</div>
        </div>
      </div>
    </div>
  );
}

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

      <section className="pt-16 pb-8 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-[#4D6A9F]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — text */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#6BCB77]/10 border border-[#6BCB77]/20 text-[#6BCB77] text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
                <MapPin className="w-3.5 h-3.5" />
                Built for Canadians
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Never miss a bill.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4D6A9F] to-[#6BCB77]">
                  Avoid late fees.
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                Track, get reminders, and pay bills in one place. Supports Rogers, Bell, Enbridge, and 120+ Canadian billers.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-1">
                <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-8 py-4 rounded-full transition-colors flex items-center gap-2 text-base shadow-lg shadow-[#4D6A9F]/20">
                  Start for free <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#how" className="border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium px-8 py-4 rounded-full transition-colors text-base inline-block">
                  See how it works
                </a>
              </div>
              <p className="text-xs text-slate-500">No credit card · No bank login · Cancel anytime</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-5 pt-2">
                {[
                  { label: "No bank login" },
                  { label: "AI bill scanning" },
                  { label: "120+ billers" },
                ].map((t) => (
                  <span key={t.label} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CheckCircle className="w-3.5 h-3.5 text-[#6BCB77] flex-shrink-0" />
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — three phone frames */}
            <div className="flex-shrink-0 relative hidden md:flex items-end justify-center" style={{ height: 460, width: 360 }}>
              {/* Left phone — Settings, tilted left */}
              <div className="absolute" style={{ left: 0, bottom: 0, zIndex: 1, transform: "rotate(-6deg) scale(0.85)", transformOrigin: "center bottom", opacity: 0.9 }}>
                <PhoneMockup>
                  <SettingsScreen />
                </PhoneMockup>
              </div>
              {/* Center phone — Dashboard, upright */}
              <div className="absolute" style={{ left: 100, bottom: 0, zIndex: 3 }}>
                <PhoneMockup shadow="0 48px 96px rgba(0,0,0,0.55)">
                  <DashboardScreen />
                </PhoneMockup>
              </div>
              {/* Right phone — Add Bill, tilted right */}
              <div className="absolute" style={{ left: 218, bottom: 0, zIndex: 2, transform: "rotate(6deg) scale(0.85)", transformOrigin: "center bottom", opacity: 0.9 }}>
                <PhoneMockup>
                  <AddBillScreen />
                </PhoneMockup>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 core actions — immediately below hero */}
      <div className="max-w-4xl mx-auto px-5 pb-4">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: PlusCircle,
              color: "#4D6A9F",
              title: "Add a Bill",
              body: "Snap a photo or type it in. Done in 30 seconds.",
            },
            {
              icon: Bell,
              color: "#FFB347",
              title: "Get Reminded",
              body: "Push notifications before every due date.",
            },
            {
              icon: CreditCard,
              color: "#6BCB77",
              title: "Pay It",
              body: "One tap to your biller's official payment page.",
            },
          ].map((a) => (
            <div key={a.title} className="bg-[#263244] border border-white/5 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.color + "20" }}>
                <a.icon className="w-6 h-6" style={{ color: a.color }} />
              </div>
              <div>
                <p className="font-bold text-white text-base">{a.title}</p>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-y border-white/5 bg-white/[0.02] py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-slate-500">
          {["120+ Canadian billers", "AI-powered bill scanning", "256-bit encryption", "No bank login required"].map((t) => (
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

        <section id="demo" className="scroll-mt-20 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">See it in action</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Watch how MyBillPort works</h2>
            <p className="text-slate-400 text-base">From adding your first bill to hitting "Pay" — under 90 seconds.</p>
          </div>
          <div className="relative bg-[#1a2535] border border-white/5 rounded-3xl overflow-hidden aspect-video max-w-3xl mx-auto group cursor-pointer">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <div className="w-20 h-20 bg-[#4D6A9F] group-hover:bg-[#3d5a8f] rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-[#4D6A9F]/30">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <div className="text-center space-y-1 px-6">
                <p className="text-white font-semibold text-lg">Demo video coming soon</p>
                <p className="text-slate-400 text-sm">Record a quick walkthrough with Loom or QuickTime and drop the link here</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4D6A9F]/5 to-[#6BCB77]/5 pointer-events-none" />
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

      {/* Trust signals */}
      <div className="max-w-5xl mx-auto px-5 py-4">
        <div className="bg-[#263244] border border-white/5 rounded-3xl px-8 py-10">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#6BCB77]/10 border border-[#6BCB77]/20 text-[#6BCB77] text-xs font-semibold px-3 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" />
              Secure by design
            </div>
            <h2 className="text-2xl font-bold text-white">Your money stays yours</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">We redirect you to pay directly on your biller's website. We never touch your payment.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                color: "#6BCB77",
                title: "Payments via official biller sites",
                body: "You pay Rogers, Bell, or Enbridge directly on their own website. MyBillPort just takes you there.",
              },
              {
                icon: Lock,
                color: "#4D6A9F",
                title: "We never store your card details",
                body: "No card numbers, no banking credentials. We don't process payments — we just organize them.",
              },
              {
                icon: Eye,
                color: "#FFB347",
                title: "No bank login required",
                body: "Unlike Mint or other trackers, we never ask for your banking password or connect to your accounts.",
              },
            ].map((t) => (
              <div key={t.title} className="flex flex-col items-center text-center gap-3 p-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: t.color + "15" }}>
                  <t.icon className="w-6 h-6" style={{ color: t.color }} />
                </div>
                <p className="font-semibold text-white text-sm">{t.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#6BCB77]" /> 256-bit encryption</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#4D6A9F]" /> Firebase secure storage</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#6BCB77]" /> SOC 2 practices</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#FFB347]" /> No data sold, ever</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 mt-4" id="faq">
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 md:col-span-2">
              <LogoFull height={28} />
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Never miss a bill again. The simplest way to manage all your Canadian bills in one place.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[
                  { href: "https://www.instagram.com/mybillport?igsh=aWFsdDk5bmdzZDd2&utm_source=qr", Icon: SiInstagram, label: "Instagram", color: "#E1306C", bg: "#E1306C15" },
                  { href: "https://www.tiktok.com/@mybillport1?_r=1&_t=ZS-95oj7SkG3r5", Icon: SiTiktok, label: "TikTok", color: "#ffffff", bg: "#ffffff10" },
                  { href: "https://www.reddit.com/u/mybillport/s/gtHdINy5PN", Icon: SiReddit, label: "Reddit", color: "#FF4500", bg: "#FF450015" },
                  { href: "https://x.com/mybillport?s=21", Icon: SiX, label: "X (Twitter)", color: "#e7e7e7", bg: "#ffffff10" },
                  { href: "https://www.linkedin.com/in/my-billport-3a5101406", Icon: SiLinkedin, label: "LinkedIn", color: "#0A66C2", bg: "#0A66C215" },
                ].map(({ href, Icon, label, color, bg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center hover:border-white/20 transition-all duration-200 hover:scale-110"
                    style={{ background: bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </a>
                ))}
              </div>
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
              <p className="text-sm font-semibold text-white mb-3">Guides</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/how-to-track-bills" className="hover:text-white transition-colors">How to track bills</Link></li>
                <li><Link href="/avoid-late-fees" className="hover:text-white transition-colors">Avoid late fees</Link></li>
                <li><Link href="/bill-tracker-canada" className="hover:text-white transition-colors">Bill tracker Canada</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Help Centre</Link></li>
                <li><a href="mailto:mybillportinfo@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
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
