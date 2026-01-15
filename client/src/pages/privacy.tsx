import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/">
          <button className="flex items-center text-gray-600 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 15, 2026</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>MyBillPort collects information you provide directly, including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Account information (name, email address)</li>
              <li>Bill details you add to the app</li>
              <li>Payment information for processing transactions</li>
              <li>Connected bank account information via Plaid</li>
              <li>Email data when you connect Gmail for bill scanning</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide and improve our bill management services</li>
              <li>Process payments and transactions</li>
              <li>Send bill reminders and notifications</li>
              <li>Scan emails for bill-related information</li>
              <li>Detect recurring bills from bank transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Gmail Data Usage</h2>
            <p>When you connect your Gmail account, we:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Only read emails to identify bill-related messages</li>
              <li>Do not store the full content of your emails</li>
              <li>Extract only bill amounts, due dates, and company names</li>
              <li>Never share your email data with third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. Your financial credentials are handled securely through Plaid and Stripe, and we never store your bank login credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h2>
            <p>We do not sell your personal information. We only share data with:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Plaid - for bank account connections</li>
              <li>Stripe - for payment processing</li>
              <li>Service providers necessary to operate our app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You can request to access, update, or delete your personal data at any time by contacting us or using the settings in your profile.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p>For questions about this privacy policy, contact us at:</p>
            <p className="mt-2">Email: support@mybillport.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
