import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | MyBillPort",
  description: "MyBillPort Terms of Service — your rights, responsibilities, subscription terms, and how our Canadian bill management service works.",
  alternates: { canonical: "https://mybillport.com/terms" },
};

const EFFECTIVE_DATE = "June 10, 2026";

const TOC = [
  { id: "acceptance",       label: "1. Acceptance of Terms" },
  { id: "description",      label: "2. Description of Service" },
  { id: "subscription",     label: "3. Subscription and Payment" },
  { id: "accounts",         label: "4. User Accounts" },
  { id: "ai-disclaimer",    label: "5. AI Features Disclaimer" },
  { id: "redirection",      label: "6. Bill Payment Redirection" },
  { id: "prohibited",       label: "7. Prohibited Uses" },
  { id: "ip",               label: "8. Intellectual Property" },
  { id: "third-party",      label: "9. Third-Party Links & Services" },
  { id: "warranties",       label: "10. Disclaimer of Warranties" },
  { id: "liability",        label: "11. Limitation of Liability" },
  { id: "indemnification",  label: "12. Indemnification" },
  { id: "termination",      label: "13. Termination" },
  { id: "governing-law",    label: "14. Governing Law" },
  { id: "changes",          label: "15. Changes to Terms" },
  { id: "contact",          label: "16. Contact Us" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">

      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4D6A9F]" />
            <span className="text-white font-semibold">Terms of Service</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 pb-24">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE} · Governing law: Province of Ontario, Canada</p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-12">
          <p className="text-white font-semibold text-sm mb-3">Table of Contents</p>
          <ol className="space-y-1.5 columns-2">
            {TOC.map(item => (
              <li key={item.id} className="break-inside-avoid">
                <a href={`#${item.id}`} className="text-[#4D6A9F] hover:text-[#7b9fd4] text-sm transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-12 text-slate-300 text-sm leading-relaxed">

          <p>
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using MyBillPort (&quot;the Service&quot;). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>

          {/* 1. Acceptance */}
          <section id="acceptance">
            <h2 className="text-lg font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="mb-3">
              By creating an account or using MyBillPort, you confirm that you are at least 18 years of age, that you have the legal capacity to enter into this agreement, and that you agree to these Terms and our{" "}
              <Link href="/privacy" className="text-[#4D6A9F] hover:underline">Privacy Policy</Link>.
            </p>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-white font-semibold">Effective Date:</span> {EFFECTIVE_DATE}</p>
              <p><span className="text-white font-semibold">Governing Law:</span> Province of Ontario, Canada</p>
            </div>
          </section>

          {/* 2. Description */}
          <section id="description">
            <h2 className="text-lg font-bold text-white mb-4">2. Description of Service</h2>
            <p className="mb-3">MyBillPort is a bill tracking and reminder service available at mybillport.com. Key features include:</p>
            <div className="space-y-2 mb-4">
              {[
                "Bill tracking and due-date management",
                "AI-powered bill scanning from uploaded images and PDF documents",
                "Smart push notifications 7, 3, and 1 day before bills are due",
                "Redirection to official biller payment portals for 120+ Canadian providers",
                "Cash flow calendar and financial summaries",
                "Optional premium subscription with unlimited bill tracking",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#4D6A9F] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-4 text-amber-300 text-sm space-y-2">
              <p className="font-semibold">Important — MyBillPort is NOT a bank or payment processor.</p>
              <p>We do not process bill payments, hold funds, issue credit, or access your bank accounts. All payments are completed directly on each biller&apos;s own website. MyBillPort is a tracking and reminder tool only.</p>
            </div>
          </section>

          {/* 3. Subscription */}
          <section id="subscription">
            <h2 className="text-lg font-bold text-white mb-4">3. Subscription and Payment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-white font-semibold mb-2">Free Plan</p>
                <p className="text-slate-400 text-xs">Track up to 5 bills. No payment required. All core features included.</p>
              </div>
              <div className="bg-[#4D6A9F]/10 rounded-lg p-4 border border-[#4D6A9F]/30">
                <p className="text-white font-semibold mb-2">Premium — $7.00 CAD / month</p>
                <p className="text-slate-400 text-xs">Unlimited bills, all features. Billed monthly via Stripe. Cancel anytime.</p>
              </div>
            </div>
            <div className="space-y-3">
              <p><strong className="text-white">Billing:</strong> Premium subscription fees are billed monthly in advance in Canadian dollars (CAD) via Stripe. You authorize MyBillPort to charge your payment method on the billing date each month.</p>
              <p><strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. No cancellation fees apply.</p>
              <p><strong className="text-white">Refunds:</strong> We do not issue refunds for partial billing periods. If you cancel mid-month, you retain premium access until the period ends.</p>
              <p><strong className="text-white">Failed Payments:</strong> If a payment fails, we will retry up to two additional times. If payment cannot be collected, your account will be downgraded to the Free plan at the end of the billing period. No data will be deleted.</p>
              <p><strong className="text-white">Price Changes:</strong> We will provide at least 30 days&apos; written notice by email before changing subscription pricing. Continued use of the Service after the notice period constitutes acceptance of the new price.</p>
            </div>
          </section>

          {/* 4. Accounts */}
          <section id="accounts">
            <h2 className="text-lg font-bold text-white mb-4">4. User Accounts</h2>
            <p className="mb-3">To use MyBillPort, you must create an account. You agree to:</p>
            <div className="space-y-2 mb-4">
              {[
                "Be at least 18 years of age",
                "Provide accurate, current, and complete registration information",
                "Maintain one account per person — multiple accounts are not permitted",
                "Keep your password confidential and not share it with others",
                "Notify us immediately of any unauthorized use of your account",
                "Accept responsibility for all activity that occurs under your account",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#4D6A9F] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p>We may suspend or terminate accounts that violate these Terms, provide false information, or engage in fraudulent activity.</p>
          </section>

          {/* 5. AI Disclaimer */}
          <section id="ai-disclaimer">
            <h2 className="text-lg font-bold text-white mb-4">5. AI Features Disclaimer</h2>
            <p className="mb-3">MyBillPort uses AI (powered by Anthropic Claude) to extract bill information from uploaded images and documents. By using AI features, you acknowledge:</p>
            <div className="space-y-3">
              {[
                { label: "Accuracy Not Guaranteed", desc: "AI bill scanning is provided as-is. We do not guarantee 100% accuracy of extracted vendor names, amounts, due dates, or account numbers." },
                { label: "Always Verify", desc: "You are responsible for reviewing and verifying all AI-extracted data before saving. Never rely solely on AI output for financial decisions." },
                { label: "No Financial Advice", desc: "AI-generated negotiation scripts, switch recommendations, and savings estimates are for informational purposes only and do not constitute financial, legal, or professional advice." },
                { label: "No Liability for AI Errors", desc: "MyBillPort is not liable for any financial loss, missed payments, or late fees resulting from inaccurate AI-extracted information." },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Redirection */}
          <section id="redirection">
            <h2 className="text-lg font-bold text-white mb-4">6. Bill Payment Redirection</h2>
            <p className="mb-3">
              When you tap &quot;Pay&quot; on a bill in MyBillPort, you are redirected to the biller&apos;s official external website to complete payment. By using this feature, you acknowledge:
            </p>
            <div className="space-y-2">
              {[
                "MyBillPort does not process, facilitate, or receive any payments on your behalf",
                "All transactions occur solely between you and the external biller on their own website",
                "MyBillPort is not responsible for errors, failures, double-charges, or disputes arising from payments made on external biller websites",
                "External biller websites have their own terms of service and privacy policies",
                "Payment URLs are provided in good faith but MyBillPort does not guarantee they are current — always verify you are on the correct official website",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Prohibited Uses */}
          <section id="prohibited">
            <h2 className="text-lg font-bold text-white mb-4">7. Prohibited Uses</h2>
            <p className="mb-3">You agree not to use MyBillPort to:</p>
            <div className="space-y-2">
              {[
                "Automatically scrape, crawl, or harvest data from the platform",
                "Share your account credentials with any other person",
                "Upload malicious files, viruses, or harmful code",
                "Use the Service for any illegal, fraudulent, or deceptive purpose",
                "Attempt to reverse engineer, decompile, or hack the Service",
                "Impersonate any person or entity",
                "Upload documents you do not have the right to process",
                "Use the Service for commercial purposes without written consent from MyBillPort",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-red-400/80 mt-0.5 flex-shrink-0">✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 8. IP */}
          <section id="ip">
            <h2 className="text-lg font-bold text-white mb-4">8. Intellectual Property</h2>
            <p className="mb-3">
              The MyBillPort Service — including its software, design, branding, logos, and written content — is owned by MyBillPort and protected by Canadian and international copyright, trademark, and intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable licence to use the Service for personal, non-commercial purposes only.
            </p>
            <p>
              Your bill data and uploaded documents remain your property. You grant MyBillPort a limited licence to process your data solely to provide the Service features you use (AI extraction, reminders, analytics). We do not claim ownership of your content.
            </p>
          </section>

          {/* 9. Third Party */}
          <section id="third-party">
            <h2 className="text-lg font-bold text-white mb-4">9. Third-Party Links &amp; Services</h2>
            <p>
              MyBillPort provides links and redirects to third-party biller websites to facilitate your bill payments. We are not responsible for the content, accuracy, privacy practices, or security of any third-party website. Your use of and any payments made on third-party sites are governed solely by their own terms and policies. We also integrate with third-party providers including Stripe (payments), Firebase (database), and Anthropic (AI) — each governed by their own terms.
            </p>
          </section>

          {/* 10. Warranties */}
          <section id="warranties">
            <h2 className="text-lg font-bold text-white mb-4">10. Disclaimer of Warranties</h2>
            <p className="mb-3">The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied, including but not limited to warranties of:</p>
            <div className="space-y-2">
              {[
                "Merchantability or fitness for a particular purpose",
                "Uninterrupted, timely, or error-free access to the Service",
                "Accuracy, completeness, or reliability of AI-extracted bill information",
                "Delivery of push notifications on any specific schedule",
                "The Service being free from viruses or other harmful components",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 11. Liability */}
          <section id="liability">
            <h2 className="text-lg font-bold text-white mb-4">11. Limitation of Liability</h2>
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4 space-y-3">
              <p>To the maximum extent permitted by applicable law, MyBillPort and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:</p>
              <div className="space-y-2">
                {[
                  "Loss of data, profits, revenue, or business opportunities",
                  "Missed bill payments or late fees arising from inaccurate notifications or AI extraction errors",
                  "Unauthorized access to your account or personal data",
                  "Errors or omissions in AI-extracted bill information",
                  "Transactions on external biller websites",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p>Our aggregate liability to you for any claim arising from use of the Service shall not exceed the total fees you paid to us in the 12 months preceding the claim, or $100 CAD, whichever is greater.</p>
            </div>
          </section>

          {/* 12. Indemnification */}
          <section id="indemnification">
            <h2 className="text-lg font-bold text-white mb-4">12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless MyBillPort and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from: (a) your use of the Service in violation of these Terms; (b) your violation of any applicable law or third-party rights; or (c) any content or data you submit through the Service.
            </p>
          </section>

          {/* 13. Termination */}
          <section id="termination">
            <h2 className="text-lg font-bold text-white mb-4">13. Termination</h2>
            <div className="space-y-3">
              <p><strong className="text-white">By You:</strong> You may delete your account at any time from your account settings. Deletion terminates your access and triggers removal of your personal data within 30 days.</p>
              <p><strong className="text-white">By Us:</strong> We may suspend or terminate your account immediately, without prior notice, if we determine you have violated these Terms or engaged in fraudulent activity. We may also discontinue the Service with reasonable advance notice.</p>
              <p>Sections that by their nature should survive termination — including intellectual property, disclaimers, limitation of liability, and indemnification — shall remain in force.</p>
            </div>
          </section>

          {/* 14. Governing Law */}
          <section id="governing-law">
            <h2 className="text-lg font-bold text-white mb-4">14. Governing Law &amp; Dispute Resolution</h2>
            <div className="space-y-3">
              <p>These Terms are governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.</p>
              <p>Any disputes arising from or relating to these Terms or the Service shall first be addressed through good-faith negotiation. If negotiation fails within 30 days, disputes shall be submitted to binding arbitration in Ontario, Canada. Either party may seek injunctive or equitable relief in any court of competent jurisdiction.</p>
            </div>
          </section>

          {/* 15. Changes */}
          <section id="changes">
            <h2 className="text-lg font-bold text-white mb-4">15. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the effective date. For significant changes, we will also notify you by email. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 16. Contact */}
          <section id="contact">
            <h2 className="text-lg font-bold text-white mb-4">16. Contact Us</h2>
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <p className="mb-4">If you have questions about these Terms, please contact us:</p>
              <div className="space-y-1.5 text-sm">
                <p className="text-white font-semibold">MyBillPort</p>
                <p className="text-slate-400">Email: <a href="mailto:privacy@mybillport.com" className="text-[#4D6A9F] hover:underline">privacy@mybillport.com</a></p>
                <p className="text-slate-400">Address: Niagara Falls, Ontario, Canada</p>
                <p className="text-slate-400">Website: <a href="https://mybillport.com" className="text-[#4D6A9F] hover:underline">mybillport.com</a></p>
              </div>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← Back to Home</Link>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-[#4D6A9F] hover:underline">Privacy Policy</Link>
            <Link href="/signup" className="text-[#6BCB77] hover:underline">Get Started Free</Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">&copy; 2026 MyBillPort. All rights reserved. · Niagara Falls, Ontario, Canada</p>
      </div>
    </div>
  );
}
