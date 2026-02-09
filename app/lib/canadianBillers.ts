export interface BillerEntry {
  name: string;
  category: string;
}

export const canadianBillers: BillerEntry[] = [
  // Utilities - Hydro / Electric
  { name: "Hydro One", category: "hydro" },
  { name: "Toronto Hydro", category: "hydro" },
  { name: "BC Hydro", category: "hydro" },
  { name: "Manitoba Hydro", category: "hydro" },
  { name: "Hydro-Québec", category: "hydro" },
  { name: "Nova Scotia Power", category: "hydro" },
  { name: "SaskPower", category: "hydro" },
  { name: "ATCO Electric", category: "hydro" },
  { name: "EPCOR", category: "hydro" },
  { name: "London Hydro", category: "hydro" },
  { name: "Alectra Utilities", category: "hydro" },
  { name: "Ottawa Hydro", category: "hydro" },

  // Utilities - Gas
  { name: "Enbridge Gas", category: "hydro" },
  { name: "FortisBC", category: "hydro" },
  { name: "ATCO Gas", category: "hydro" },
  { name: "SaskEnergy", category: "hydro" },

  // Utilities - Water
  { name: "City Water (Municipal)", category: "hydro" },

  // Mobile / Internet / TV
  { name: "Rogers", category: "internet" },
  { name: "Bell Canada", category: "internet" },
  { name: "Telus", category: "internet" },
  { name: "Freedom Mobile", category: "phone" },
  { name: "Fido", category: "phone" },
  { name: "Koodo Mobile", category: "phone" },
  { name: "Virgin Plus", category: "phone" },
  { name: "Chatr Mobile", category: "phone" },
  { name: "Public Mobile", category: "phone" },
  { name: "Lucky Mobile", category: "phone" },
  { name: "Shaw / Rogers", category: "internet" },
  { name: "Videotron", category: "internet" },
  { name: "Cogeco", category: "internet" },
  { name: "Eastlink", category: "internet" },
  { name: "TekSavvy", category: "internet" },
  { name: "Start.ca", category: "internet" },
  { name: "Northwestel", category: "internet" },

  // Credit Cards - Big Banks
  { name: "TD Credit Card", category: "credit_card" },
  { name: "RBC Credit Card", category: "credit_card" },
  { name: "BMO Credit Card", category: "credit_card" },
  { name: "Scotiabank Credit Card", category: "credit_card" },
  { name: "CIBC Credit Card", category: "credit_card" },
  { name: "National Bank Credit Card", category: "credit_card" },
  { name: "Desjardins Credit Card", category: "credit_card" },
  { name: "HSBC Canada Credit Card", category: "credit_card" },
  { name: "Tangerine Credit Card", category: "credit_card" },
  { name: "Simplii Financial Credit Card", category: "credit_card" },

  // Credit Cards - Credit Unions
  { name: "Vancity Credit Card", category: "credit_card" },
  { name: "Coast Capital Credit Card", category: "credit_card" },
  { name: "Meridian Credit Card", category: "credit_card" },
  { name: "Servus Credit Union Card", category: "credit_card" },
  { name: "Conexus Credit Union Card", category: "credit_card" },

  // Credit Cards - Retail / Store
  { name: "Walmart Mastercard", category: "credit_card" },
  { name: "Canadian Tire Mastercard", category: "credit_card" },
  { name: "PC Financial Mastercard", category: "credit_card" },
  { name: "Costco Mastercard (CIBC)", category: "credit_card" },
  { name: "Hudson's Bay Mastercard", category: "credit_card" },
  { name: "Amazon.ca Visa", category: "credit_card" },
  { name: "Home Trust Visa", category: "credit_card" },
  { name: "Capital One Canada", category: "credit_card" },
  { name: "MBNA Canada", category: "credit_card" },
  { name: "Brim Financial", category: "credit_card" },
  { name: "Neo Financial", category: "credit_card" },

  // Subscriptions
  { name: "Netflix", category: "subscription" },
  { name: "Disney+", category: "subscription" },
  { name: "Amazon Prime", category: "subscription" },
  { name: "Spotify", category: "subscription" },
  { name: "Apple Music / iCloud", category: "subscription" },
  { name: "YouTube Premium", category: "subscription" },
  { name: "Crave", category: "subscription" },
  { name: "Microsoft 365", category: "subscription" },
  { name: "Adobe Creative Cloud", category: "subscription" },
  { name: "Paramount+", category: "subscription" },

  // Insurance
  { name: "Intact Insurance", category: "other" },
  { name: "Aviva Canada", category: "other" },
  { name: "Sun Life", category: "other" },
  { name: "Manulife", category: "other" },
  { name: "Canada Life", category: "other" },
  { name: "Desjardins Insurance", category: "other" },
  { name: "TD Insurance", category: "other" },
  { name: "Wawanesa", category: "other" },
  { name: "The Co-operators", category: "other" },
];

export function searchBillers(searchTerm: string): BillerEntry[] {
  if (!searchTerm.trim()) return [];
  const lower = searchTerm.toLowerCase();
  return canadianBillers.filter(b =>
    b.name.toLowerCase().includes(lower)
  ).slice(0, 8);
}
