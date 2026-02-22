import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Terms of Service - BillPort',
  description: 'Terms and conditions for using BillPort bill management service.',
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/">
          <button className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-gray-500">BillPort</p>
          </div>
        </div>

        <p className="text-gray-500 mb-8 pb-6 border-b border-gray-200">Last updated: February 13, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using BillPort (the &quot;Service&quot;), including our website and application, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="mb-3">BillPort is a bill management application that helps you:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Manually track and organize your bills</li>
              <li>Receive in-app reminders about upcoming due dates</li>
              <li>Make bill payments via Stripe (credit card and Interac)</li>
              <li>View your payment history and bill status</li>
            </ul>
            <p className="mt-3">BillPort does <strong>not</strong> connect to your bank accounts, scan your email, or access your financial institution data. All bill information is entered manually by you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="mb-3">To use the Service, you must create an account using your email address or Google Sign-In. You are responsible for:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="mt-3">You must be at least 13 years of age (or the age of majority in your province) to use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Free Plan &amp; Usage Limits</h2>
            <p>The free plan allows you to track up to 5 bills. We may offer additional plans or features in the future. We reserve the right to modify plan limits with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment Processing</h2>
            <p className="mb-3">Bill payments are processed through <strong>Stripe</strong>, a third-party payment processor. By making payments through our Service, you agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe&apos;s Terms of Service</a>.</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>All payments are in Canadian Dollars (CAD)</li>
              <li>The minimum payment amount is $0.50 CAD</li>
              <li>We are not responsible for payment processing errors by Stripe</li>
              <li>You are responsible for ensuring sufficient funds are available</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. User Responsibilities</h2>
            <p className="mb-3">You agree to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide accurate and complete bill information</li>
              <li>Not use the Service for any unlawful purpose</li>
              <li>Not attempt to gain unauthorized access to other users&apos; data</li>
              <li>Not interfere with or disrupt the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p className="mb-3">BillPort is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. To the fullest extent permitted by law:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>We are not liable for any missed payments, late fees, or other damages resulting from use of our Service</li>
              <li>We do not guarantee that reminders will be delivered on time or at all</li>
              <li>Users are solely responsible for ensuring their bills are paid on time</li>
              <li>Our total liability shall not exceed the amount you paid us in the preceding 12 months</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service (including but not limited to text, graphics, logos, and software) are owned by BillPort and are protected by Canadian and international copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p className="mb-3">We may terminate or suspend your account at any time for violation of these Terms. You may delete your account at any time through the app settings.</p>
            <p>Upon termination, your right to use the Service will immediately cease. We may retain certain data as required by law or for legitimate business purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Modifications to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page with a new &quot;Last Updated&quot; date. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario, Canada.</p>
          </section>

          <section className="pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
            <p className="mb-3">For questions about these Terms, contact us:</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p><strong>BillPort</strong></p>
              <p>Email: mybillportinfo@gmail.com</p>
              <p>Website: www.mybillport.com</p>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">&copy; 2026 BillPort. All rights reserved.</p>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">&larr; Back to Home</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
