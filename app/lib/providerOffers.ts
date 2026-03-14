export interface ProviderOffer {
  id: string;
  providerName: string;
  planName: string;
  monthlyPrice: number;
  category: string;
  features: string[];
  affiliateUrl: string;
  province?: string[];
  newCustomerOnly?: boolean;
  badge?: string;
}

export const PROVIDER_OFFERS: ProviderOffer[] = [
  // Internet / Telecom
  {
    id: 'fido-internet-75',
    providerName: 'Fido',
    planName: 'Internet 75',
    monthlyPrice: 34.99,
    category: 'internet',
    features: ['75 Mbps download', 'Unlimited data', 'No term contract'],
    affiliateUrl: 'https://www.fido.ca/internet',
    newCustomerOnly: true,
    badge: 'Best Value',
  },
  {
    id: 'koodo-mobile-45',
    providerName: 'Koodo',
    planName: '$45 Plan – 20GB',
    monthlyPrice: 45,
    category: 'phone',
    features: ['20GB data', 'Unlimited talk & text', 'Nationwide coverage'],
    affiliateUrl: 'https://www.koodomobile.com/plans',
    newCustomerOnly: true,
    badge: 'Popular',
  },
  {
    id: 'virgin-mobile-55',
    providerName: 'Virgin Plus',
    planName: '$55 Plan – 30GB',
    monthlyPrice: 55,
    category: 'phone',
    features: ['30GB data', 'Unlimited calls', 'International texting'],
    affiliateUrl: 'https://www.virginplus.ca/plans',
    newCustomerOnly: false,
  },
  {
    id: 'public-mobile-34',
    providerName: 'Public Mobile',
    planName: '$34 Plan – 15GB',
    monthlyPrice: 34,
    category: 'phone',
    features: ['15GB data', 'Unlimited Canada-wide calling', 'Auto-pay discount'],
    affiliateUrl: 'https://www.publicmobile.ca/plans',
    newCustomerOnly: false,
    badge: 'No Contract',
  },
  {
    id: 'rogers-internet-500',
    providerName: 'Rogers',
    planName: 'Ignite 500u',
    monthlyPrice: 69.99,
    category: 'internet',
    features: ['500 Mbps download', 'Unlimited data', 'Free modem'],
    affiliateUrl: 'https://www.rogers.com/internet',
    province: ['ON'],
    newCustomerOnly: true,
  },
  {
    id: 'shaw-internet-150',
    providerName: 'Shaw',
    planName: 'Internet 150',
    monthlyPrice: 55,
    category: 'internet',
    features: ['150 Mbps download', 'Unlimited data', 'Professional install'],
    affiliateUrl: 'https://www.shaw.ca/internet',
    province: ['BC', 'AB'],
    newCustomerOnly: true,
  },
  {
    id: 'tangerine-internet-60',
    providerName: 'Tangerine Telecom',
    planName: 'Internet 60',
    monthlyPrice: 29.95,
    category: 'internet',
    features: ['60 Mbps download', 'Unlimited data', 'No contract'],
    affiliateUrl: 'https://www.tangerinetelecom.com',
    province: ['ON'],
    newCustomerOnly: true,
    badge: 'Budget Pick',
  },
  {
    id: 'videotron-internet',
    providerName: 'Videotron',
    planName: 'Helix Internet 400',
    monthlyPrice: 54.95,
    category: 'internet',
    features: ['400 Mbps', 'Unlimited data', 'Helix TV ready'],
    affiliateUrl: 'https://videotron.com/internet',
    province: ['QC'],
  },
  // Streaming
  {
    id: 'crave-monthly',
    providerName: 'Crave',
    planName: 'Crave + Movies + HBO',
    monthlyPrice: 22,
    category: 'streaming',
    features: ['Movies', 'HBO content', 'Live TV add-on'],
    affiliateUrl: 'https://www.crave.ca',
    newCustomerOnly: false,
  },
  {
    id: 'disney-plus',
    providerName: 'Disney+',
    planName: 'Disney+ Standard',
    monthlyPrice: 11.99,
    category: 'streaming',
    features: ['Disney, Pixar, Marvel, Star Wars, National Geographic', '4 streams', '4K content'],
    affiliateUrl: 'https://www.disneyplus.com',
    newCustomerOnly: false,
  },
  {
    id: 'prime-video',
    providerName: 'Amazon Prime',
    planName: 'Prime Membership',
    monthlyPrice: 9.99,
    category: 'streaming',
    features: ['Prime Video', 'Free shipping', 'Prime Music', 'Prime Reading'],
    affiliateUrl: 'https://www.amazon.ca/prime',
    newCustomerOnly: false,
    badge: 'Best Bundle',
  },
  // Insurance
  {
    id: 'sonnet-home',
    providerName: 'Sonnet',
    planName: 'Home Insurance (avg)',
    monthlyPrice: 55,
    category: 'insurance',
    features: ['Online quotes in 5 min', 'Bundling discounts', 'Claims app'],
    affiliateUrl: 'https://www.sonnet.ca/home-insurance',
    newCustomerOnly: true,
    badge: 'Save up to 20%',
  },
  {
    id: 'intact-auto',
    providerName: 'Intact Insurance',
    planName: 'Auto Insurance (avg)',
    monthlyPrice: 120,
    category: 'insurance',
    features: ['Accident forgiveness', 'Claims guarantee', 'My Driving Discount'],
    affiliateUrl: 'https://www.intact.ca',
    newCustomerOnly: false,
  },
  // Utilities
  {
    id: 'bullfrog-power',
    providerName: 'Bullfrog Power',
    planName: 'Green Electricity',
    monthlyPrice: 15,
    category: 'utilities',
    features: ['100% green energy', 'Wind & solar', 'No contract'],
    affiliateUrl: 'https://www.bullfrogpower.com',
    newCustomerOnly: false,
    badge: 'Eco-Friendly',
  },
];

export function getOffersForCategory(category: string): ProviderOffer[] {
  const normalized = category.toLowerCase();
  return PROVIDER_OFFERS.filter(o => o.category === normalized || o.category.includes(normalized));
}

export function findSavingsOpportunities(
  bills: Array<{ id?: string; companyName: string; totalAmount: number; category?: string }>
): Array<{ bill: typeof bills[0]; offer: ProviderOffer; monthlySavings: number }> {
  const opportunities: Array<{ bill: typeof bills[0]; offer: ProviderOffer; monthlySavings: number }> = [];

  for (const bill of bills) {
    if (!bill.category) continue;
    const offers = getOffersForCategory(bill.category);
    for (const offer of offers) {
      if (offer.providerName.toLowerCase() === bill.companyName.toLowerCase()) continue;
      const savings = bill.totalAmount - offer.monthlyPrice;
      if (savings > bill.totalAmount * 0.1) {
        opportunities.push({ bill, offer, monthlySavings: savings });
        break;
      }
    }
  }

  return opportunities.sort((a, b) => b.monthlySavings - a.monthlySavings);
}
