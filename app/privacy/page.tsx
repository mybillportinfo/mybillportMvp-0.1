import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MyBillPort",
  description: "Learn how MyBillPort collects, uses, and protects your personal information in compliance with Canadian PIPEDA privacy law.",
  alternates: { canonical: "https://mybillport.com/privacy" },
};

const EFFECTIVE_DATE = "June 10, 2026";

const TOC = [
  { id: "introduction",        label: "1. Introduction" },
  { id: "data-collected",      label: "2. What Data We Collect" },
  { id: "how-we-use",          label: "3. How We Use Your Data" },
  { id: "data-storage",        label: "4. Data Storage" },
  { id: "pipeda",              label: "5. PIPEDA Compliance" },
  { id: "cookies",             label: "6. Cookies & Tracking" },
  { id: "breach",              label: "7. Data Breach Notification" },
  { id: "third-parties",       label: "8. Third-Party Services" },
  { id: "google-api",          label: "9. Google API Services" },
  { id: "children",            label: "10. Children's Privacy" },
  { id: "retention",           label: "11. Data Retention" },
  { id: "changes",             label: "12. Changes to This Policy" },
  { id: "contact",             label: "13. Contact Us" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">

      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#6BCB77]" />
            <span className="text-white font-semibold">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 pb-24">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE} · Governing law: Province of Ontario, Canada</p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-12">
          <p className="text-white font-semibold text-sm mb-3">Table of Contents</p>
          <ol className="space-y-1.5">
            {TOC.map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-[#4D6A9F] hover:text-[#7b9fd4] text-sm transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-12">

          {/* 1. Introduction */}
          <section id="introduction">
            <h2 className="text-lg font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              MyBillPort (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service at mybillport.com.
            </p>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm space-y-1">
              <p className="text-slate-300"><span className="text-white font-semibold">Company:</span> MyBillPort</p>
              <p className="text-slate-300"><span className="text-white font-semibold">Effective Date:</span> {EFFECTIVE_DATE}</p>
              <p className="text-slate-300"><span className="text-white font-semibold">Governing Law:</span> Province of Ontario, Canada</p>
              <p className="text-slate-300"><span className="text-white font-semibold">Privacy Contact:</span>{" "}
                <a href="mailto:privacy@mybillport.com" className="text-[#4D6A9F] hover:underline">privacy@mybillport.com</a>
              </p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mt-3">
              This policy is governed by Canada&apos;s{" "}
              <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) and applicable Ontario provincial privacy laws.
            </p>
          </section>

          {/* 2. What Data We Collect */}
          <section id="data-collected">
            <h2 className="text-lg font-bold text-white mb-4">2. What Data We Collect</h2>
            <div className="space-y-3">
              {[
                {
                  label: "Account Information",
                  desc: "Email address and display name collected at account creation. If you sign in with Google, we receive your name, email, and profile photo from Google for authentication only.",
                },
                {
                  label: "Bill Information",
                  desc: "Vendor name, amount, due date, account number, payment status, and any bill images or PDFs you upload for AI scanning.",
                },
                {
                  label: "Payment Information",
                  desc: "Subscription payment data (card details, billing address) is collected and processed by Stripe Inc. MyBillPort does not store raw card numbers on our servers.",
                },
                {
                  label: "Push Notification Tokens",
                  desc: "Device push subscription tokens used solely to deliver bill reminders. Stored only with your explicit permission.",
                },
                {
                  label: "Usage Analytics",
                  desc: "Feature usage and interaction data collected via PostHog and Firebase Analytics to help us improve the product.",
                },
                {
                  label: "Performance & Error Data",
                  desc: "Crash reports and performance traces collected via Sentry and Vercel Analytics to diagnose and fix issues.",
                },
                {
                  label: "Technical Data",
                  desc: "IP address, browser type, operating system, and device identifiers used for security, fraud prevention, and analytics.",
                },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. How We Use Your Data */}
          <section id="how-we-use">
            <h2 className="text-lg font-bold text-white mb-4">3. How We Use Your Data</h2>
            <div className="space-y-2">
              {[
                "To provide bill tracking, due-date management, and reminders",
                "To send push notifications 7, 3, and 1 day before bills are due",
                "To process your $7/month CAD premium subscription via Stripe",
                "To run AI bill extraction from uploaded images and PDFs",
                "To detect recurring billing patterns and flag unusual charge amounts",
                "To improve and personalize the app using anonymized analytics",
                "To respond to your support requests",
                "To comply with applicable legal obligations",
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-[#6BCB77] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Data Storage */}
          <section id="data-storage">
            <h2 className="text-lg font-bold text-white mb-4">4. Data Storage</h2>
            <div className="space-y-3">
              {[
                { label: "Primary Storage", desc: "Your bill data, account information, and push notification tokens are stored in Google Firebase Firestore. Firebase servers are located in the United States." },
                { label: "Payment Data", desc: "All payment and subscription data is handled by Stripe Inc and stored on Stripe's PCI-DSS compliant infrastructure. MyBillPort does not store raw card numbers." },
                { label: "Bill Images & PDFs", desc: "Files you upload for AI scanning are processed in memory and are not permanently stored on our servers after extraction is complete." },
                { label: "No Data Selling", desc: "We never sell, rent, or trade your personal information to third parties under any circumstances." },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. PIPEDA */}
          <section id="pipeda">
            <h2 className="text-lg font-bold text-white mb-4">5. PIPEDA Compliance (Canadian Law)</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              MyBillPort complies with the <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA). Under PIPEDA, you have the following rights regarding your personal information:
            </p>
            <div className="space-y-2 mb-4">
              {[
                { right: "Right to Access", desc: "You may request a copy of the personal information we hold about you." },
                { right: "Right to Correct", desc: "You may request correction of inaccurate or incomplete personal information." },
                { right: "Right to Delete", desc: "You may request deletion of your account and all associated personal data. We will complete deletion within 30 days." },
                { right: "Right to Withdraw Consent", desc: "You may withdraw consent for certain uses of your information at any time, subject to legal and contractual restrictions." },
                { right: "Right to Complain", desc: "You have the right to file a complaint with the Office of the Privacy Commissioner of Canada (OPC) if you believe your privacy rights have been violated." },
              ].map(({ right, desc }) => (
                <div key={right} className="flex gap-3 text-sm">
                  <span className="text-[#6BCB77] flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-slate-300"><strong className="text-white">{right}:</strong> {desc}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#4D6A9F]/10 border border-[#4D6A9F]/30 rounded-lg p-4 text-sm">
              <p className="text-slate-300">To exercise any of these rights, contact our Privacy Officer at{" "}
                <a href="mailto:privacy@mybillport.com" className="text-[#4D6A9F] hover:underline">privacy@mybillport.com</a>.
                We will respond within 30 days of receiving your request.
              </p>
            </div>
          </section>

          {/* 6. Cookies & Tracking */}
          <section id="cookies">
            <h2 className="text-lg font-bold text-white mb-4">6. Cookies and Tracking</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              MyBillPort uses the following tracking and analytics tools. We obtain your consent via our cookie banner before placing non-essential cookies.
            </p>
            <div className="space-y-3">
              {[
                { service: "Firebase Analytics (Google)", purpose: "Tracks app usage, feature adoption, and session data to help us understand how users interact with the product." },
                { service: "PostHog", purpose: "Tracks specific feature usage events to inform product decisions. Data is pseudonymized." },
                { service: "Vercel Analytics", purpose: "Tracks page load performance and Core Web Vitals to optimize speed and reliability." },
                { service: "Essential Session Cookies", purpose: "Required for login sessions and user preferences. Cannot be disabled without breaking the app." },
              ].map(({ service, purpose }) => (
                <div key={service} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-white font-semibold text-sm mb-1">{service}</p>
                  <p className="text-slate-400 text-sm">{purpose}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm mt-4">
              To opt out of non-essential analytics, contact us at{" "}
              <a href="mailto:privacy@mybillport.com" className="text-[#4D6A9F] hover:underline">privacy@mybillport.com</a>.
            </p>
          </section>

          {/* 7. Data Breach Notification */}
          <section id="breach">
            <h2 className="text-lg font-bold text-white mb-4">7. Data Breach Notification</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              In the event of a data breach that poses a real risk of significant harm to users, MyBillPort will take the following steps in accordance with PIPEDA:
            </p>
            <div className="space-y-3">
              {[
                { label: "User Notification", desc: "We will notify all affected users within 72 hours of discovering a breach that poses a risk of significant harm. Notification will be sent via email to the address on your account." },
                { label: "Regulator Notification", desc: "We will notify the Office of the Privacy Commissioner of Canada (OPC) as required under PIPEDA's mandatory breach reporting requirements." },
                { label: "Breach Record", desc: "We maintain an internal record of all privacy breaches, including those that do not require notification, as required by PIPEDA." },
                { label: "Remediation", desc: "We will take immediate steps to contain the breach, assess the scope of harm, and implement measures to prevent recurrence." },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Third-Party Services */}
          <section id="third-parties">
            <h2 className="text-lg font-bold text-white mb-4">8. Third-Party Services</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              MyBillPort uses the following third-party service providers. Each is contractually obligated to protect your data and process it only for the purpose for which it was shared.
            </p>
            <div className="space-y-3">
              {[
                { name: "Firebase (Google)", role: "Database and authentication", detail: "Stores your account data and bill information. Servers located in the United States." },
                { name: "Stripe Inc", role: "Payment processing", detail: "Handles all subscription billing. Stripe is PCI-DSS Level 1 compliant. Stripe's privacy policy applies to payment data." },
                { name: "Anthropic", role: "AI bill scanning", detail: "Processes uploaded bill images and PDFs to extract bill information. Images are not retained by Anthropic after processing." },
                { name: "SendGrid (Twilio)", role: "Email delivery", detail: "Delivers transactional emails including welcome messages and notifications." },
                { name: "Vercel", role: "Hosting and CDN", detail: "Hosts the mybillport.com web application. Vercel processes request logs including IP addresses." },
                { name: "PostHog", role: "Product analytics", detail: "Tracks feature usage for product improvement. Data is pseudonymized." },
              ].map(({ name, role, detail }) => (
                <div key={name} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{name}</p>
                      <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{role}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 9. Google API Services */}
          <section id="google-api">
            <h2 className="text-lg font-bold text-white mb-4">9. Google API Services</h2>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 space-y-3">
              <p className="text-slate-300 text-sm">
                MyBillPort&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[#4D6A9F] hover:underline">
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <p className="text-slate-300 text-sm">
                When you sign in with Google, we receive only your name, email address, and profile picture for the sole purpose of authenticating your account. This data is not shared with third parties and is not used for advertising.
              </p>
            </div>
          </section>

          {/* 10. Children's Privacy */}
          <section id="children">
            <h2 className="text-lg font-bold text-white mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              MyBillPort is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from anyone under 18. If you are a parent or guardian and believe your child has provided us with personal information, contact us at{" "}
              <a href="mailto:privacy@mybillport.com" className="text-[#4D6A9F] hover:underline">privacy@mybillport.com</a>{" "}
              and we will delete that information promptly.
            </p>
          </section>

          {/* 11. Data Retention */}
          <section id="retention">
            <h2 className="text-lg font-bold text-white mb-4">11. Data Retention</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide the service. When you delete your account, we delete your personal data within 30 days, except where retention is required for legal, tax, or accounting obligations. Aggregated, anonymized analytics data that cannot be linked to you may be retained indefinitely.
            </p>
          </section>

          {/* 12. Changes */}
          <section id="changes">
            <h2 className="text-lg font-bold text-white mb-4">12. Changes to This Policy</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page and updating the effective date above. For material changes that affect your rights, we will also send notice to the email address on your account. Continued use of MyBillPort after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 13. Contact */}
          <section id="contact">
            <h2 className="text-lg font-bold text-white mb-4">13. Contact Us</h2>
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <p className="text-slate-300 text-sm mb-4">If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, contact our Privacy Officer:</p>
              <div className="space-y-1.5 text-sm">
                <p className="text-white font-semibold">MyBillPort Privacy Office</p>
                <p className="text-slate-400">Email: <a href="mailto:privacy@mybillport.com" className="text-[#4D6A9F] hover:underline">privacy@mybillport.com</a></p>
                <p className="text-slate-400">Address: Niagara Falls, Ontario, Canada</p>
                <p className="text-slate-400">Website: <a href="https://mybillport.com" className="text-[#4D6A9F] hover:underline">mybillport.com</a></p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-slate-500 text-xs">
                  You also have the right to contact the{" "}
                  <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-[#4D6A9F] hover:underline">
                    Office of the Privacy Commissioner of Canada
                  </a>{" "}
                  if you have concerns about how we handle your personal information.
                </p>
              </div>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← Back to Home</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/terms" className="text-[#4D6A9F] hover:underline">Terms of Service</Link>
            <Link href="/signup" className="text-[#6BCB77] hover:underline">Get Started Free</Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">&copy; 2026 MyBillPort. All rights reserved. · Niagara Falls, Ontario, Canada</p>
      </div>
    </div>
  );
}
