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
        fields: [
          { key: 'billingPeriod', label: 'Billing Period', type: 'text', placeholder: 'e.g. Jan 1 - Jan 31' },
        ],
      },
      {
        value: 'natural_gas',
        label: 'Natural Gas',
        fields: [],
      },
      {
        value: 'water_sewer',
        label: 'Water & Sewer',
        fields: [
          { key: 'municipality', label: 'City / Municipality', type: 'text', placeholder: 'e.g. City of Toronto' },
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
        fields: [
          { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: 'e.g. 416-555-0123' },
          { key: 'planName', label: 'Plan Name', type: 'text', placeholder: 'e.g. Unlimited 50GB' },
        ],
      },
      {
        value: 'internet',
        label: 'Internet & Wi-Fi',
        fields: [
          { key: 'serviceAddress', label: 'Service Address', type: 'text', placeholder: 'e.g. 123 Main St' },
        ],
      },
      {
        value: 'cable_tv',
        label: 'Cable / TV',
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
        ],
      },
      {
        value: 'mortgage',
        label: 'Mortgage',
        fields: [
          { key: 'lender', label: 'Lender', type: 'text', placeholder: 'e.g. RBC, TD, MCAP' },
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
        fields: [
          { key: 'bankName', label: 'Bank', type: 'text', placeholder: 'e.g. RBC, TD, BMO' },
          { key: 'last4', label: 'Last 4 Digits', type: 'text', placeholder: 'e.g. 4242' },
          { key: 'minimumDue', label: 'Minimum Due ($)', type: 'number', placeholder: '0.00' },
        ],
      },
      {
        value: 'credit_card_retail',
        label: 'Credit Card (Retail)',
        fields: [
          { key: 'retailer', label: 'Retailer', type: 'text', placeholder: 'e.g. Canadian Tire, Walmart' },
          { key: 'last4', label: 'Last 4 Digits', type: 'text', placeholder: 'e.g. 1234' },
        ],
      },
      {
        value: 'loan',
        label: 'Personal / Auto Loan',
        fields: [
          { key: 'lender', label: 'Lender', type: 'text', placeholder: 'e.g. TD, Fairstone' },
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
        fields: [
          { key: 'policyNumber', label: 'Policy Number', type: 'text', placeholder: 'Policy #' },
          { key: 'vehicle', label: 'Vehicle', type: 'text', placeholder: 'e.g. 2022 Honda Civic' },
          { key: 'renewalDate', label: 'Renewal Date', type: 'text', placeholder: 'e.g. 2026-06-01' },
        ],
      },
      {
        value: 'home_tenant',
        label: 'Home / Tenant Insurance',
        fields: [
          { key: 'policyNumber', label: 'Policy Number', type: 'text', placeholder: 'Policy #' },
          { key: 'coverageType', label: 'Coverage Type', type: 'select', options: ['Homeowner', 'Tenant', 'Condo'] },
        ],
      },
      {
        value: 'life_health',
        label: 'Life / Health Insurance',
        fields: [
          { key: 'policyNumber', label: 'Policy Number', type: 'text', placeholder: 'Policy #' },
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
        fields: [
          { key: 'renewalDate', label: 'Renewal Date', type: 'text', placeholder: 'e.g. 2026-03-15' },
        ],
      },
      {
        value: 'software',
        label: 'Software & Cloud',
        fields: [
          { key: 'renewalDate', label: 'Renewal Date', type: 'text', placeholder: 'e.g. 2026-03-15' },
        ],
      },
      {
        value: 'gym_fitness',
        label: 'Gym / Fitness',
        fields: [],
      },
      {
        value: 'other_membership',
        label: 'Other Membership',
        fields: [],
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
        fields: [
          { key: 'vehicle', label: 'Vehicle', type: 'text', placeholder: 'e.g. 2023 Toyota RAV4' },
          { key: 'lender', label: 'Lender / Dealer', type: 'text', placeholder: 'e.g. TD Auto Finance' },
        ],
      },
      {
        value: 'parking_tolls',
        label: 'Parking / Tolls',
        fields: [
          { key: 'tollProvider', label: 'Provider', type: 'text', placeholder: 'e.g. 407 ETR' },
        ],
      },
      {
        value: 'transit_pass',
        label: 'Transit Pass',
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
        fields: [
          { key: 'taxYear', label: 'Tax Year', type: 'text', placeholder: 'e.g. 2025' },
        ],
      },
      {
        value: 'student_loan',
        label: 'Student Loan (NSLSC)',
        fields: [
          { key: 'loanAccount', label: 'Loan Account #', type: 'text', placeholder: 'Account number' },
        ],
      },
      {
        value: 'property_tax',
        label: 'Property Tax',
        fields: [
          { key: 'municipality', label: 'Municipality', type: 'text', placeholder: 'e.g. City of Ottawa' },
          { key: 'rollNumber', label: 'Roll Number', type: 'text', placeholder: 'Property roll #' },
        ],
      },
      {
        value: 'other_government',
        label: 'Other Government',
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
        label: 'School / College Tuition',
        fields: [
          { key: 'institution', label: 'Institution', type: 'text', placeholder: 'e.g. University of Toronto' },
          { key: 'studentId', label: 'Student ID', type: 'text', placeholder: 'Student #' },
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
        value: 'home_security',
        label: 'Home Security / Alarm',
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
