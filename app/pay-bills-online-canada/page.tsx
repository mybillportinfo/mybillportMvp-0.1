import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, ExternalLink, Shield, Bell, Zap, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pay Bills Online Canada — One Place for All Your Canadian Bills | MyBillPort',
  description: 'Pay Rogers, Bell, Telus, Enbridge, and 120+ Canadian billers online from one dashboard. MyBillPort tracks due dates, sends reminders, and takes you directly to each biller\'s payment page.',
  keywords: ['pay bills online Canada', 'Canadian bill payment', 'pay Rogers online', 'pay Bell online', 'pay Telus online', 'pay Enbridge online'],
  alternates: { canonical: 'https://mybillport.com/pay-bills-online-canada' },
  openGraph: {
    title: 'Pay Bills Online Canada — One Place for All Your Canadian Bills | MyBillPort',
    description: 'Track and pay Rogers, Bell, Telus, Enbridge, and 120+ Canadian billers from one dashboard.',
    url: 'https://mybillport.com/pay-bills-online-canada',
  },
};

const providers = [
  { name: 'Rogers', desc: 'Internet, cable, mobile' },
  { name: 'Bell', desc: 'Internet, TV, mobile' },
  { name: 'Telus', desc: 'Internet, mobile, home security' },
  { name: 'Enbridge', desc: 'Natural gas' },
  { name: 'Toronto Hydro', desc: 'Electricity — Toronto' },
  { name: 'BC Hydro', desc: 'Electricity — British Columbia' },
  { name: 'Hydro-Québec', desc: 'Electricity — Québec' },
  { name: 'Fido', desc: 'Mobile, internet' },
  { name: 'Freedom Mobile', desc: 'Mobile, internet' },
  { name: 'Shaw', desc: 'Internet, TV, phone' },
  { name: 'Koodo', desc: 'Mobile' },
  { name: 'Virgin Plus', desc: 'Mobile, internet' },
];

const steps = [
  { n: '1', title: 'Add your bills', desc: 'Enter each bill manually or scan a paper bill with your phone camera. MyBillPort extracts the vendor, amount, and due date automatically.' },
  { n: '2', title: 'Get reminded before due dates', desc: 'The app sends push notifications 7, 3, and 1 day before each bill is due. You always know what\'s coming up before it\'s overdue.' },
  { n: '3', title: 'Tap to pay', desc: "When you're ready to pay, tap the Pay button next to any bill. MyBillPort takes you directly to the biller's official payment page — no searching, no wrong URLs." },
  { n: '4', title: 'Mark as paid', desc: 'After paying, mark the bill as paid in the app. It moves to your payment history and the next billing cycle begins automatically for recurring bills.' },
];

export default function PayBillsOnlineCanadaPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-16">

        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Pay Bills Online Canada</span>
        </nav>

        <header className="space-y-5">
          <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">Canadian Bill Payment</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Pay Bills Online in Canada — One Dashboard, Every Biller
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Paying bills online in Canada shouldn't mean bookmarking 10 different websites and remembering 10 different logins. MyBillPort tracks all your bills in one place and sends you directly to each biller's official payment page when it's time to pay.
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>5 min read · Updated June 2026</span>
          </div>
        </header>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Why Paying Bills Online in Canada Is So Fragmented</h2>
          <p className="text-slate-400 leading-relaxed">
            Online bill payment in Canada is technically available from almost every biller — Rogers, Bell, Telus, Enbridge, Toronto Hydro, BC Hydro, Hydro-Québec, your insurance company, your credit card issuer. But every one of them has a separate website, a separate login, and a separate app. There's no central place to go.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Some Canadians use online banking to pay bills through their bank's bill pay feature. That works for some billers but not all — and it still doesn't tell you what's due next week, or flag when your Rogers bill is $20 higher than last month.
          </p>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort adds the layer that's missing: a single dashboard that tracks every bill, reminds you before due dates, and links directly to each biller's official payment page when you're ready to pay.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">How It Works</h2>
          <div className="space-y-4">
            {steps.map(s => (
              <div key={s.n} className="bg-[#0f1c2e] border border-white/5 rounded-2xl p-6 flex gap-5">
                <div className="w-10 h-10 rounded-full bg-[#4D6A9F]/20 border border-[#4D6A9F]/30 flex items-center justify-center flex-shrink-0 text-[#4D6A9F] font-bold text-lg">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">120+ Canadian Billers Supported</h2>
          <p className="text-slate-400 leading-relaxed">
            MyBillPort maintains a directory of over 120 Canadian billers. Each one has a verified direct payment URL. When you tap Pay on a bill, you go directly to the right page — not a search result, not an outdated link.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {providers.map(p => (
              <div key={p.name} className="bg-[#0f1c2e] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-[#4D6A9F] flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">{p.name}</p>
                  <p className="text-slate-500 text-xs">{p.desc}</p>
                </div>
              </div>
            ))}
            <div className="bg-[#0f1c2e] border border-white/5 rounded-xl p-4 flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-semibold text-sm">+ 100 more billers</p>
                <p className="text-slate-600 text-xs">Insurance, utilities, telecom, services</p>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            For billers not in our directory, we fall back to a Google search for the biller's official payment page so you're never stuck.
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Smart Reminders That Actually Work</h2>
          <p className="text-slate-400 leading-relaxed">
            The biggest reason Canadians pay late fees isn't that they don't want to pay — it's that they forget. MyBillPort sends native push notifications directly to your phone at the right time:
          </p>
          <ul className="space-y-3">
            {[
              { label: '7 days before due', desc: "Early warning — time to make sure funds are available" },
              { label: '3 days before due', desc: "Action reminder — enough time to schedule the payment" },
              { label: '1 day before due', desc: "Final alert — pay today to avoid any late fee" },
            ].map(r => (
              <li key={r.label} className="flex gap-3 text-slate-400 text-sm">
                <Bell className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">{r.label}:</strong> {r.desc}</span>
              </li>
            ))}
          </ul>
          <p className="text-slate-400 leading-relaxed">
            These reminders fire even when the app is closed, using the same Web Push technology that major banking apps use. You don't need to keep the app open to get your alerts.
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">MyBillPort vs. Your Bank's Bill Pay</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-3 text-slate-400 font-semibold pr-6">Feature</th>
                  <th className="pb-3 text-white font-semibold pr-6">MyBillPort</th>
                  <th className="pb-3 text-slate-400 font-semibold">Bank Bill Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['See upcoming bills', '✅', '❌'],
                  ['Reminders before due dates', '✅', '❌'],
                  ['AI bill scanning', '✅', '❌'],
                  ['Spike / overpayment alerts', '✅', '❌'],
                  ['120+ direct payment links', '✅', 'Partial'],
                  ['Works with any biller', '✅', 'Partial'],
                  ['No bank login required', '✅', '❌'],
                ].map(([feat, mbp, bank]) => (
                  <tr key={feat as string}>
                    <td className="py-3 text-slate-400 pr-6">{feat}</td>
                    <td className="py-3 text-[#6BCB77] font-medium pr-6">{mbp}</td>
                    <td className="py-3 text-slate-500">{bank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Safe and Private</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'No bank connection', desc: 'We never access your banking credentials or financial accounts.' },
              { icon: DollarSign, title: 'No payment handling', desc: "We link to the biller's site. We never process or store payment info." },
              { icon: Zap, title: 'Free to start', desc: 'Track up to 5 bills free. Premium is $7/month CAD for unlimited bills.' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-[#0f1c2e] border border-white/5 rounded-xl p-5 text-center">
                  <div className="w-10 h-10 bg-[#4D6A9F]/10 border border-[#4D6A9F]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-[#4D6A9F]" />
                  </div>
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
            {[
              { q: 'Does MyBillPort actually pay my bills?', a: "No — MyBillPort tracks your bills and sends you directly to each biller's official payment website when you're ready to pay. You complete the payment on the biller's own site. We never handle money." },
              { q: 'What if my biller isn\'t in the directory?', a: "You can still add any biller to MyBillPort. For billers not in our directory, tapping Pay will open a Google search for the biller's payment page. You can also paste in a custom payment URL yourself." },
              { q: 'Can I use this for credit card payments?', a: 'Yes. Add your credit card as a bill with its payment due date and minimum amount. MyBillPort will remind you before the due date the same way it does for utility bills.' },
              { q: 'Is it available across Canada?', a: 'Yes. MyBillPort works coast to coast and supports billers from all provinces including Ontario, BC, Alberta, Quebec, and the Maritimes.' },
            ].map(faq => (
              <div key={faq.q} className="bg-[#0f1c2e] border border-white/5 rounded-xl p-5">
                <p className="text-white font-semibold mb-2">{faq.q}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#1a2535] to-[#0f1c2e] border border-[#4D6A9F]/20 rounded-2xl p-8 text-center space-y-5">
          <h2 className="text-2xl font-bold text-white">Stop Juggling 10 Different Bill Websites</h2>
          <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
            One dashboard. All your Canadian bills. Reminders that fire before due dates. Free to start in under 2 minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold py-4 px-8 rounded-xl transition-colors text-base"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-600 text-xs">Free plan · No bank login · Cancel anytime</p>
        </section>

      </div>
    </div>
  );
}
