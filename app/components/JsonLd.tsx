export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MyBillPort',
    url: 'https://mybillport.com',
    logo: 'https://mybillport.com/icon-512.png',
    description: 'MyBillPort helps Canadians track, manage, and pay all their bills in one place. Never miss a bill again.',
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'mybillportinfo@gmail.com',
      contactType: 'customer service',
      availableLanguage: ['English', 'French'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CA',
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
    description: 'Track, manage, and pay all your Canadian bills in one place. AI-powered bill scanning, due date reminders, and one-click payments.',
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
      priceCurrency: 'CAD',
      description: 'Free plan includes up to 10 bills with reminders',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '156',
      bestRating: '5',
    },
    description: 'MyBillPort is a Canadian bill management app that helps you track due dates, get reminders, and pay bills with one click. Supports 120+ Canadian billers.',
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
      answer: 'Yes! MyBillPort offers a free plan that lets you track up to 10 bills with full reminder functionality. No credit card required.',
    },
    {
      question: 'Does MyBillPort connect to my bank account?',
      answer: 'No. MyBillPort never connects to your bank. We simply help you organize your bills and redirect you to the official biller website when you want to pay.',
    },
    {
      question: 'What Canadian billers are supported?',
      answer: 'MyBillPort supports 120+ Canadian billers including Rogers, Bell, Telus, Hydro One, BC Hydro, Enbridge, and many more across all provinces.',
    },
    {
      question: 'How does AI bill scanning work?',
      answer: 'Simply take a photo of your bill or upload a PDF. Our AI powered by Claude Vision reads the bill and automatically extracts the vendor, amount, due date, and account number.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use 256-bit encryption, never sell your data, and never store payment information. Your bill data is isolated per user with strict Firebase security rules.',
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
