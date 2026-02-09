export interface BillerEntry {
  name: string;
  category: string;
  subcategory: string;
}

export interface BillCategory {
  id: string;
  label: string;
  subcategories: { id: string; label: string }[];
}

export const billCategories: BillCategory[] = [
  {
    id: "utilities",
    label: "Utilities",
    subcategories: [
      { id: "electricity", label: "Electricity" },
      { id: "natural_gas", label: "Natural Gas" },
      { id: "water_sewer", label: "Water & Sewer" },
    ],
  },
  {
    id: "telecom",
    label: "Telecom",
    subcategories: [
      { id: "mobile_phone", label: "Mobile Phone" },
      { id: "internet", label: "Internet / Wi-Fi" },
      { id: "cable_tv", label: "Cable / TV" },
    ],
  },
  {
    id: "housing",
    label: "Housing",
    subcategories: [
      { id: "rent", label: "Rent" },
      { id: "mortgage", label: "Mortgage" },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    subcategories: [
      { id: "bank_credit_card", label: "Bank Credit Card" },
      { id: "retail_card", label: "Retail / Store Card" },
      { id: "credit_union_card", label: "Credit Union Card" },
    ],
  },
  {
    id: "insurance",
    label: "Insurance",
    subcategories: [
      { id: "car_insurance", label: "Car Insurance" },
      { id: "home_tenant_insurance", label: "Home / Tenant Insurance" },
      { id: "life_insurance", label: "Life Insurance" },
    ],
  },
  {
    id: "government",
    label: "Government & Public",
    subcategories: [
      { id: "cra_taxes", label: "CRA Taxes" },
      { id: "property_tax", label: "Property Tax" },
      { id: "student_loans", label: "Student Loans" },
    ],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    subcategories: [
      { id: "streaming", label: "Streaming" },
      { id: "software_cloud", label: "Software / Cloud" },
    ],
  },
];

export const canadianBillers: BillerEntry[] = [
  // Utilities - Electricity
  { name: "Hydro One", category: "utilities", subcategory: "electricity" },
  { name: "Toronto Hydro", category: "utilities", subcategory: "electricity" },
  { name: "BC Hydro", category: "utilities", subcategory: "electricity" },
  { name: "Manitoba Hydro", category: "utilities", subcategory: "electricity" },
  { name: "Hydro-Québec", category: "utilities", subcategory: "electricity" },
  { name: "Nova Scotia Power", category: "utilities", subcategory: "electricity" },
  { name: "SaskPower", category: "utilities", subcategory: "electricity" },
  { name: "ATCO Electric", category: "utilities", subcategory: "electricity" },
  { name: "EPCOR", category: "utilities", subcategory: "electricity" },
  { name: "London Hydro", category: "utilities", subcategory: "electricity" },
  { name: "Alectra Utilities", category: "utilities", subcategory: "electricity" },
  { name: "Ottawa Hydro", category: "utilities", subcategory: "electricity" },
  { name: "NB Power", category: "utilities", subcategory: "electricity" },
  { name: "Newfoundland Power", category: "utilities", subcategory: "electricity" },

  // Utilities - Natural Gas
  { name: "Enbridge Gas", category: "utilities", subcategory: "natural_gas" },
  { name: "FortisBC", category: "utilities", subcategory: "natural_gas" },
  { name: "ATCO Gas", category: "utilities", subcategory: "natural_gas" },
  { name: "SaskEnergy", category: "utilities", subcategory: "natural_gas" },

  // Utilities - Water & Sewer
  { name: "City Water (Municipal)", category: "utilities", subcategory: "water_sewer" },
  { name: "Toronto Water", category: "utilities", subcategory: "water_sewer" },
  { name: "Metro Vancouver Water", category: "utilities", subcategory: "water_sewer" },

  // Telecom - Mobile Phone
  { name: "Bell Mobility", category: "telecom", subcategory: "mobile_phone" },
  { name: "Rogers Wireless", category: "telecom", subcategory: "mobile_phone" },
  { name: "Telus Mobility", category: "telecom", subcategory: "mobile_phone" },
  { name: "Freedom Mobile", category: "telecom", subcategory: "mobile_phone" },
  { name: "Fido", category: "telecom", subcategory: "mobile_phone" },
  { name: "Koodo Mobile", category: "telecom", subcategory: "mobile_phone" },
  { name: "Virgin Plus", category: "telecom", subcategory: "mobile_phone" },
  { name: "Chatr Mobile", category: "telecom", subcategory: "mobile_phone" },
  { name: "Public Mobile", category: "telecom", subcategory: "mobile_phone" },
  { name: "Lucky Mobile", category: "telecom", subcategory: "mobile_phone" },
  { name: "Videotron Mobile", category: "telecom", subcategory: "mobile_phone" },

  // Telecom - Internet / Wi-Fi
  { name: "Bell Internet", category: "telecom", subcategory: "internet" },
  { name: "Rogers Internet", category: "telecom", subcategory: "internet" },
  { name: "Telus Internet", category: "telecom", subcategory: "internet" },
  { name: "Shaw / Rogers", category: "telecom", subcategory: "internet" },
  { name: "Videotron Internet", category: "telecom", subcategory: "internet" },
  { name: "Cogeco", category: "telecom", subcategory: "internet" },
  { name: "Eastlink", category: "telecom", subcategory: "internet" },
  { name: "TekSavvy", category: "telecom", subcategory: "internet" },
  { name: "Start.ca", category: "telecom", subcategory: "internet" },
  { name: "Northwestel", category: "telecom", subcategory: "internet" },
  { name: "Teksavvy", category: "telecom", subcategory: "internet" },

  // Telecom - Cable / TV
  { name: "Bell Fibe TV", category: "telecom", subcategory: "cable_tv" },
  { name: "Rogers Ignite TV", category: "telecom", subcategory: "cable_tv" },
  { name: "Telus Optik TV", category: "telecom", subcategory: "cable_tv" },

  // Housing - Rent
  { name: "Rent Payment", category: "housing", subcategory: "rent" },

  // Housing - Mortgage
  { name: "RBC Mortgage", category: "housing", subcategory: "mortgage" },
  { name: "TD Mortgage", category: "housing", subcategory: "mortgage" },
  { name: "BMO Mortgage", category: "housing", subcategory: "mortgage" },
  { name: "CIBC Mortgage", category: "housing", subcategory: "mortgage" },
  { name: "Scotiabank Mortgage", category: "housing", subcategory: "mortgage" },
  { name: "National Bank Mortgage", category: "housing", subcategory: "mortgage" },
  { name: "Desjardins Mortgage", category: "housing", subcategory: "mortgage" },
  { name: "Credit Union Mortgage", category: "housing", subcategory: "mortgage" },

  // Financial - Bank Credit Cards (Big 5+)
  { name: "TD Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "RBC Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "BMO Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "Scotiabank Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "CIBC Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "National Bank Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "Desjardins Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "HSBC Canada Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "Tangerine Credit Card", category: "financial", subcategory: "bank_credit_card" },
  { name: "Simplii Financial Credit Card", category: "financial", subcategory: "bank_credit_card" },

  // Financial - Retail / Store Cards
  { name: "Walmart Mastercard", category: "financial", subcategory: "retail_card" },
  { name: "Canadian Tire Mastercard", category: "financial", subcategory: "retail_card" },
  { name: "PC Financial Mastercard", category: "financial", subcategory: "retail_card" },
  { name: "Costco Mastercard (CIBC)", category: "financial", subcategory: "retail_card" },
  { name: "Hudson's Bay Mastercard", category: "financial", subcategory: "retail_card" },
  { name: "Amazon.ca Visa", category: "financial", subcategory: "retail_card" },
  { name: "Home Trust Visa", category: "financial", subcategory: "retail_card" },
  { name: "Capital One Canada", category: "financial", subcategory: "retail_card" },
  { name: "MBNA Canada", category: "financial", subcategory: "retail_card" },
  { name: "Brim Financial", category: "financial", subcategory: "retail_card" },
  { name: "Neo Financial", category: "financial", subcategory: "retail_card" },

  // Financial - Credit Union Cards
  { name: "Vancity Credit Card", category: "financial", subcategory: "credit_union_card" },
  { name: "Coast Capital Credit Card", category: "financial", subcategory: "credit_union_card" },
  { name: "Meridian Credit Card", category: "financial", subcategory: "credit_union_card" },
  { name: "Servus Credit Union Card", category: "financial", subcategory: "credit_union_card" },
  { name: "Conexus Credit Union Card", category: "financial", subcategory: "credit_union_card" },

  // Insurance - Car
  { name: "Intact Insurance (Auto)", category: "insurance", subcategory: "car_insurance" },
  { name: "Aviva Canada (Auto)", category: "insurance", subcategory: "car_insurance" },
  { name: "TD Insurance (Auto)", category: "insurance", subcategory: "car_insurance" },
  { name: "Desjardins Insurance (Auto)", category: "insurance", subcategory: "car_insurance" },
  { name: "Wawanesa (Auto)", category: "insurance", subcategory: "car_insurance" },
  { name: "The Co-operators (Auto)", category: "insurance", subcategory: "car_insurance" },
  { name: "ICBC", category: "insurance", subcategory: "car_insurance" },
  { name: "SGI Saskatchewan", category: "insurance", subcategory: "car_insurance" },
  { name: "MPI Manitoba", category: "insurance", subcategory: "car_insurance" },

  // Insurance - Home / Tenant
  { name: "Intact Insurance (Home)", category: "insurance", subcategory: "home_tenant_insurance" },
  { name: "Aviva Canada (Home)", category: "insurance", subcategory: "home_tenant_insurance" },
  { name: "TD Insurance (Home)", category: "insurance", subcategory: "home_tenant_insurance" },
  { name: "Square One Insurance", category: "insurance", subcategory: "home_tenant_insurance" },
  { name: "Sonnet Insurance", category: "insurance", subcategory: "home_tenant_insurance" },

  // Insurance - Life
  { name: "Sun Life", category: "insurance", subcategory: "life_insurance" },
  { name: "Manulife", category: "insurance", subcategory: "life_insurance" },
  { name: "Canada Life", category: "insurance", subcategory: "life_insurance" },
  { name: "Great-West Life", category: "insurance", subcategory: "life_insurance" },
  { name: "Industrial Alliance", category: "insurance", subcategory: "life_insurance" },

  // Government & Public - CRA Taxes
  { name: "CRA Income Tax", category: "government", subcategory: "cra_taxes" },
  { name: "CRA GST/HST", category: "government", subcategory: "cra_taxes" },

  // Government & Public - Property Tax
  { name: "Municipal Property Tax", category: "government", subcategory: "property_tax" },
  { name: "City of Toronto Property Tax", category: "government", subcategory: "property_tax" },

  // Government & Public - Student Loans
  { name: "NSLSC Student Loan", category: "government", subcategory: "student_loans" },
  { name: "Provincial Student Loan", category: "government", subcategory: "student_loans" },

  // Subscriptions - Streaming
  { name: "Netflix", category: "subscriptions", subcategory: "streaming" },
  { name: "Disney+", category: "subscriptions", subcategory: "streaming" },
  { name: "Amazon Prime", category: "subscriptions", subcategory: "streaming" },
  { name: "Spotify", category: "subscriptions", subcategory: "streaming" },
  { name: "Apple Music / iCloud", category: "subscriptions", subcategory: "streaming" },
  { name: "YouTube Premium", category: "subscriptions", subcategory: "streaming" },
  { name: "Crave", category: "subscriptions", subcategory: "streaming" },
  { name: "Paramount+", category: "subscriptions", subcategory: "streaming" },
  { name: "Apple TV+", category: "subscriptions", subcategory: "streaming" },

  // Subscriptions - Software / Cloud
  { name: "Microsoft 365", category: "subscriptions", subcategory: "software_cloud" },
  { name: "Adobe Creative Cloud", category: "subscriptions", subcategory: "software_cloud" },
  { name: "Google Workspace", category: "subscriptions", subcategory: "software_cloud" },
  { name: "Dropbox", category: "subscriptions", subcategory: "software_cloud" },
];

export function searchBillers(searchTerm: string): BillerEntry[] {
  if (!searchTerm.trim()) return [];
  const lower = searchTerm.toLowerCase();
  return canadianBillers.filter(b =>
    b.name.toLowerCase().includes(lower) ||
    b.category.toLowerCase().includes(lower) ||
    b.subcategory.toLowerCase().replace('_', ' ').includes(lower)
  ).slice(0, 8);
}

export function getCategoryLabel(categoryId: string): string {
  const cat = billCategories.find(c => c.id === categoryId);
  return cat?.label || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}

export function getSubcategoryLabel(categoryId: string, subcategoryId: string): string {
  const cat = billCategories.find(c => c.id === categoryId);
  if (!cat) return subcategoryId.replace(/_/g, ' ');
  const sub = cat.subcategories.find(s => s.id === subcategoryId);
  return sub?.label || subcategoryId.replace(/_/g, ' ');
}
