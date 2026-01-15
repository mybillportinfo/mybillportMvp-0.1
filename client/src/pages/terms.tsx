import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/">
          <button className="flex items-center text-gray-600 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 15, 2026</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MyBillPort, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>MyBillPort is a bill management application that helps you:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Track and organize your bills</li>
              <li>Receive payment reminders</li>
              <li>Connect bank accounts to detect recurring bills</li>
              <li>Scan emails for bill information</li>
              <li>Process bill payments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Payment Processing</h2>
            <p>Payments are processed through Stripe. By making payments through our app, you agree to Stripe's terms of service. We are not responsible for any payment processing errors by third-party providers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p>Our app integrates with third-party services including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Plaid for bank account connections</li>
              <li>Google Gmail for email scanning</li>
              <li>Stripe for payment processing</li>
            </ul>
            <p className="mt-2">Your use of these services is subject to their respective terms and privacy policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>MyBillPort is provided "as is" without warranties of any kind. We are not liable for any missed payments, late fees, or other damages resulting from use of our service. Users are responsible for ensuring their bills are paid on time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Termination</h2>
            <p>We may terminate or suspend your account at any time for violation of these terms. You may delete your account at any time through the app settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Governing Law</h2>
            <p>These terms are governed by the laws of Canada. Any disputes shall be resolved in the courts of Ontario, Canada.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>For questions about these terms, contact us at:</p>
            <p className="mt-2">Email: support@mybillport.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
