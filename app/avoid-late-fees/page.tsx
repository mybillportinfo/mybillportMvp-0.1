import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bell, CheckCircle, AlertTriangle, Calendar, CreditCard, Clock, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Avoid Late Fees on Bills (2026 Guide) | MyBillPort',
  description: 'Stop paying late fees. Learn practical strategies and use our smart bill reminder app to always pay on time. Free for Canadians.',
  alternates: { canonical: 'https://mybillport.com/avoid-late-fees' },
  openGraph: {
    title: 'How to Avoid Late Fees on Bills (2026 Guide) | MyBillPort',
    description: 'Practical strategies to never pay a late fee again. Including how smart bill reminders automate the process.',
    url: 'https://mybillport.com/avoid-late-fees',
  },
};

export default function AvoidLateFeesPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Avoid Late Fees</span>
        </nav>

        {/* Hero */}
        <header className="space-y-5">
          <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">Late Fee Guide</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            How to Avoid Late Fees on Bills
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Late fees are one of the most avoidable expenses Canadians pay. A $25 late fee on your hydro bill or a $35 charge on your credit card can add up to hundreds of dollars per year — for something that's entirely preventable. Here's exactly how to stop paying late fees for good.
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>6 min read · Updated March 2026</span>
          </div>
        </header>

        {/* Why late fees happen */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Why Late Fees Happen</h2>
          <p className="text-slate-400 leading-relaxed">
            It's rarely because people can't afford to pay. Late fees usually happen for a few very predictable reasons:
          </p>
          <ul className="space-y-3">
            {[
              'Due dates fall at different times of the month and are easy to forget',
              'Bill amounts vary month to month, making it hard to plan ahead',
              'A bill gets buried in email and is noticed only after the due date',
              'A payment was made but to the wrong amount, leaving a balance',
              'Auto-pay failed silently due to an expired card or insufficient funds',
            ].map(r => (
              <li key={r} className="flex gap-3 text-slate-400 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mt-4">
            <p className="text-red-300 text-sm font-medium mb-1">The real cost</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              The average Canadian household with 10+ bills could pay $200–$400/year in avoidable late fees. Beyond the money, repeated late payments can affect your credit score and, for utilities, result in service disconnection notices.
            </p>
          </div>
        </section>

        {/* 5 strategies */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-white">5 Proven Strategies to Avoid Late Fees</h2>
          <div className="space-y-6">
            {[
              {
                icon: Bell,
                num: 1,
                title: 'Set Up Bill Reminders Before Due Dates',
                body: 'A reminder 5–7 days before a bill is due gives you enough time to review the amount, transfer funds if needed, and pay without rushing. Calendar reminders work, but a dedicated bill reminder app like MyBillPort sends automatic push notifications to your phone for every bill — without any setup required beyond adding the bill once.',
                tip: 'Set reminders 5–7 days early, not the day before.',
              },
              {
                icon: CreditCard,
                num: 2,
                title: 'Use Auto-Pay — Carefully',
                body: "Auto-pay is excellent for fixed bills like subscriptions and insurance. For variable bills like hydro or phone, review the amount first — auto-pay can charge more than expected if your usage spiked. Always verify that your linked payment method is current, since expired card details are the #1 reason auto-pay silently fails.",
                tip: 'Pair auto-pay with a bill tracker that flags unusual amounts.',
              },
              {
                icon: Calendar,
                num: 3,
                title: 'Consolidate Your Due Dates',
                body: "Many Canadian utility and telecom providers will let you request a due date change with a simple phone call or online request. Pick one or two dates per month — for example, the 1st and 15th — and move as many bills as possible to those dates. This dramatically simplifies tracking and makes it easier to ensure funds are available.",
                tip: 'Call your provider and request a billing date change — most will accommodate.',
              },
              {
                icon: TrendingUp,
                num: 4,
                title: 'Watch for Bill Increases',
                body: "A sudden increase in a bill amount — especially for variable bills like electricity or internet overage charges — can catch you off guard. If you're expecting to pay $120 but the bill comes in at $180, you might not have sufficient funds available. Smart bill trackers flag these spikes automatically, giving you advance warning.",
                tip: 'MyBillPort alerts you when any bill is 20%+ higher than usual.',
              },
              {
                icon: CheckCircle,
                num: 5,
                title: 'Keep a Small Bill Buffer in Your Account',
                body: "Maintain a buffer of $200\u2013$500 in your chequing account specifically for bills. This prevents situations where a bill hits right before payday and you don't have enough to cover it. Once you have all your bills organized in a tracker, you'll know exactly how much you need each month — making this buffer easy to calculate.",
                tip: 'Know your monthly bill total before setting your buffer amount.',
              },
            ].map(s => (
              <div key={s.num} className="bg-[#1a2535] border border-white/5 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4D6A9F]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-[#4D6A9F]" />
                  </div>
                  <h3 className="text-base font-bold text-white">{s.num}. {s.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
                <div className="flex items-start gap-2 bg-[#6BCB77]/5 border border-[#6BCB77]/15 rounded-lg px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#6BCB77] flex-shrink-0 mt-0.5" />
                  <p className="text-[#6BCB77] text-xs font-medium">{s.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How MyBillPort helps */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">How MyBillPort's Reminders Help</h2>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort combines strategies 1, 4, and 5 into a single dashboard. Add your bills once, and the app:
          </p>
          <ul className="space-y-3">
            {[
              'Sends a push notification to your phone before every due date',
              'Shows your total monthly bill spend so you can set an accurate buffer',
              'Flags any bill that\'s 20%+ higher than usual with an orange alert banner',
              'Tracks payment history so you can verify every payment was processed correctly',
              'Shows which bills are overdue, due today, and due within 3 days at the top of the dashboard',
            ].map(f => (
              <li key={f} className="flex gap-3 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        {/* Internal links */}
        <section className="space-y-4 bg-[#1a2535] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white">Related Guides</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/how-to-track-bills" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> How to track all your bills in one place →
              </Link>
            </li>
            <li>
              <Link href="/bill-tracker-canada" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> The best Canadian bill tracker →
              </Link>
            </li>
            <li>
              <Link href="/blog/how-to-remember-bill-payments" className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                <ArrowRight className="w-4 h-4" /> How to remember bill payments →
              </Link>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#4D6A9F]/20 to-[#6BCB77]/10 border border-[#4D6A9F]/20 rounded-3xl p-8 text-center space-y-5">
          <h2 className="text-2xl font-bold text-white">Never Pay a Late Fee Again</h2>
          <p className="text-slate-400 max-w-md mx-auto">MyBillPort sends reminders before every due date and alerts you to unusual bill increases. Free to start — no credit card required.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
