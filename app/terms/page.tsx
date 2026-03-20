import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | MyBillPort",
  description: "Read MyBillPort's Terms of Service — your rights, responsibilities, and how our Canadian bill management service works.",
  alternates: { canonical: "https://mybillport.com/terms" },
};

const LAST_UPDATED = "March 20, 2026";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">

          <section>
            <p>
              Please read these Terms of Service (&quot;Terms&quot;) carefully before using MyBillPort (&quot;the Service&quot;, &quot;the App&quot;) operated by MyBillPort (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using MyBillPort, you confirm that you are at least 18 years of age (or the age of majority in your province or territory), that you have the legal capacity to enter into this agreement, and that you agree to these Terms and our{" "}
              <Link href="/privacy" className="text-[#4D6A9F] hover:underline">Privacy Policy</Link>.
              If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">2. Description of Service</h2>
            <p className="mb-3">MyBillPort is a personal finance tool that helps you track and manage your bills. Key features include:</p>
            <div className="space-y-2 mb-4">
              {[
                "Bill tracking and due-date management",
                "AI-powered bill extraction from uploaded images and PDF documents",
                "Smart reminders and push notifications",
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
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-3 text-amber-300 text-xs">
              <strong>Important:</strong> MyBillPort is a bill management and tracking tool only. We do not process payments, hold funds, or access your bank accounts. Payments are made directly through each biller&apos;s official website.
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">3. User Accounts</h2>
            <p className="mb-3">To use MyBillPort, you must create an account. You agree to:</p>
            <div className="space-y-2">
              {[
                "Provide accurate, current, and complete information during registration",
                "Maintain and promptly update your account information",
                "Keep your password confidential and not share it with anyone",
                "Notify us immediately of any unauthorized use of your account",
                "Be responsible for all activities that occur under your account",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#4D6A9F] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">4. User Responsibilities</h2>
            <p className="mb-3">You agree not to use MyBillPort to:</p>
            <div className="space-y-2">
              {[
                "Upload or process documents you do not have the right to use",
                "Violate any applicable federal, provincial, or local laws or regulations",
                "Engage in any fraudulent, misleading, or deceptive activity",
                "Attempt to reverse engineer, hack, or disrupt the Service",
                "Use the Service for any commercial purpose without our written consent",
                "Upload malware, viruses, or any harmful code",
                "Impersonate any person or entity",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-red-400/80 mt-0.5 flex-shrink-0">✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">5. Subscription & Payment Terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-white font-semibold mb-2">Free Plan</p>
                <p className="text-slate-400 text-xs">Track up to 5 bills. No payment required. Core features included.</p>
              </div>
              <div className="bg-[#4D6A9F]/10 rounded-lg p-4 border border-[#4D6A9F]/30">
                <p className="text-white font-semibold mb-2">Premium — $7/month CAD</p>
                <p className="text-slate-400 text-xs">Unlimited bills, all features. Billed monthly via Stripe. Cancel anytime.</p>
              </div>
            </div>
            <div className="space-y-3">
              <p>Subscription fees are billed in advance on a monthly basis in Canadian dollars (CAD). You authorize us to charge the payment method on file for recurring fees.</p>
              <p><strong className="text-white">Cancellation:</strong> Cancel anytime from your account settings. Cancellation takes effect at the end of the current billing period. No refunds for partial periods.</p>
              <p><strong className="text-white">Price Changes:</strong> We will provide at least 30 days&apos; written notice before changing subscription pricing. Continued use after the notice period constitutes acceptance.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">6. AI-Powered Features</h2>
            <p className="mb-3">MyBillPort uses AI (powered by Anthropic Claude) to extract bill information from uploaded images and documents. By using AI features, you acknowledge that:</p>
            <div className="space-y-2">
              {[
                "AI extraction may not be 100% accurate — always review and verify extracted information before saving",
                "You are responsible for the accuracy of bill information stored in your account",
                "Uploaded documents are processed in memory and are not permanently stored on our servers",
                "AI-generated negotiation scripts and recommendations are for informational purposes only and do not constitute financial advice",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#6BCB77] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">7. Intellectual Property</h2>
            <p>
              The Service, including its software, design, logos, text, and content, is owned by MyBillPort and is protected by Canadian and international copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal, non-commercial purposes. Your bill data remains your own — we do not claim ownership of information you upload or enter.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">8. Third-Party Links & Services</h2>
            <p>
              MyBillPort provides links and redirects to third-party biller websites to facilitate your bill payments. We are not responsible for the content, privacy practices, or security of third-party websites. Your interactions with third-party sites, including any payments you make, are governed solely by their own terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">9. Disclaimer of Warranties</h2>
            <p className="mb-3">The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied, including but not limited to:</p>
            <div className="space-y-2">
              {[
                "Merchantability or fitness for a particular purpose",
                "Uninterrupted, error-free, or secure access to the Service",
                "Accuracy, completeness, or reliability of AI-extracted bill information",
                "The Service being free from viruses or other harmful components",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">10. Limitation of Liability</h2>
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4 space-y-3">
              <p>To the maximum extent permitted by applicable law, MyBillPort and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
              <div className="space-y-2">
                {[
                  "Loss of data, profits, revenue, or business opportunities",
                  "Missed bill payments or resulting late fees arising from inaccurate notifications",
                  "Unauthorized access to your account or data",
                  "Any errors or omissions in AI-extracted bill information",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p>Our aggregate liability to you for any claim arising from the use of the Service shall not exceed the total fees you paid to us in the 12 months preceding the claim, or $100 CAD, whichever is greater.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless MyBillPort and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from: (a) your use of the Service in violation of these Terms; (b) your violation of any applicable law or third-party rights; or (c) any content or data you submit through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">12. Termination</h2>
            <div className="space-y-3">
              <p><strong className="text-white">By You:</strong> You may delete your account at any time from your account settings. Deletion terminates your access and triggers data deletion within 30 days.</p>
              <p><strong className="text-white">By Us:</strong> We may suspend or terminate your account immediately, without prior notice, if we determine you have violated these Terms or engaged in fraudulent activity. We may also discontinue the Service with reasonable notice.</p>
              <p>Sections that by their nature should survive termination (including intellectual property, disclaimers, and limitation of liability) shall survive termination.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">13. Governing Law & Dispute Resolution</h2>
            <div className="space-y-3">
              <p>These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.</p>
              <p>Any disputes arising from or relating to these Terms or the Service shall be resolved through good-faith negotiation first. If negotiation fails, disputes shall be submitted to binding arbitration in Ontario, Canada. Either party may seek injunctive or other equitable relief in any court of competent jurisdiction.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">14. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. For significant changes, we may also notify you by email. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">15. Miscellaneous</h2>
            <div className="space-y-2">
              <p><strong className="text-white">Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and MyBillPort regarding the Service.</p>
              <p><strong className="text-white">Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
              <p><strong className="text-white">No Waiver:</strong> Our failure to enforce any provision of these Terms shall not constitute a waiver of our right to enforce such provision in the future.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-4">16. Contact Us</h2>
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <p className="mb-3">If you have questions about these Terms, please contact us:</p>
              <div className="space-y-1">
                <p className="text-white font-semibold">MyBillPort</p>
                <p className="text-slate-400">Email: <a href="mailto:mybillportinfo@gmail.com" className="text-[#4D6A9F] hover:underline">mybillportinfo@gmail.com</a></p>
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

        <p className="mt-6 text-center text-sm text-slate-600">&copy; 2026 MyBillPort. All rights reserved.</p>
      </div>
    </div>
  );
}
