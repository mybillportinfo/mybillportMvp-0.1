export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MyBillPort',
    url: 'https://mybillport.com',
    logo: 'https://mybillport.com/icon-512.png',
    description: 'MyBillPort helps you track, manage, and pay all your bills in one place. Never miss a bill again.',
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'mybillportinfo@gmail.com',
      contactType: 'customer service',
      availableLanguage: ['English', 'French'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MyBillPort',
    url: 'https://mybillport.com',
    description: 'Track, manage, and pay all your bills in one place. AI-powered bill scanning, due date reminders, and one-click payments.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mybillport.com/app?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MyBillPort',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, iOS, Android (PWA)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan includes up to 10 bills with reminders',
    },
    description: 'MyBillPort is a bill management app that helps you track due dates, get reminders, and pay bills with one click. Supports 120+ billers worldwide.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd() {
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
