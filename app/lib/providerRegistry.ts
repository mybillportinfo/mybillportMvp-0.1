export interface ProviderEntry {
  name: string;
  category: string;
  types: string[];
}

export type ProviderRegistry = Record<string, ProviderEntry>;

export const PROVIDER_REGISTRY: ProviderRegistry = {
  // --- Utilities: Electricity ---
  hydro_one: { name: 'Hydro One', category: 'utilities', types: ['electricity'] },
  toronto_hydro: { name: 'Toronto Hydro', category: 'utilities', types: ['electricity'] },
  hydro_ottawa: { name: 'Hydro Ottawa', category: 'utilities', types: ['electricity'] },
  hydro_quebec: { name: 'Hydro-Québec', category: 'utilities', types: ['electricity'] },
  bc_hydro: { name: 'BC Hydro', category: 'utilities', types: ['electricity'] },
  enmax: { name: 'ENMAX', category: 'utilities', types: ['electricity'] },
  epcor: { name: 'EPCOR', category: 'utilities', types: ['electricity'] },
  manitoba_hydro: { name: 'Manitoba Hydro', category: 'utilities', types: ['electricity'] },
  saskpower: { name: 'SaskPower', category: 'utilities', types: ['electricity'] },
  nb_power: { name: 'NB Power', category: 'utilities', types: ['electricity'] },
  nova_scotia_power: { name: 'Nova Scotia Power', category: 'utilities', types: ['electricity'] },

  // --- Utilities: Natural Gas ---
  enbridge_gas: { name: 'Enbridge Gas', category: 'utilities', types: ['natural_gas'] },
  fortisbc: { name: 'FortisBC', category: 'utilities', types: ['natural_gas'] },
  energir: { name: 'Énergir', category: 'utilities', types: ['natural_gas'] },
  atco_gas: { name: 'ATCO Gas', category: 'utilities', types: ['natural_gas'] },

  // --- Utilities: Water & Sewer ---
  city_of_toronto: { name: 'City of Toronto', category: 'utilities', types: ['water_sewer', 'property_tax'] },
  peel_region: { name: 'Peel Region', category: 'utilities', types: ['water_sewer'] },
  york_region: { name: 'York Region', category: 'utilities', types: ['water_sewer'] },
  city_of_ottawa: { name: 'City of Ottawa', category: 'utilities', types: ['water_sewer', 'property_tax'] },
  city_of_vancouver: { name: 'City of Vancouver', category: 'utilities', types: ['water_sewer', 'property_tax'] },
  city_of_calgary: { name: 'City of Calgary', category: 'utilities', types: ['water_sewer', 'property_tax'] },
  city_of_edmonton: { name: 'City of Edmonton', category: 'utilities', types: ['water_sewer', 'property_tax'] },
  city_of_winnipeg: { name: 'City of Winnipeg', category: 'utilities', types: ['water_sewer', 'property_tax'] },
  halifax_water: { name: 'Halifax Water', category: 'utilities', types: ['water_sewer'] },

  // --- Telecom: Mobile ---
  bell: { name: 'Bell', category: 'telecom', types: ['mobile', 'internet', 'cable_tv'] },
  rogers: { name: 'Rogers', category: 'telecom', types: ['mobile', 'internet', 'cable_tv'] },
  telus: { name: 'Telus', category: 'telecom', types: ['mobile', 'internet'] },
  freedom_mobile: { name: 'Freedom Mobile', category: 'telecom', types: ['mobile'] },
  videotron: { name: 'Videotron', category: 'telecom', types: ['mobile', 'cable_tv'] },
  sasktel: { name: 'SaskTel', category: 'telecom', types: ['mobile'] },
  fido: { name: 'Fido', category: 'telecom', types: ['mobile'] },
  koodo: { name: 'Koodo', category: 'telecom', types: ['mobile'] },
  virgin_plus: { name: 'Virgin Plus', category: 'telecom', types: ['mobile'] },
  public_mobile: { name: 'Public Mobile', category: 'telecom', types: ['mobile'] },

  // --- Telecom: Internet ---
  shaw: { name: 'Shaw', category: 'telecom', types: ['internet', 'cable_tv'] },
  cogeco: { name: 'Cogeco', category: 'telecom', types: ['internet'] },
  eastlink: { name: 'Eastlink', category: 'telecom', types: ['internet'] },
  teksavvy: { name: 'TekSavvy', category: 'telecom', types: ['internet'] },
  xplornet: { name: 'Xplornet', category: 'telecom', types: ['internet'] },
  starlink: { name: 'Starlink', category: 'telecom', types: ['internet'] },

  // --- Telecom: Cable TV ---
  bell_fibe: { name: 'Bell Fibe', category: 'telecom', types: ['cable_tv'] },
  rogers_cable: { name: 'Rogers Cable', category: 'telecom', types: ['cable_tv'] },
  telus_optik: { name: 'Telus Optik', category: 'telecom', types: ['cable_tv'] },

  // --- Housing: Mortgage ---
  rbc: { name: 'RBC', category: 'housing', types: ['mortgage', 'credit_card_bank', 'loan', 'auto_loan_lease'] },
  td: { name: 'TD', category: 'housing', types: ['mortgage', 'credit_card_bank', 'loan', 'auto_loan_lease'] },
  bmo: { name: 'BMO', category: 'housing', types: ['mortgage', 'credit_card_bank', 'loan', 'auto_loan_lease'] },
  cibc: { name: 'CIBC', category: 'housing', types: ['mortgage', 'credit_card_bank', 'loan'] },
  scotiabank: { name: 'Scotiabank', category: 'housing', types: ['mortgage', 'credit_card_bank', 'loan', 'auto_loan_lease'] },
  tangerine: { name: 'Tangerine', category: 'housing', types: ['mortgage', 'credit_card_bank'] },
  simplii: { name: 'Simplii', category: 'housing', types: ['mortgage', 'credit_card_bank'] },
  mcap: { name: 'MCAP', category: 'housing', types: ['mortgage'] },
  first_national: { name: 'First National', category: 'housing', types: ['mortgage'] },

  // --- Financial: Retail Credit Cards ---
  walmart: { name: 'Walmart', category: 'financial', types: ['credit_card_retail'] },
  canadian_tire_triangle: { name: 'Canadian Tire Triangle', category: 'financial', types: ['credit_card_retail'] },
  pc_financial: { name: 'PC Financial', category: 'financial', types: ['credit_card_retail'] },
  amazon_ca: { name: 'Amazon.ca', category: 'financial', types: ['credit_card_retail'] },
  hudsons_bay: { name: "Hudson's Bay", category: 'financial', types: ['credit_card_retail'] },
  best_buy: { name: 'Best Buy', category: 'financial', types: ['credit_card_retail'] },
  home_depot: { name: 'Home Depot', category: 'financial', types: ['credit_card_retail'] },

  // --- Financial: Credit Union ---
  meridian: { name: 'Meridian', category: 'financial', types: ['credit_union'] },
  vancity: { name: 'Vancity', category: 'financial', types: ['credit_union'] },
  coast_capital: { name: 'Coast Capital', category: 'financial', types: ['credit_union'] },
  desjardins: { name: 'Desjardins', category: 'financial', types: ['credit_union', 'car_insurance', 'home_tenant', 'pet_insurance'] },

  // --- Financial: Personal Loan ---
  fairstone: { name: 'Fairstone', category: 'financial', types: ['loan'] },

  // --- Insurance: Car ---
  intact: { name: 'Intact', category: 'insurance', types: ['car_insurance', 'home_tenant'] },
  aviva: { name: 'Aviva', category: 'insurance', types: ['car_insurance', 'home_tenant'] },
  td_insurance: { name: 'TD Insurance', category: 'insurance', types: ['car_insurance', 'home_tenant'] },
  cooperators: { name: 'Co-operators', category: 'insurance', types: ['car_insurance', 'home_tenant'] },
  economical: { name: 'Economical', category: 'insurance', types: ['car_insurance', 'home_tenant'] },
  sonnet: { name: 'Sonnet', category: 'insurance', types: ['car_insurance', 'home_tenant'] },
  icbc: { name: 'ICBC', category: 'insurance', types: ['car_insurance'] },
  sgi: { name: 'SGI', category: 'insurance', types: ['car_insurance'] },
  mpi: { name: 'MPI', category: 'insurance', types: ['car_insurance'] },

  // --- Subscriptions: Streaming ---
  netflix: { name: 'Netflix', category: 'subscriptions', types: ['streaming'] },
  disney_plus: { name: 'Disney+', category: 'subscriptions', types: ['streaming'] },
  prime_video: { name: 'Prime Video', category: 'subscriptions', types: ['streaming'] },
  crave: { name: 'Crave', category: 'subscriptions', types: ['streaming'] },
  spotify: { name: 'Spotify', category: 'subscriptions', types: ['streaming'] },
  apple_music: { name: 'Apple Music', category: 'subscriptions', types: ['streaming'] },
  youtube_premium: { name: 'YouTube Premium', category: 'subscriptions', types: ['streaming'] },

  // --- Subscriptions: Software ---
  google_one: { name: 'Google One', category: 'subscriptions', types: ['software'] },
  icloud: { name: 'iCloud', category: 'subscriptions', types: ['software'] },
  microsoft_365: { name: 'Microsoft 365', category: 'subscriptions', types: ['software'] },
  adobe: { name: 'Adobe', category: 'subscriptions', types: ['software'] },
  norton: { name: 'Norton', category: 'subscriptions', types: ['software'] },
  mcafee: { name: 'McAfee', category: 'subscriptions', types: ['software'] },

  // --- Transportation: Auto Loan ---
  td_auto_finance: { name: 'TD Auto Finance', category: 'transportation', types: ['auto_loan_lease'] },
  rbc_auto_finance: { name: 'RBC Auto Finance', category: 'transportation', types: ['auto_loan_lease'] },
  scotiabank_dealer_finance: { name: 'Scotiabank Dealer Finance', category: 'transportation', types: ['auto_loan_lease'] },
  bmo_auto_finance: { name: 'BMO Auto Finance', category: 'transportation', types: ['auto_loan_lease'] },
  honda_financial: { name: 'Honda Financial Services', category: 'transportation', types: ['auto_loan_lease'] },
  toyota_financial: { name: 'Toyota Financial Services', category: 'transportation', types: ['auto_loan_lease'] },
  gm_financial: { name: 'GM Financial', category: 'transportation', types: ['auto_loan_lease'] },
  ford_credit: { name: 'Ford Credit', category: 'transportation', types: ['auto_loan_lease'] },

  // --- Transportation: Parking/Tolls ---
  etr_407: { name: '407 ETR', category: 'transportation', types: ['parking_tolls'] },

  // --- Government ---
  cra: { name: 'CRA (Canada Revenue Agency)', category: 'government', types: ['federal_tax'] },
  nslsc: { name: 'NSLSC', category: 'government', types: ['student_loan', 'student_loan_payment'] },
  city_of_mississauga: { name: 'City of Mississauga', category: 'government', types: ['property_tax'] },
  city_of_brampton: { name: 'City of Brampton', category: 'government', types: ['property_tax'] },
  city_of_hamilton: { name: 'City of Hamilton', category: 'government', types: ['property_tax'] },

  // --- Miscellaneous: Gym ---
  goodlife_fitness: { name: 'GoodLife Fitness', category: 'miscellaneous', types: ['gym_fitness'] },
  anytime_fitness: { name: 'Anytime Fitness', category: 'miscellaneous', types: ['gym_fitness'] },
  fit4less: { name: 'Fit4Less', category: 'miscellaneous', types: ['gym_fitness'] },
  planet_fitness: { name: 'Planet Fitness', category: 'miscellaneous', types: ['gym_fitness'] },
  ymca: { name: 'YMCA', category: 'miscellaneous', types: ['gym_fitness'] },
  la_fitness: { name: 'LA Fitness', category: 'miscellaneous', types: ['gym_fitness'] },

  // --- Miscellaneous: Home Security ---
  adt: { name: 'ADT', category: 'miscellaneous', types: ['home_security'] },
  bell_smart_home: { name: 'Bell Smart Home', category: 'miscellaneous', types: ['home_security'] },
  rogers_smart_home: { name: 'Rogers Smart Home', category: 'miscellaneous', types: ['home_security'] },
  telus_smarthome: { name: 'Telus SmartHome', category: 'miscellaneous', types: ['home_security'] },
  vivint: { name: 'Vivint', category: 'miscellaneous', types: ['home_security'] },
  simplisafe: { name: 'SimpliSafe', category: 'miscellaneous', types: ['home_security'] },

  // --- Miscellaneous: Pet Insurance ---
  trupanion: { name: 'Trupanion', category: 'miscellaneous', types: ['pet_insurance'] },
  petsecure: { name: 'Petsecure', category: 'miscellaneous', types: ['pet_insurance'] },
  fetch: { name: 'Fetch', category: 'miscellaneous', types: ['pet_insurance'] },
  desjardins_pet_insurance: { name: 'Desjardins Pet Insurance', category: 'miscellaneous', types: ['pet_insurance'] },
  twentyfourpetwatch: { name: '24PetWatch', category: 'miscellaneous', types: ['pet_insurance'] },
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function lookupProviderIdByName(name: string): string | null {
  const normalized = name.trim();
  for (const [id, entry] of Object.entries(PROVIDER_REGISTRY)) {
    if (entry.name === normalized) return id;
  }
  return null;
}

export function resolveProvider(name: string): { providerId: string; providerName: string; isCustom: boolean } {
  const trimmed = name.trim();
  const knownId = lookupProviderIdByName(trimmed);
  if (knownId) {
    return {
      providerId: knownId,
      providerName: PROVIDER_REGISTRY[knownId].name,
      isCustom: false,
    };
  }
  return {
    providerId: `custom_${slugify(trimmed)}`,
    providerName: trimmed,
    isCustom: true,
  };
}

export function getProviderName(providerId: string): string | null {
  return PROVIDER_REGISTRY[providerId]?.name ?? null;
}
