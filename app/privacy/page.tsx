import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MyBillPort",
  description: "Learn how MyBillPort collects, uses, and protects your personal information in compliance with Canadian privacy law (PIPEDA).",
  alternates: { canonical: "https://mybillport.com/privacy" },
};

const LAST_UPDATED = "March 20, 2026";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10">
          <section>
            <p className="text-slate-300 leading-relaxed text-sm">
              MyBillPort (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service, in accordance with Canada&apos;s <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) and applicable provincial privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">1. Information We Collect</h2>
            <div className="space-y-3">
              {[
                { label: "Account Information", desc: "Name, email address, and password when you register. If you sign in with Google, we receive your name, email, and profile photo from Google for authentication purposes only." },
                { label: "Bill Data", desc: "Bill details you enter or upload, including biller name, amounts, due dates, account numbers, payment status, and payment history." },
                { label: "Profile Information", desc: "Username, profile photo, and notification preferences you choose to provide." },
                { label: "Usage Data", desc: "Pages visited, features used, and interactions within the app to help us improve our service." },
                { label: "Device & Technical Data", desc: "Browser type, operating system, IP address, and device identifiers used for security and analytics." },
                { label: "Push Notification Tokens", desc: "Device tokens to deliver bill reminders, stored only with your explicit permission and used for no other purpose." },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">2. How We Use Your Information</h2>
            <div className="space-y-2">
              {[
                "Provide, operate, and maintain the MyBillPort service",
                "Send bill due-date reminders and important account notifications",
                "Process AI-powered bill extraction from uploaded images or documents",
                "Detect recurring billing patterns and amount anomalies on your behalf",
                "Improve, personalize, and expand our service",
                "Understand and analyze how you use the app",
                "Communicate with you about updates, security alerts, and support",
                "Comply with legal obligations and enforce our Terms of Service",
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-[#6BCB77] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">3. Google API Services</h2>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 space-y-3">
              <p className="text-slate-300 text-sm">
                MyBillPort&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[#4D6A9F] hover:underline">
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <p className="text-slate-300 text-sm">When you sign in with Google, we access only your basic profile information (name, email, profile picture) for authentication purposes. This data is not shared with third parties and is not used for any purpose other than enabling sign-in.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">4. Information Sharing & Disclosure</h2>
            <p className="text-slate-300 text-sm mb-4">We do <strong className="text-white">not</strong> sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:</p>
            <div className="space-y-3">
              {[
                { label: "Service Providers", desc: "We use Firebase (Google Cloud) for authentication and data storage, Anthropic for AI bill processing, Stripe for payment processing, and email services for notifications. These providers are contractually obligated to protect your data." },
                { label: "Legal Requirements", desc: "We may disclose your information when required by law, court order, or to protect the rights, property, or safety of MyBillPort, our users, or the public." },
                { label: "Business Transfers", desc: "In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your information becomes subject to a different privacy policy." },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">5. Data Storage & Security</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your data is stored on Google Firebase servers protected by industry-standard encryption in transit (TLS/SSL) and at rest. We implement access controls so each user can only access their own data. Bill images you upload for AI scanning are processed in memory and are not stored permanently on our servers. While we strive to protect your information using commercially acceptable means, no method of internet transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">6. Cookies & Tracking</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We use essential cookies to maintain your session and remember your preferences. We use a cookie consent mechanism to obtain your agreement before placing any non-essential cookies. You can control cookie behaviour through your browser settings. Disabling certain cookies may affect the functionality of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">7. Your Rights (PIPEDA)</h2>
            <div className="space-y-2 mb-4">
              {[
                "Access the personal information we hold about you",
                "Correct inaccurate or incomplete information",
                "Withdraw consent for certain uses of your information",
                "Request deletion of your account and personal data",
                "Know how your information is being used",
                "File a complaint with the Office of the Privacy Commissioner of Canada",
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-[#6BCB77] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">To exercise any of these rights, contact us at <a href="mailto:mybillportinfo@gmail.com" className="text-[#4D6A9F] hover:underline">mybillportinfo@gmail.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">8. Data Retention</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide our services. If you delete your account, we will delete your personal data within 30 days, except where required for legal, tax, or accounting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              MyBillPort is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us and we will promptly delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">10. International Data Transfers</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your information may be transferred to, stored, and processed in the United States and other countries where our service providers (Google Firebase, Anthropic) operate. When data is transferred internationally, it is protected by standard contractual clauses and equivalent mechanisms recognized by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of MyBillPort after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">12. Contact Us</h2>
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <p className="text-slate-300 text-sm mb-3">If you have questions or concerns about this Privacy Policy, please contact our Privacy Officer:</p>
              <div className="space-y-1 text-sm">
                <p className="text-white font-semibold">MyBillPort Privacy Office</p>
                <p className="text-slate-400">Email: <a href="mailto:mybillportinfo@gmail.com" className="text-[#4D6A9F] hover:underline">mybillportinfo@gmail.com</a></p>
                <p className="text-slate-400">Website: <a href="https://mybillport.com" className="text-[#4D6A9F] hover:underline">mybillport.com</a></p>
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

        <p className="mt-6 text-center text-sm text-slate-600">&copy; 2026 MyBillPort. All rights reserved.</p>
      </div>
    </div>
  );
}
