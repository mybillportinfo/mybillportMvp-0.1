import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Privacy Policy - BillPort',
  description: 'Learn how BillPort protects your personal information and data under PIPEDA.',
};

export default function Privacy() {
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
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500">BillPort</p>
          </div>
        </div>
        
        <p className="text-gray-500 mb-8 pb-6 border-b border-gray-200">Last updated: February 13, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>BillPort (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website mybillport.com (the &quot;Site&quot;) or use our application (the &quot;App&quot;).</p>
            <p className="mt-3">By using the Site or App, you consent to the practices described in this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">2.1 Information You Provide Directly</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Account Information:</strong> When you sign up for our waitlist, newsletter, or create an account, we collect your name and email address.</li>
              <li><strong>Bill Information:</strong> When you use the App, you may enter details about your bills (e.g., provider name, due date, amount, account number). This information is stored only to provide our bill-tracking service.</li>
              <li><strong>Communications:</strong> If you contact us (via email or support form), we collect your message and contact details.</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">2.2 Information Collected Automatically</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Usage Data:</strong> When you visit our Site or App, we may collect technical data such as your IP address, device type, browser type, operating system, and pages visited. This helps us improve our services.</li>
              <li><strong>Cookies:</strong> We may use cookies and similar tracking technologies to enhance your experience. You can adjust your browser settings to refuse cookies, but this may affect functionality.</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">2.3 Information from Third Parties</h3>
            <p>We do <strong>not</strong> currently connect to your bank accounts or financial institutions. All bill information is provided directly by you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information for the following purposes:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>To provide and maintain the App and Site.</li>
              <li>To send you smart reminders about your upcoming bills.</li>
              <li>To communicate with you about updates, security alerts, and support.</li>
              <li>To send you promotional emails (if you have opted in). You can unsubscribe at any time.</li>
              <li>To improve and personalize your experience.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing Your Information</h2>
            <p className="mb-3">We <strong>do not sell, rent, or trade</strong> your personal information. We may share information only in these limited circumstances:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Service Providers:</strong> We use third-party services to operate our business (e.g., cloud hosting, email delivery, payment processing). These providers are contractually bound to protect your data and use it only to provide services to us.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, or to protect the rights, property, or safety of BillPort, our users, or others.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you of any such change.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage &amp; Security</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">5.1 Where Your Data Is Stored</h3>
            <p>Your information is stored on secure servers operated by our cloud service providers. Currently, we use <strong>Firebase (Google Cloud)</strong>. Data may be processed and stored in <strong>Canada</strong> and the <strong>United States</strong>. When data is transferred to the U.S., it is protected by standard contractual clauses approved by the European Commission and equivalent mechanisms recognized by Canadian law.</p>

            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">5.2 Security Measures</h3>
            <p className="mb-3">We implement reasonable administrative, technical, and physical safeguards to protect your information from unauthorized access, disclosure, alteration, or destruction. These include:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Encryption in transit using SSL/TLS</li>
              <li>Access controls and authentication</li>
              <li>Regular security reviews</li>
            </ul>
            <p className="mt-3">However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Google API Services Disclosure</h2>
            <p className="mb-3">BillPort&apos;s use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
            <p className="mb-3">When you sign in with Google:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>We only access basic profile information (name, email, profile picture)</li>
              <li>We do not access your Gmail, Google Drive, or other Google services</li>
              <li>We do not share your Google data with third parties</li>
              <li>We use your Google account information solely for authentication purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retention of Your Information</h2>
            <p>We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, or as required by law. When no longer needed, we securely delete or anonymize it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights &amp; Choices</h2>
            <p className="mb-3">You have the following rights regarding your personal information:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Access &amp; Correction:</strong> You may request access to the personal information we hold about you, and ask us to correct any inaccuracies.</li>
              <li><strong>Deletion:</strong> You may request deletion of your account and associated data.</li>
              <li><strong>Withdraw Consent:</strong> You may withdraw consent for certain processing (e.g., marketing emails) at any time.</li>
              <li><strong>Opt-out of Communications:</strong> You can unsubscribe from promotional emails by clicking the &quot;unsubscribe&quot; link in any email.</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at <strong>mybillportinfo@gmail.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies and Tracking</h2>
            <p className="mb-3">We use essential cookies to maintain your session and remember your preferences. We do not use third-party advertising cookies or tracking technologies for marketing purposes.</p>
            <p>You can adjust your browser settings to refuse cookies, but this may affect the functionality of our Site and App.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children&apos;s Privacy</h2>
            <p>Our services are not directed to individuals under the age of 13 (or the applicable age of majority in your province). We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us so we can delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. International Users</h2>
            <p>BillPort is based in Canada. If you are accessing our Service from outside Canada, please be aware that your information may be transferred to, stored, and processed in Canada and the United States. By using our Service, you consent to such transfer.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated &quot;Last Updated&quot; date. We encourage you to review this policy periodically.</p>
          </section>

          <section className="pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact Us</h2>
            <p className="mb-3">If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:</p>
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
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
