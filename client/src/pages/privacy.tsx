import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "wouter";

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
            <p className="text-gray-500">MyBillPort Inc.</p>
          </div>
        </div>
        
        <p className="text-gray-500 mb-8 pb-6 border-b border-gray-200">Last updated: January 30, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Introduction</h2>
            <p>MyBillPort ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bill management application and website (collectively, the "Service"). Please read this privacy policy carefully. By using the Service, you consent to the practices described in this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly to us, including:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Account Information:</strong> Your name, email address, and password when you create an account</li>
              <li><strong>Bill Information:</strong> Details about bills you add, including company names, amounts, due dates, and categories</li>
              <li><strong>Authentication Data:</strong> Information from third-party sign-in services (Google, Apple) if you choose to use them</li>
              <li><strong>Communication Data:</strong> Information you provide when contacting our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide, maintain, and improve our bill management services</li>
              <li>Send you bill reminders and due date notifications via email</li>
              <li>Process your requests and respond to your inquiries</li>
              <li>Send you technical notices and security alerts</li>
              <li>Analyze usage patterns to improve our Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Google API Services Disclosure</h2>
            <p className="mb-3">MyBillPort's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
            <p className="mb-3">When you sign in with Google:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>We only access basic profile information (name, email, profile picture)</li>
              <li>We do not access your Gmail, Google Drive, or other Google services</li>
              <li>We do not share your Google data with third parties</li>
              <li>We use your Google account information solely for authentication purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Storage and Security</h2>
            <p className="mb-3">We implement industry-standard security measures to protect your personal information:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>All data is encrypted in transit using TLS/SSL</li>
              <li>Passwords are hashed and salted using secure algorithms</li>
              <li>We use secure cloud infrastructure with regular security audits</li>
              <li>Access to personal data is restricted to authorized personnel only</li>
            </ul>
            <p className="mt-3">While we strive to protect your information, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing and Disclosure</h2>
            <p className="mb-3">We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our Service (e.g., email delivery, hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
              <li><strong>Protection of Rights:</strong> To protect the rights, property, or safety of MyBillPort, our users, or others</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights and Choices</h2>
            <p className="mb-3">You have the following rights regarding your personal data:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at privacy@mybillport.com or through your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h2>
            <p>We use essential cookies to maintain your session and remember your preferences. We do not use third-party advertising cookies or tracking technologies for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
            <p>Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. International Users</h2>
            <p>MyBillPort is based in Canada. If you are accessing our Service from outside Canada, please be aware that your information may be transferred to, stored, and processed in Canada. By using our Service, you consent to such transfer.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after any changes constitutes acceptance of the new Privacy Policy.</p>
          </section>

          <section className="pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="mb-3">If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p><strong>MyBillPort Inc.</strong></p>
              <p>Email: privacy@mybillport.com</p>
              <p>Website: www.mybillport.com</p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">← Back to Home</Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service →</Link>
        </div>
      </div>
    </div>
  );
}
