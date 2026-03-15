'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Is MyBillPort free to use?',
    answer: 'Yes! MyBillPort offers a free Starter plan that lets you track up to 10 bills with full reminder functionality. No credit card required, no trial period — it\'s free forever.',
  },
  {
    question: 'Does MyBillPort connect to my bank account?',
    answer: 'No. MyBillPort never connects to your bank or stores payment information. When you want to pay a bill, we redirect you to the official biller\'s website so you pay them directly.',
  },
  {
    question: 'What billers are supported?',
    answer: 'We support 120+ billers and are expanding globally. Our platform covers major providers across telecom, utilities, insurance, streaming, and more — with new billers added regularly.',
  },
  {
    question: 'How does AI bill scanning work?',
    answer: 'Simply take a photo of your bill or upload a PDF. Our AI reads the document and automatically extracts the vendor name, amount owing, due date, and account number — no manual data entry needed.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use 256-bit AES encryption, strict per-user data isolation with Firebase security rules, and optional biometric authentication. We never sell your data to anyone.',
  },
  {
    question: 'Can I use MyBillPort on my phone?',
    answer: 'Yes. MyBillPort is a Progressive Web App (PWA) — just visit mybillport.com on your phone and add it to your home screen. You\'ll get native push notifications for bill reminders too.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Frequently asked questions
          </h2>
          <p className="text-slate-400">
            Everything you need to know about MyBillPort.
          </p>
        </div>
        <div className="space-y-2" role="region" aria-label="Frequently asked questions">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const headingId = `faq-heading-${i}`;
            return (
              <div
                key={i}
                className="bg-[#263244] border border-white/5 rounded-xl overflow-hidden"
              >
                <button
                  id={headingId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#4D6A9F] flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div id={panelId} role="region" aria-labelledby={headingId} className="px-5 pb-4">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
