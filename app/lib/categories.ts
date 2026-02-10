export type BillingCycle = 'monthly' | 'biweekly' | 'annual' | 'one-time';

export interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface Subcategory {
  value: string;
  label: string;
  providers?: string[];
  fields: MetadataField[];
}

export interface Category {
  value: string;
  label: string;
  icon: string;
  subcategories: Subcategory[];
}

export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'annual', label: 'Annual' },
  { value: 'one-time', label: 'One-time' },
];

export const CATEGORIES: Category[] = [
  {
    value: 'utilities',
    label: 'Utilities',
    icon: '⚡',
    subcategories: [
      {
        value: 'electricity',
        label: 'Electricity',
        providers: ['Hydro One', 'Toronto Hydro', 'Hydro Ottawa', 'Hydro-Québec', 'BC Hydro', 'ENMAX', 'EPCOR', 'Manitoba Hydro', 'SaskPower', 'NB Power', 'Nova Scotia Power'],
        fields: [
          { key: 'billingPeriod', label: 'Billing Period', type: 'text', placeholder: 'e.g. Jan 1 - Jan 31' },
          { key: 'lastPaymentDate', label: 'Last Payment Date', type: 'text', placeholder: 'e.g. 2026-01-15' },
        ],
      },
      {
        value: 'natural_gas',
        label: 'Natural Gas',
        providers: ['Enbridge Gas', 'FortisBC', 'Énergir', 'ATCO Gas'],
        fields: [],
      },
      {
        value: 'water_sewer',
        label: 'Water & Sewer',
        providers: ['City of Toronto', 'Peel Region', 'York Region', 'City of Ottawa', 'City of Vancouver', 'City of Calgary', 'City of Edmonton', 'City of Winnipeg', 'Halifax Water'],
        fields: [
          { key: 'billingPeriod', label: 'Billing Period', type: 'text', placeholder: 'e.g. Jan 1 - Mar 31' },
        ],
      },
    ],
  },
  {
    value: 'telecom',
    label: 'Telecom & Connectivity',
    icon: '📱',
    subcategories: [
      {
        value: 'mobile',
        label: 'Mobile Phone',
        providers: ['Bell', 'Rogers', 'Telus', 'Freedom Mobile', 'Videotron', 'SaskTel', 'Fido', 'Koodo', 'Virgin Plus', 'Public Mobile'],
        fields: [
          { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: 'e.g. 416-555-0123' },
          { key: 'planName', label: 'Plan Name', type: 'text', placeholder: 'e.g. Unlimited 50GB' },
        ],
      },
      {
        value: 'internet',
        label: 'Internet & Wi-Fi',
        providers: ['Bell', 'Rogers', 'Telus', 'Shaw', 'Cogeco', 'Eastlink', 'TekSavvy', 'Xplornet', 'Starlink'],
        fields: [
          { key: 'serviceAddress', label: 'Service Address', type: 'text', placeholder: 'e.g. 123 Main St' },
        ],
      },
      {
        value: 'cable_tv',
        label: 'Cable / TV',
        providers: ['Bell Fibe', 'Rogers Cable', 'Shaw', 'Videotron', 'Telus Optik'],
        fields: [],
      },
    ],
  },
  {
    value: 'housing',
    label: 'Housing',
    icon: '🏠',
    subcategories: [
      {
        value: 'rent',
        label: 'Rent',
        fields: [
          { key: 'unitAddress', label: 'Unit Address', type: 'text', placeholder: 'e.g. Unit 4B, 55 King St' },
          { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['E-Transfer', 'Cheque', 'Pre-authorized Debit', 'Cash', 'Other'] },
        ],
      },
      {
        value: 'mortgage',
        label: 'Mortgage',
        providers: ['RBC', 'TD', 'BMO', 'CIBC', 'Scotiabank', 'Tangerine', 'Simplii', 'MCAP', 'First National'],
        fields: [
          { key: 'mortgageAccount', label: 'Mortgage Account #', type: 'text', placeholder: 'Account number' },
        ],
      },
    ],
  },
  {
    value: 'financial',
    label: 'Financial Products',
    icon: '💳',
    subcategories: [
      {
        value: 'credit_card_bank',
        label: 'Credit Card (Bank)',
        providers: ['RBC', 'TD', 'Scotiabank', 'BMO', 'CIBC', 'Tangerine', 'Simplii'],
        fields: [
          { key: 'cardName', label: 'Card Name', type: 'text', placeholder: 'e.g. Visa Infinite, Mastercard World Elite' },
          { key: 'last4', label: 'Last 4 Digits', type: 'text', placeholder: 'e.g. 4242' },
          { key: 'minimumDue', label: 'Minimum Due ($)', type: 'number', placeholder: '0.00' },
        ],
      },
      {
        value: 'credit_card_retail',
        label: 'Credit Card (Retail & Co-Branded)',
        providers: ['Walmart', 'Canadian Tire Triangle', 'PC Financial', 'Amazon.ca', 'Hudson\'s Bay', 'Best Buy', 'Home Depot'],
        fields: [
          { key: 'last4', label: 'Card Number (Last 4)', type: 'text', placeholder: 'e.g. 1234' },
        ],
      },
      {
        value: 'credit_union',
        label: 'Credit Union',
        providers: ['Meridian', 'Vancity', 'Coast Capital', 'Desjardins'],
        fields: [
          { key: 'last4', label: 'Last 4 Digits', type: 'text', placeholder: 'e.g. 5678' },
          { key: 'minimumDue', label: 'Minimum Due ($)', type: 'number', placeholder: '0.00' },
        ],
      },
      {
        value: 'loan',
        label: 'Personal Loan',
        providers: ['TD', 'Scotiabank', 'BMO', 'RBC', 'CIBC', 'Fairstone'],
        fields: [
          { key: 'loanAccount', label: 'Loan Account #', type: 'text', placeholder: 'Account number' },
        ],
      },
    ],
  },
  {
    value: 'insurance',
    label: 'Insurance',
    icon: '🛡️',
    subcategories: [
      {
        value: 'car_insurance',
        label: 'Car Insurance',
        providers: ['Intact', 'Aviva', 'TD Insurance', 'Desjardins', 'Co-operators', 'Economical', 'Sonnet', 'ICBC', 'SGI', 'MPI'],
        fields: [
          { key: 'policyNumber', label: 'Policy Number', type: 'text', placeholder: 'Policy #' },
          { key: 'vehicle', label: 'Vehicle', type: 'text', placeholder: 'e.g. 2022 Honda Civic' },
          { key: 'renewalDate', label: 'Renewal Date', type: 'text', placeholder: 'e.g. 2026-06-01' },
        ],
      },
      {
        value: 'home_tenant',
        label: 'Home / Tenant Insurance',
        providers: ['Intact', 'Aviva', 'TD Insurance', 'Desjardins', 'Co-operators', 'Economical', 'Sonnet'],
        fields: [
          { key: 'policyNumber', label: 'Policy Number', type: 'text', placeholder: 'Policy #' },
          { key: 'coverageType', label: 'Coverage Type', type: 'select', options: ['Homeowner', 'Tenant', 'Condo'] },
          { key: 'renewalDate', label: 'Renewal Date', type: 'text', placeholder: 'e.g. 2026-06-01' },
        ],
      },
    ],
  },
  {
    value: 'subscriptions',
    label: 'Subscriptions & Memberships',
    icon: '📺',
    subcategories: [
      {
        value: 'streaming',
        label: 'Streaming & Media',
        providers: ['Netflix', 'Disney+', 'Prime Video', 'Crave', 'Spotify', 'Apple Music', 'YouTube Premium'],
        fields: [
          { key: 'renewalDate', label: 'Renewal Date', type: 'text', placeholder: 'e.g. 2026-03-15' },
        ],
      },
      {
        value: 'software',
        label: 'Software & Cloud',
        providers: ['Google One', 'iCloud', 'Microsoft 365', 'Adobe', 'Norton', 'McAfee'],
        fields: [
          { key: 'renewalDate', label: 'Renewal Date', type: 'text', placeholder: 'e.g. 2026-03-15' },
        ],
      },
    ],
  },
  {
    value: 'transportation',
    label: 'Transportation & Vehicle',
    icon: '🚗',
    subcategories: [
      {
        value: 'auto_loan_lease',
        label: 'Auto Loan / Lease',
        providers: ['TD Auto Finance', 'RBC Auto Finance', 'Scotiabank Dealer Finance', 'BMO Auto Finance', 'Honda Financial Services', 'Toyota Financial Services', 'GM Financial', 'Ford Credit'],
        fields: [
          { key: 'vehicle', label: 'Vehicle', type: 'text', placeholder: 'e.g. 2023 Toyota RAV4' },
        ],
      },
      {
        value: 'parking_tolls',
        label: 'Parking / Tolls',
        providers: ['407 ETR'],
        fields: [],
      },
    ],
  },
  {
    value: 'government',
    label: 'Government & Public Payments',
    icon: '🏛️',
    subcategories: [
      {
        value: 'federal_tax',
        label: 'CRA Tax Installments',
        providers: ['CRA (Canada Revenue Agency)'],
        fields: [
          { key: 'taxYear', label: 'Tax Year', type: 'text', placeholder: 'e.g. 2025' },
        ],
      },
      {
        value: 'student_loan',
        label: 'Student Loan (NSLSC)',
        providers: ['NSLSC'],
        fields: [
          { key: 'loanAccount', label: 'Loan Account #', type: 'text', placeholder: 'Account number' },
        ],
      },
      {
        value: 'property_tax',
        label: 'Property Tax',
        providers: ['City of Toronto', 'City of Ottawa', 'City of Vancouver', 'City of Calgary', 'City of Edmonton', 'City of Mississauga', 'City of Brampton', 'City of Winnipeg', 'City of Hamilton'],
        fields: [
          { key: 'rollNumber', label: 'Roll Number', type: 'text', placeholder: 'Property roll #' },
        ],
      },
      {
        value: 'provincial_tax',
        label: 'Provincial Taxes / Health Premiums',
        fields: [],
      },
      {
        value: 'municipal_other',
        label: 'Municipal (Parking Fines, City Services)',
        fields: [],
      },
    ],
  },
  {
    value: 'education',
    label: 'Education & Childcare',
    icon: '🎓',
    subcategories: [
      {
        value: 'daycare',
        label: 'Daycare',
        fields: [
          { key: 'childName', label: 'Child Name', type: 'text', placeholder: 'Name' },
        ],
      },
      {
        value: 'tuition',
        label: 'School / College / University Tuition',
        fields: [
          { key: 'institution', label: 'Institution', type: 'text', placeholder: 'e.g. University of Toronto' },
          { key: 'studentId', label: 'Student ID', type: 'text', placeholder: 'Student #' },
        ],
      },
      {
        value: 'student_loan_payment',
        label: 'Student Loan Payment',
        providers: ['NSLSC'],
        fields: [
          { key: 'loanAccount', label: 'Loan Account #', type: 'text', placeholder: 'Account number' },
        ],
      },
    ],
  },
  {
    value: 'miscellaneous',
    label: 'Miscellaneous Recurring Bills',
    icon: '📋',
    subcategories: [
      {
        value: 'gym_fitness',
        label: 'Gym / Fitness Membership',
        providers: ['GoodLife Fitness', 'Anytime Fitness', 'Fit4Less', 'Planet Fitness', 'YMCA', 'LA Fitness'],
        fields: [],
      },
      {
        value: 'home_security',
        label: 'Home Security / Alarm Monitoring',
        providers: ['ADT', 'Bell Smart Home', 'Rogers Smart Home', 'Telus SmartHome', 'Vivint', 'SimpliSafe'],
        fields: [],
      },
      {
        value: 'storage',
        label: 'Storage Unit',
        fields: [],
      },
      {
        value: 'condo_hoa',
        label: 'Condo / HOA Fees',
        fields: [],
      },
      {
        value: 'pet_insurance',
        label: 'Pet Insurance',
        providers: ['Trupanion', 'Petsecure', 'Fetch', 'Desjardins Pet Insurance', '24PetWatch'],
        fields: [
          { key: 'petName', label: 'Pet Name', type: 'text', placeholder: 'Name' },
        ],
      },
      {
        value: 'other',
        label: 'Other',
        fields: [],
      },
    ],
  },
];

export function getCategoryByValue(value: string): Category | undefined {
  return CATEGORIES.find(c => c.value === value);
}

export function getSubcategory(categoryValue: string, subcategoryValue: string): Subcategory | undefined {
  const cat = getCategoryByValue(categoryValue);
  return cat?.subcategories.find(s => s.value === subcategoryValue);
}
