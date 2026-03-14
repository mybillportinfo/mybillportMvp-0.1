export interface BillerPaymentInfo {
  name: string;
  url: string;
  category: string;
}

export const paymentUrls: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════
  // UTILITIES - ELECTRICITY
  // ═══════════════════════════════════════════════════════════════
  "Hydro One": "https://www.hydroone.com/rates-and-billing/billing-and-payments",
  "Toronto Hydro": "https://www.torontohydro.com/for-home/ways-to-pay",
  "Toronto Hydro Business": "https://www.torontohydro.com/for-business/ways-to-pay",
  "Hydro Ottawa": "https://www.hydroottawa.com/en/accounts-services/accounts/billing-payment/how-pay-your-bill",
  "Hydro Ottawa Business": "https://www.hydroottawa.com/en/business",
  "BC Hydro": "https://www.bchydro.com/accounts-billing/pay-bill.html",
  "Manitoba Hydro": "https://www.hydro.mb.ca/support/help/0032-how-to-pay-your-hydro-bill/",
  "SaskPower": "https://www.saskpower.com/accounts/billing-and-payments",
  "NB Power": "https://www.nbpower.com/en/home-billing/bill-payment-options/",
  "New Brunswick Power": "https://www.nbpower.com/en/home-billing/bill-payment-options/",
  "Nova Scotia Power": "https://www.nspower.ca/my-account",
  "EPCOR": "https://www.epcor.com/accounts",
  "EPCOR Utilities": "https://www.epcor.com/accounts",
  "ENMAX": "https://myaccount.enmax.com/",
  "ENMAX Energy": "https://myaccount.enmax.com/",
  "Alectra": "https://www.alectrautilities.com/pay-your-bill",
  "Alectra Utilities": "https://www.alectrautilities.com/pay-your-bill",
  "Newfoundland Power": "https://www.newfoundlandpower.com/en/My-Account",
  "Maritime Electric": "https://www.maritimeelectric.com/my-account/",
  "Hydro-Quebec": "https://www.hydroquebec.com/portail/en/",
  "Hydro-Québec": "https://www.hydroquebec.com/portail/en/",
  "London Hydro": "https://www.londonhydro.com/myaccount",
  "Burlington Hydro": "https://www.burlingtonhydro.com/my-account",
  "Oakville Hydro": "https://www.oakvillehydro.com/my-account",
  "Milton Hydro": "https://www.miltonhydro.com/my-account",
  "Kitchener-Wilmot Hydro": "https://www.kwhydro.ca/my-account",
  "Canadian Niagara Power": "https://www.cnpower.com/residential/payment-options",
  "FortisAlberta": "https://www.fortisalberta.com/customer-care/billing",
  "FortisBC Electric": "https://www.fortisbc.com/accounts-billing",
  "Horizon Utilities": "https://www.alectrautilities.com/pay-your-bill",
  "Saskatoon Light & Power": "https://www.saskatoon.ca/services-residents/power-water-sewer/saskatoon-light-power",
  "PEI Energy": "https://www.maritimeelectric.com/my-account/",
  "Yukon Energy": "https://yukonenergy.ca/customer-service/billing-payments",
  "Northwest Territories Power": "https://www.ntpc.com/customer-service/residential-customer-service/billing-and-payment-options",

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES - NATURAL GAS
  // ═══════════════════════════════════════════════════════════════
  "Enbridge Gas": "https://www.enbridgegas.com/my-account",
  "Enbridge Gas Residential": "https://www.enbridgegas.com/ontario/my-account/pay-my-bill",
  "Enbridge Gas Business": "https://www.enbridgegas.com/ontario/business-industrial/business/pay-my-bill",
  "Enbridge": "https://www.enbridgegas.com/my-account",
  "FortisBC": "https://www.fortisbc.com/accounts-billing",
  "FortisBC Gas": "https://www.fortisbc.com/accounts-billing",
  "Énergir": "https://www.energir.com/en/my-account/",
  "Energir": "https://www.energir.com/en/my-account/",
  "ATCO Gas": "https://www.atco.com/en-ca/my-account.html",
  "ATCO": "https://www.atco.com/en-ca/my-account.html",
  "ATCO Energy": "https://www.atcoenergy.com/my-account",
  "Direct Energy": "https://www.directenergy.ca/manage-account",
  "Just Energy": "https://www.justenergy.com/my-account/",
  "SaskEnergy": "https://www.saskenergy.com/my-account",

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES - WATER
  // ═══════════════════════════════════════════════════════════════
  "City of Toronto Water": "https://www.toronto.ca/services-payments/property-taxes-utilities/utility-bill/pay-your-utility-bill/",
  "City of Vancouver Utilities": "https://vancouver.ca/home-property-development/pay-your-bill.aspx",
  "Region of Peel Water": "https://www.peelregion.ca/finance/",
  "York Region Water": "https://www.york.ca/support/property-taxes-water-billing",
  "Region of Waterloo Water": "https://www.regionofwaterloo.ca/en/living-here/water-billing.aspx",
  "Region of Durham Water": "https://www.durham.ca/en/doing-business/water-and-sewer-billing.aspx",
  "Halton Region Water": "https://www.halton.ca/For-Residents/Water-and-Environment/Water-Wastewater-Billing",
  "City of Ottawa Water": "https://ottawa.ca/en/living-ottawa/water/utility-bill-and-account",
  "EPCOR Water": "https://www.epcor.com/accounts",
  "City of Calgary Water": "https://www.calgary.ca/water/water-and-wastewater-billing.html",

  // ═══════════════════════════════════════════════════════════════
  // TELECOM - MOBILE / INTERNET / CABLE
  // ═══════════════════════════════════════════════════════════════
  "Rogers": "https://www.rogers.com/pay-bill",
  "Rogers Business": "https://www.rogers.com/business/bss",
  "Bell": "https://www.bell.ca/MyBell",
  "Bell Canada": "https://www.bell.ca/MyBell",
  "Bell Canada Personal": "https://www.bell.ca/MyBell",
  "Bell Business": "https://business.bell.ca/myaccount",
  "Telus": "https://www.telus.com/myaccount",
  "TELUS": "https://www.telus.com/myaccount",
  "TELUS Personal": "https://www.telus.com/myaccount",
  "TELUS Business": "https://business.telus.com/myaccount",
  "Fido": "https://www.fido.ca/payment",
  "Freedom Mobile": "https://www.freedommobile.ca/en-CA/my-account",
  "Koodo": "https://www.koodomobile.com/en/my-account",
  "Virgin Plus": "https://www.virginplus.ca/en/myaccount/",
  "Shaw": "https://www.shaw.ca/payments",
  "Shaw Business": "https://business.shaw.ca/payment",
  "Cogeco": "https://www.cogeco.ca/en/my-account",
  "Eastlink": "https://www.eastlink.ca/myeastlink",
  "TekSavvy": "https://myaccount.teksavvy.com/",
  "Videotron": "https://www.videotron.com/en/my-account",
  "Xplornet": "https://myaccount.xplornet.com/",
  "SaskTel": "https://www.sasktel.com/personal/my-account",
  "MTS": "https://www.bell.ca/MyBell",
  "Public Mobile": "https://www.publicmobile.ca/en/on/my-account",
  "Chatr": "https://www.chatrwireless.com/my-account",
  "Lucky Mobile": "https://www.luckymobile.ca/my-account",
  "Starlink": "https://www.starlink.com/account",
  "Fizz": "https://fizz.ca/en/my-account",
  "Oxio": "https://www.oxio.ca/en/my-account",
  "Start.ca": "https://www.start.ca/mystart/",
  "Distributel": "https://www.distributel.ca/my-account/",
  "Tbaytel": "https://www.tbaytel.net/personal/my-account",
  "Northwestel": "https://www.nwtel.ca/my-account",
  "Execulink": "https://www.execulink.ca/my-account/",
  "Telebec": "https://www.bell.ca/MyBell",
  "Ebox": "https://www.ebox.ca/en/my-account",

  // ═══════════════════════════════════════════════════════════════
  // GOVERNMENT - FEDERAL
  // ═══════════════════════════════════════════════════════════════
  "Canada Revenue Agency": "https://www.canada.ca/en/revenue-agency/services/payments-cra.html",
  "CRA": "https://www.canada.ca/en/revenue-agency/services/payments-cra.html",
  "NSLSC": "https://www.csnpe-nslsc.canada.ca/en/home",
  "NSLSC Student Loans": "https://www.csnpe-nslsc.canada.ca/en/home",
  "National Student Loans Service Centre": "https://www.csnpe-nslsc.canada.ca/en/home",
  "Service Canada": "https://www.canada.ca/en/employment-social-development/corporate/portfolio/service-canada.html",
  "Immigration Fees": "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html",

  // ═══════════════════════════════════════════════════════════════
  // GOVERNMENT - PROVINCIAL
  // ═══════════════════════════════════════════════════════════════
  "Revenu Québec": "https://www.revenuquebec.ca/en/citizens/your-situation/payment/",
  "Revenu Quebec": "https://www.revenuquebec.ca/en/citizens/your-situation/payment/",
  "Ontario Ministry of Finance": "https://www.ontario.ca/page/make-tax-payment",
  "BC Provincial Taxes": "https://www2.gov.bc.ca/gov/content/taxes",
  "Alberta Tax and Revenue": "https://www.alberta.ca/tax-levy-administration",
  "Manitoba Finance": "https://www.gov.mb.ca/finance/taxation/",
  "Saskatchewan Finance": "https://www.saskatchewan.ca/government/government-structure/ministries/finance",
  "Nova Scotia Finance": "https://beta.novascotia.ca/topics/taxes-and-assessment",
  "New Brunswick Finance": "https://www2.gnb.ca/content/gnb/en/departments/finance.html",
  "PEI Finance": "https://www.princeedwardisland.ca/en/topic/taxes-fees-and-fines",
  "Newfoundland Finance": "https://www.gov.nl.ca/fin/tax-programs-incentives/",

  // ═══════════════════════════════════════════════════════════════
  // GOVERNMENT - MUNICIPAL (PROPERTY TAX / UTILITIES)
  // ═══════════════════════════════════════════════════════════════
  "City of Toronto": "https://www.toronto.ca/services-payments/property-taxes-utilities/",
  "City of Toronto Property Tax": "https://www.toronto.ca/services-payments/property-taxes-utilities/",
  "City of Ottawa": "https://ottawa.ca/en/living-ottawa/taxes",
  "City of Mississauga": "https://www.mississauga.ca/services-and-programs/tax-and-utility-payments/",
  "City of Brampton": "https://www.brampton.ca/EN/residents/Taxes-Assessment/Pages/welcome.aspx",
  "City of Hamilton": "https://www.hamilton.ca/home-neighbourhood/property-taxes",
  "City of Calgary": "https://www.calgary.ca/property-owners/taxes.html",
  "City of Edmonton": "https://www.edmonton.ca/programs_services/property-tax",
  "City of Vancouver": "https://vancouver.ca/home-property-development/pay-your-bill.aspx",
  "City of Winnipeg": "https://www.winnipeg.ca/assessment/PaymentOptions/default.stm",
  "City of Montreal": "https://montreal.ca/en/topics/property-taxes",
  "Ville de Montréal": "https://montreal.ca/en/topics/property-taxes",
  "City of Surrey": "https://www.surrey.ca/services-payments/property-taxes-utilities",
  "City of Markham": "https://www.markham.ca/wps/portal/home/about/city-hall/finance",
  "City of Vaughan": "https://www.vaughan.ca/residential/property-taxes-and-utilities",
  "City of Richmond Hill": "https://www.richmondhill.ca/en/find-or-learn-about/property-taxes.aspx",
  "City of Kitchener": "https://www.kitchener.ca/en/tax-and-utility-billing.aspx",
  "City of London": "https://london.ca/living-london/property-taxes",
  "City of Windsor": "https://www.citywindsor.ca/residents/taxes/",
  "City of Waterloo": "https://www.waterloo.ca/en/government/property-taxes.aspx",
  "City of Guelph": "https://guelph.ca/living/property-taxes/",
  "City of Barrie": "https://www.barrie.ca/government-news/property-taxes",
  "City of Thunder Bay": "https://www.thunderbay.ca/en/city-services/property-taxes.aspx",
  "City of Regina": "https://www.regina.ca/home-property/property-taxes/",
  "City of Saskatoon": "https://www.saskatoon.ca/services-residents/property-tax",
  "City of Halifax": "https://www.halifax.ca/home-property/property-taxes",
  "City of St. John's": "https://www.stjohns.ca/en/taxes-assessment.aspx",
  "City of Fredericton": "https://www.fredericton.ca/en/taxes-finances",
  "City of Charlottetown": "https://www.charlottetown.ca/residents/taxes-utilities",
  "City of Whitehorse": "https://www.whitehorse.ca/our-government/finance/property-taxes/",
  "City of Yellowknife": "https://www.yellowknife.ca/en/living-here/property-taxes.aspx",
  "City of Iqaluit": "https://www.iqaluit.ca/government/finance/taxation",
  "City of Kelowna": "https://www.kelowna.ca/city-services/taxes-utilities",
  "City of Victoria": "https://www.victoria.ca/EN/main/residents/property-taxes.html",
  "City of Nanaimo": "https://www.nanaimo.ca/your-government/finances/property-taxes",
  "City of Lethbridge": "https://www.lethbridge.ca/living-here/property-taxes",
  "City of Red Deer": "https://www.reddeer.ca/city-services/property-tax/",
  "City of Grande Prairie": "https://www.cityofgp.com/city-government/finance/property-taxes",
  "City of Moncton": "https://www.moncton.ca/taxes",

  // ═══════════════════════════════════════════════════════════════
  // INSURANCE - AUTO / HOME / LIFE (PUBLIC + PRIVATE)
  // ═══════════════════════════════════════════════════════════════
  "ICBC": "https://www.icbc.com/insurance/pay-manage/Pages/default.aspx",
  "Insurance Corporation of British Columbia": "https://www.icbc.com/insurance/pay-manage/Pages/default.aspx",
  "SGI": "https://www.sgi.sk.ca/online-services",
  "Saskatchewan Government Insurance": "https://www.sgi.sk.ca/online-services",
  "MPI": "https://www.mpi.mb.ca/Pages/pay-your-bill.aspx",
  "Manitoba Public Insurance": "https://www.mpi.mb.ca/Pages/pay-your-bill.aspx",
  "SAAQ": "https://saaq.gouv.qc.ca/en/",
  "TD Insurance": "https://myinsurance.td.com/",
  "Intact Insurance": "https://www.intact.ca/en/personal-insurance/my-account.html",
  "Intact": "https://www.intact.ca/en/personal-insurance/my-account.html",
  "Aviva": "https://www.avivacanada.com/my-account",
  "Aviva Canada": "https://www.avivacanada.com/my-account",
  "Desjardins Insurance": "https://accesdesjardins.desjardins.com/",
  "Belairdirect": "https://www.belairdirect.com/en/my-account.html",
  "belairdirect": "https://www.belairdirect.com/en/my-account.html",
  "Co-operators": "https://www.cooperators.ca/en/My-Account.aspx",
  "Wawanesa": "https://www.wawanesa.com/canada/my-policy.html",
  "Wawanesa Insurance": "https://www.wawanesa.com/canada/my-policy.html",
  "RBC Insurance": "https://www.rbcinsurance.com/my-account",
  "Manulife": "https://my.manulife.ca/",
  "Manulife Financial": "https://my.manulife.ca/",
  "Sun Life": "https://mysunlife.ca/",
  "Sun Life Financial": "https://mysunlife.ca/",
  "Canada Life": "https://my.canadalife.com/",
  "Great-West Life": "https://my.canadalife.com/",
  "Industrial Alliance": "https://ia.ca/individuals/my-account",
  "iA Financial": "https://ia.ca/individuals/my-account",
  "Sonnet": "https://www.sonnet.ca/signin",
  "Economical Insurance": "https://www.intact.ca/en/personal-insurance/my-account.html",
  "Gore Mutual": "https://www.goremutual.ca/",
  "Pembridge Insurance": "https://www.pembridgeinsurance.com/",
  "CAA Insurance": "https://www.caainsurance.com/en/my-account",
  "BMO Insurance": "https://www.bmo.com/main/personal/insurance/",
  "CIBC Insurance": "https://www.cibc.com/en/personal-banking/insurance.html",
  "Scotiabank Insurance": "https://www.scotiabank.com/ca/en/personal/insurance.html",

  // ═══════════════════════════════════════════════════════════════
  // BANKING - CREDIT CARDS / LOANS
  // ═══════════════════════════════════════════════════════════════
  "RBC": "https://www.rbcroyalbank.com/onlinebanking/",
  "RBC Royal Bank": "https://www.rbcroyalbank.com/onlinebanking/",
  "TD": "https://www.td.com/ca/en/personal-banking/",
  "TD Canada Trust": "https://www.td.com/ca/en/personal-banking/",
  "Scotiabank": "https://www.scotiabank.com/ca/en/personal-banking.html",
  "BMO": "https://www.bmo.com/main/personal/",
  "BMO Bank of Montreal": "https://www.bmo.com/main/personal/",
  "CIBC": "https://www.cibc.com/en/personal-banking.html",
  "National Bank": "https://www.nbc.ca/personal.html",
  "National Bank of Canada": "https://www.nbc.ca/personal.html",
  "Desjardins": "https://accesdesjardins.desjardins.com/",
  "HSBC Canada": "https://www.hsbc.ca/",
  "Tangerine": "https://www.tangerine.ca/en/personal/",
  "Simplii Financial": "https://www.simplii.com/en/home.html",
  "Canadian Tire Financial": "https://www.ctfs.com/",
  "Canadian Tire Bank": "https://www.ctfs.com/",
  "Capital One Canada": "https://www.capitalone.ca/",
  "MBNA": "https://www.mbna.ca/",
  "PC Financial": "https://www.pcfinancial.ca/",
  "Laurentian Bank": "https://www.laurentianbank.ca/en/personal.html",
  "EQ Bank": "https://www.eqbank.ca/",
  "Meridian Credit Union": "https://www.meridiancu.ca/personal",
  "Vancity": "https://www.vancity.com/",
  "Coast Capital Savings": "https://www.coastcapitalsavings.com/",
  "ATB Financial": "https://www.atb.com/personal/",
  "Servus Credit Union": "https://www.servus.ca/",
  "Affinity Credit Union": "https://www.affinitycu.ca/",
  "Conexus Credit Union": "https://www.conexus.ca/",
  "Libro Credit Union": "https://www.libro.ca/",

  // ═══════════════════════════════════════════════════════════════
  // MORTGAGE LENDERS
  // ═══════════════════════════════════════════════════════════════
  "First National Financial": "https://www.firstnational.ca/residential/customer-centre",
  "MCAP": "https://www.mcap.com/residential/my-mortgage",
  "Home Trust": "https://www.hometrust.ca/",
  "Equitable Bank": "https://www.equitablebank.ca/",

  // ═══════════════════════════════════════════════════════════════
  // TRANSPORTATION - TOLL / TRANSIT
  // ═══════════════════════════════════════════════════════════════
  "407 ETR": "https://www.407etr.com/en/account/account-access.html",
  "TransLink": "https://www.compasscard.ca/",
  "Compass Card": "https://www.compasscard.ca/",
  "PRESTO": "https://www.prestocard.ca/en/",
  "Presto": "https://www.prestocard.ca/en/",
  "Presto Card": "https://www.prestocard.ca/en/",
  "GO Transit": "https://www.gotransit.com/en/presto",
  "Metrolinx": "https://www.prestocard.ca/en/",
  "STM": "https://www.stm.info/en/info/fares/opus-online",
  "STM Montreal": "https://www.stm.info/en/info/fares/opus-online",
  "OC Transpo": "https://www.octranspo.com/en/fares/",
  "Calgary Transit": "https://www.calgarytransit.com/fares-passes",
  "Edmonton Transit": "https://www.edmonton.ca/ets",
  "Winnipeg Transit": "https://winnipegtransit.com/fares",
  "BC Ferries": "https://www.bcferries.com/book-and-manage",
  "CAA": "https://www.caa.ca/membership/",

  // ═══════════════════════════════════════════════════════════════
  // EDUCATION - STUDENT LOANS
  // ═══════════════════════════════════════════════════════════════
  "Ontario Student Loans (OSAP)": "https://www.ontario.ca/page/pay-back-osap",
  "OSAP": "https://www.ontario.ca/page/pay-back-osap",
  "AFE Quebec Student Loans": "https://www.quebec.ca/en/education/student-financial-assistance/repaying-student-loan",
  "BC StudentAid": "https://studentaidbc.ca/repay",
  "Alberta Student Aid": "https://studentaid.alberta.ca/repayment/",
  "Manitoba Student Aid": "https://www.edu.gov.mb.ca/msa/",
  "Saskatchewan Student Loans": "https://www.saskatchewan.ca/residents/education-and-learning/student-loans",

  // ═══════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS - DIGITAL
  // ═══════════════════════════════════════════════════════════════
  "Netflix": "https://www.netflix.com/youraccount",
  "Spotify": "https://www.spotify.com/account/",
  "Amazon Prime": "https://www.amazon.ca/gp/primecentral",
  "Disney+": "https://www.disneyplus.com/account",
  "Apple": "https://support.apple.com/billing",
  "Apple One": "https://support.apple.com/billing",
  "Google One": "https://one.google.com/",
  "Microsoft 365": "https://account.microsoft.com/services",
  "Adobe": "https://account.adobe.com/plans",
  "Adobe Creative Cloud": "https://account.adobe.com/plans",
  "YouTube Premium": "https://www.youtube.com/paid_memberships",
  "Crave": "https://www.crave.ca/account",
  "Paramount+": "https://www.paramountplus.com/account/",
  "Amazon Prime Video": "https://www.primevideo.com/settings/",
  "Apple TV+": "https://support.apple.com/billing",
  "Audible": "https://www.audible.ca/account",
  "Dropbox": "https://www.dropbox.com/account/plan",
  "iCloud+": "https://support.apple.com/billing",
  "Xbox Game Pass": "https://account.microsoft.com/services",
  "PlayStation Plus": "https://store.playstation.com/en-ca/latest",
  "Nintendo Switch Online": "https://accounts.nintendo.com/",

  // ═══════════════════════════════════════════════════════════════
  // PROPERTY MANAGEMENT / RENT
  // ═══════════════════════════════════════════════════════════════
  "Minto": "https://www.minto.com/residents",
  "CAPREIT": "https://www.capreit.ca/residents/",
  "Boardwalk": "https://www.bfreit.com/",
  "Killam": "https://killamreit.com/residents",
  "Mainstreet Equity": "https://www.mainst.biz/residents",

  // ═══════════════════════════════════════════════════════════════
  // MISCELLANEOUS RECURRING
  // ═══════════════════════════════════════════════════════════════
  "Goodlife Fitness": "https://www.goodlifefitness.com/members.html",
  "GoodLife Fitness": "https://www.goodlifefitness.com/members.html",
  "Planet Fitness": "https://www.planetfitness.ca/",
  "YMCA": "https://www.ymca.ca/",
  "Costco Membership": "https://www.costco.ca/my-account.html",
  "Amazon Canada": "https://www.amazon.ca/gp/css/homepage.html",
};

export function getPaymentUrl(billerName: string): string | null {
  if (paymentUrls[billerName]) return paymentUrls[billerName];

  const lowerName = billerName.toLowerCase();
  for (const [key, url] of Object.entries(paymentUrls)) {
    if (key.toLowerCase() === lowerName) return url;
  }

  for (const [key, url] of Object.entries(paymentUrls)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return url;
    }
  }

  return null;
}

export function getGoogleSearchUrl(billerName: string): string {
  const query = encodeURIComponent(`${billerName} pay bill Canada`);
  return `https://www.google.com/search?q=${query}`;
}
