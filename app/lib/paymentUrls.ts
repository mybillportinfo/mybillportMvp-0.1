export interface BillerPaymentInfo {
  name: string;
  url: string;
  category: string;
}

export const paymentUrls: Record<string, string> = {
  "Hydro One": "https://www.hydroone.com/myaccount",
  "Toronto Hydro": "https://www.torontohydro.com/myaccount",
  "Hydro Ottawa": "https://hydroottawa.com/accounts-and-billing",
  "BC Hydro": "https://app.bchydro.com/accounts-billing/bill-payment.html",
  "Manitoba Hydro": "https://www.hydro.mb.ca/myaccount/",
  "SaskPower": "https://www.saskpower.com/accounts-and-services/pay-your-bill",
  "NB Power": "https://www.nbpower.com/en/accounts-billing/",
  "New Brunswick Power": "https://www.nbpower.com/en/accounts-billing/",
  "Nova Scotia Power": "https://www.nspower.ca/my-account",
  "EPCOR": "https://www.epcor.com/accounts",
  "ENMAX": "https://myaccount.enmax.com/",
  "Alectra": "https://www.alectrautilities.com/pay-your-bill",
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

  "Enbridge Gas": "https://www.enbridgegas.com/my-account",
  "Enbridge": "https://www.enbridgegas.com/my-account",
  "FortisBC": "https://www.fortisbc.com/accounts-billing",
  "Énergir": "https://www.energir.com/en/my-account/",
  "Energir": "https://www.energir.com/en/my-account/",
  "ATCO Gas": "https://www.atco.com/en-ca/my-account.html",
  "ATCO": "https://www.atco.com/en-ca/my-account.html",

  "City of Toronto Water": "https://www.toronto.ca/services-payments/property-taxes-utilities/utility-bill/pay-your-utility-bill/",
  "City of Vancouver Utilities": "https://vancouver.ca/home-property-development/pay-your-bill.aspx",
  "Region of Peel Water": "https://www.peelregion.ca/finance/",
  "York Region Water": "https://www.york.ca/support/property-taxes-water-billing",

  "Rogers": "https://www.rogers.com/myrogers/pay-bill",
  "Bell": "https://www.bell.ca/MyBell_Login",
  "Bell Canada": "https://www.bell.ca/MyBell_Login",
  "Telus": "https://www.telus.com/en/my-account",
  "TELUS": "https://www.telus.com/en/my-account",
  "Fido": "https://www.fido.ca/myaccount/",
  "Freedom Mobile": "https://www.freedommobile.ca/en-CA/my-account",
  "Koodo": "https://www.koodomobile.com/en/my-account",
  "Virgin Plus": "https://www.virginplus.ca/en/myaccount/",
  "Shaw": "https://www.shaw.ca/my-shaw/overview",
  "Cogeco": "https://www.cogeco.ca/en/my-account",
  "Eastlink": "https://www.eastlink.ca/myeastlink",
  "TekSavvy": "https://myaccount.teksavvy.com/",
  "Videotron": "https://www.videotron.com/en/my-account",
  "Xplornet": "https://myaccount.xplornet.com/",
  "SaskTel": "https://www.sasktel.com/personal/my-account",
  "MTS": "https://www.bell.ca/MyBell_Login",
  "Public Mobile": "https://www.publicmobile.ca/en/on/my-account",
  "Chatr": "https://www.chatrwireless.com/my-account",
  "Lucky Mobile": "https://www.luckymobile.ca/my-account",
  "Starlink": "https://www.starlink.com/account",

  "City of Toronto": "https://www.toronto.ca/services-payments/property-taxes-utilities/",
  "City of Toronto Property Tax": "https://www.toronto.ca/services-payments/property-taxes-utilities/",
  "Canada Revenue Agency": "https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-individuals/account-individuals.html",
  "CRA": "https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-individuals/account-individuals.html",
  "NSLSC Student Loans": "https://www.csnpe-nslsc.canada.ca/en/home",
  "407 ETR": "https://www.407etr.com/en/account/account-access.html",
  "City of Ottawa": "https://ottawa.ca/en/living-ottawa/taxes",
  "City of Mississauga": "https://www.mississauga.ca/services-and-programs/tax-and-utility-payments/",
  "City of Brampton": "https://www.brampton.ca/EN/residents/Taxes-Assessment/Pages/welcome.aspx",
  "City of Hamilton": "https://www.hamilton.ca/home-neighbourhood/property-taxes",
  "City of Calgary": "https://www.calgary.ca/property-owners/taxes.html",
  "City of Edmonton": "https://www.edmonton.ca/programs_services/property-tax",
  "City of Vancouver": "https://vancouver.ca/home-property-development/pay-your-bill.aspx",
  "City of Winnipeg": "https://www.winnipeg.ca/assessment/PaymentOptions/default.stm",

  "TD Insurance": "https://myinsurance.td.com/",
  "Intact Insurance": "https://www.intact.ca/en/personal-insurance/my-account.html",
  "Intact": "https://www.intact.ca/en/personal-insurance/my-account.html",
  "Aviva": "https://www.avivacanada.com/my-account",
  "Aviva Canada": "https://www.avivacanada.com/my-account",
  "Desjardins Insurance": "https://accesdesjardins.desjardins.com/",
  "Co-operators": "https://www.cooperators.ca/en/My-Account.aspx",
  "Wawanesa": "https://www.wawanesa.com/canada/my-policy.html",
  "RBC Insurance": "https://www.rbcinsurance.com/my-account",
  "Manulife": "https://my.manulife.ca/",
  "Sun Life": "https://mysunlife.ca/",
  "Canada Life": "https://my.canadalife.com/",
  "Great-West Life": "https://my.canadalife.com/",
  "Industrial Alliance": "https://ia.ca/individuals/my-account",
  "iA Financial": "https://ia.ca/individuals/my-account",
  "Sonnet": "https://www.sonnet.ca/signin",
  "Economical Insurance": "https://www.intact.ca/en/personal-insurance/my-account.html",

  "RBC": "https://www.rbcroyalbank.com/onlinebanking/",
  "TD": "https://www.td.com/ca/en/personal-banking/",
  "TD Canada Trust": "https://www.td.com/ca/en/personal-banking/",
  "Scotiabank": "https://www.scotiabank.com/ca/en/personal-banking.html",
  "BMO": "https://www.bmo.com/main/personal/",
  "CIBC": "https://www.cibc.com/en/personal-banking.html",
  "National Bank": "https://www.nbc.ca/personal.html",
  "Desjardins": "https://accesdesjardins.desjardins.com/",
  "HSBC Canada": "https://www.hsbc.ca/",
  "Tangerine": "https://www.tangerine.ca/en/personal/",
  "Simplii Financial": "https://www.simplii.com/en/home.html",
  "Canadian Tire Financial": "https://www.ctfs.com/",
  "Capital One Canada": "https://www.capitalone.ca/",
  "MBNA": "https://www.mbna.ca/",
  "PC Financial": "https://www.pcfinancial.ca/",

  "Netflix": "https://www.netflix.com/youraccount",
  "Spotify": "https://www.spotify.com/account/",
  "Amazon Prime": "https://www.amazon.ca/gp/primecentral",
  "Disney+": "https://www.disneyplus.com/account",
  "Apple": "https://support.apple.com/billing",
  "Google One": "https://one.google.com/",
  "Microsoft 365": "https://account.microsoft.com/services",
  "Adobe": "https://account.adobe.com/plans",
  "YouTube Premium": "https://www.youtube.com/paid_memberships",
  "Crave": "https://www.crave.ca/account",

  "CAA": "https://www.caa.ca/membership/",
  "GO Transit": "https://www.gotransit.com/en/presto",
  "PRESTO": "https://www.prestocard.ca/en/",
  "TransLink": "https://www.compasscard.ca/",
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
