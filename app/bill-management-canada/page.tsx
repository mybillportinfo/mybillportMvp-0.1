import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bell, Bot, LayoutDashboard, CheckCircle, Clock, DollarSign, Shield, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bill Management Canada — Track Every Bill in One Place | MyBillPort',
  description: 'The best bill management app for Canadians. Track Rogers, Bell, Telus, Enbridge and all your bills in one dashboard. Get reminders before due dates. Free to start.',
  keywords: ['bill management Canada', 'Canadian bill tracker', 'manage bills Canada', 'bill organizer Canada'],
  alternates: { canonical: 'https://mybillport.com/bill-management-canada' },
  openGraph: {
    title: 'Bill Management Canada — Track Every Bill in One Place | MyBillPort',
    description: 'Track Rogers, Bell, Telus, Enbridge and all your bills in one dashboard. Get reminders before due dates.',
    url: 'https://mybillport.com/bill-management-canada',
  },
};

const billers = ['Rogers', 'Bell', 'Telus', 'Enbridge', 'Toronto Hydro', 'Hydro-Québec', 'BC Hydro', 'Shaw', 'Videotron', 'Fido', 'Freedom Mobile', 'Virgin Plus', 'Koodo', 'PC Financial'];

const benefits = [
  {
    icon: LayoutDashboard,
    color: 'text-[#4D6A9F]',
    bg: 'bg-[#4D6A9F]/10 border-[#4D6A9F]/20',
    title: 'One Dashboard for Every Bill',
    body: "Stop logging into six different websites. Rogers, Bell, Enbridge, your credit card, your landlord's payment portal — everything lives in one clean list with amounts, due dates, and payment status at a glance.",
  },
  {
    icon: Bell,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: "Reminders Before You're Late",
    body: 'MyBillPort sends push notifications to your phone 7 days, 3 days, and 1 day before each bill is due. No more surprises. No more "I totally forgot" moments. No more late fees.',
  },
  {
    icon: Bot,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'AI Bill Scanning',
    body: 'Take a photo of any paper bill or upload a PDF. Our AI reads the vendor name, amount, due date, and account number automatically and adds it to your dashboard in seconds.',
  },
];

const faqs = [
  { q: 'Is MyBillPort free to use?', a: 'Yes — the free plan supports up to 5 bills and all core features. Premium ($7/month CAD) gives you unlimited bills and advanced analytics.' },
  { q: 'Does MyBillPort connect to my bank?', a: 'No. MyBillPort does not connect to your bank or require any financial credentials. You enter bills manually or by scanning them. Your money stays yours.' },
  { q: 'Which Canadian billers are supported?', a: 'MyBillPort works with any biller you add — Rogers, Bell, Telus, Enbridge, Hydro, insurance, rent, car loan, or anything else. We have a directory of 120+ Canadian providers for one-click payment redirects.' },
  { q: 'Does it work on my phone?', a: 'Yes. MyBillPort is a Progressive Web App (PWA) — it works on any device and can be installed to your home screen on iPhone or Android for a native app experience.' },
];

export default function BillManagementCanadaPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-16">

        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Bill Management Canada</span>
        </nav>

        <header className="space-y-5">
          <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">For Canadians</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Bill Management for Canadians Who Are Tired of Late Fees
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            The average Canadian pays $300–$500 in unnecessary late fees every year — not because they can't afford the bills, but because they lose track of them. MyBillPort fixes that by putting every bill in one place and reminding you before any of them are due.
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>5 min read · Updated June 2026</span>
          </div>
        </header>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">The Canadian Bill Problem</h2>
          <p className="text-slate-400 leading-relaxed">
            A typical Canadian household manages 8–15 recurring bills every month: Rogers or Bell for internet and phone, Enbridge or local hydro for utilities, car insurance, tenant or home insurance, a car loan, streaming services, a credit card minimum, and rent or a mortgage payment. Each one has its own due date, its own website, and its own login.
          </p>
          <p className="text-slate-400 leading-relaxed">
            The problem isn't that Canadians are disorganized — it's that the system is genuinely fragmented. There's no single place to see what's due this week. Bank apps show you what's already been paid, not what's coming up. Spreadsheets require manual updates. Calendar reminders get snoozed and forgotten.
          </p>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort was built specifically to solve this problem for Canadians — with support for 120+ Canadian providers, CAD-native amounts, and smart reminders that fire on your phone before bills are overdue.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">What MyBillPort Does</h2>
          <div className="space-y-4">
            {benefits.map(b => {
              const Icon = b.icon;
              return (
                <div key={b.title} className={`bg-[#0f1c2e] border rounded-2xl p-6 flex gap-5 ${b.bg}`}>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${b.bg}`}>
                    <Icon className={`w-6 h-6 ${b.color}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{b.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Supported Canadian Billers</h2>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort includes a built-in directory of major Canadian providers. When it is time to pay, one tap takes you directly to the biller's official payment page — no Googling, no hunting for the right login URL.
          </p>
          <div className="flex flex-wrap gap-2">
            {billers.map(b => (
              <span key={b} className="bg-[#1a2535] border border-white/5 text-slate-300 text-sm px-3 py-1.5 rounded-full">{b}</span>
            ))}
            <span className="bg-[#1a2535] border border-white/5 text-slate-500 text-sm px-3 py-1.5 rounded-full">+ 100 more</span>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">How the Reminders Work</h2>
          <p className="text-slate-400 leading-relaxed">
            Add a bill to MyBillPort with its due date and amount. The app automatically schedules three reminder notifications:
          </p>
          <ul className="space-y-3">
            {[
              { label: '7 days before', desc: 'An early heads-up so you can transfer funds if needed' },
              { label: '3 days before', desc: 'A firmer reminder to log in and pay' },
              { label: '1 day before', desc: 'A final alert so nothing slips through' },
            ].map(r => (
              <li key={r.label} className="flex gap-3 text-slate-400 text-sm">
                <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">{r.label}:</strong> {r.desc}</span>
              </li>
            ))}
          </ul>
          <p className="text-slate-400 leading-relaxed">
            Notifications work even when your browser is closed — they are delivered as native push notifications to your phone, just like any other app.
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">What Makes This Different from a Spreadsheet</h2>
          <p className="text-slate-400 leading-relaxed">
            Spreadsheets work great — until you forget to update them. The fundamental problem with a spreadsheet for bill management is that it's passive. It doesn't remind you. It doesn't update itself. It doesn't know when a bill is about to be overdue.
          </p>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort is active. When Rogers charges you $12 more than usual this month, it flags it. When your Bell bill is 3 days away, it sends a push notification to your phone. When you've paid a bill, it automatically moves it to paid status. The app works for you instead of requiring you to maintain it.
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Privacy and Security</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'No bank connection required', desc: 'MyBillPort never asks for banking credentials or connects to your financial accounts.' },
              { icon: DollarSign, title: 'No payment processing', desc: "We redirect you to the biller's official site to pay. We never touch your payment details." },
              { icon: Smartphone, title: 'Your data stays private', desc: "Bill data is stored securely in your account only. We don't sell data or share it with third parties." },
              { icon: CheckCircle, title: 'Free to start', desc: 'No credit card required to sign up. The free plan covers up to 5 bills with all core features.' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-[#0f1c2e] border border-white/5 rounded-xl p-5">
                  <Icon className="w-5 h-5 text-[#4D6A9F] mb-3" />
                  <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="bg-[#0f1c2e] border border-white/5 rounded-xl p-5">
                <p className="text-white font-semibold mb-2">{faq.q}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#1a2535] to-[#0f1c2e] border border-[#4D6A9F]/20 rounded-2xl p-8 text-center space-y-5">
          <h2 className="text-2xl font-bold text-white">Start Managing Your Bills Today</h2>
          <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
            Free to start. No bank connection. No credit card required. Set up in under 2 minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold py-4 px-8 rounded-xl transition-colors text-base"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-600 text-xs">Free plan · No credit card · Cancel anytime</p>
        </section>

      </div>
    </div>
  );
}
