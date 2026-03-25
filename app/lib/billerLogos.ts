const BILLER_DOMAIN_MAP: Record<string, string> = {
  rogers: 'rogers.com',
  'rogers communications': 'rogers.com',
  bell: 'bell.ca',
  'bell canada': 'bell.ca',
  telus: 'telus.com',
  shaw: 'shaw.ca',
  'shaw communications': 'shaw.ca',
  fido: 'fido.ca',
  koodo: 'koodomobile.com',
  'koodo mobile': 'koodomobile.com',
  'public mobile': 'publicmobile.ca',
  freedom: 'freedommobile.ca',
  'freedom mobile': 'freedommobile.ca',
  videotron: 'videotron.com',
  'virgin plus': 'virginplus.ca',
  'virgin mobile': 'virginplus.ca',
  chatr: 'chatr.ca',
  lucky: 'luckymobile.ca',
  'lucky mobile': 'luckymobile.ca',
  enbridge: 'enbridge.com',
  'enbridge gas': 'enbridge.com',
  hydro: 'hydroone.com',
  'hydro one': 'hydroone.com',
  'toronto hydro': 'torontohydro.com',
  'bc hydro': 'bchydro.com',
  'hydro-québec': 'hydroquebec.com',
  'hydro quebec': 'hydroquebec.com',
  epcor: 'epcor.com',
  atco: 'atco.com',
  'fortis bc': 'fortisbc.com',
  fortisbc: 'fortisbc.com',
  'union gas': 'uniongas.com',
  enbridgegas: 'enbridge.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  amazon: 'amazon.ca',
  'amazon prime': 'amazon.ca',
  'prime video': 'amazon.ca',
  'disney+': 'disneyplus.com',
  'disney plus': 'disneyplus.com',
  crave: 'crave.ca',
  'apple one': 'apple.com',
  apple: 'apple.com',
  'youtube premium': 'youtube.com',
  youtube: 'youtube.com',
  'microsoft 365': 'microsoft.com',
  microsoft: 'microsoft.com',
  dropbox: 'dropbox.com',
  'google one': 'one.google.com',
  google: 'google.com',
  'td bank': 'td.com',
  'td': 'td.com',
  rbc: 'rbc.com',
  'royal bank': 'rbc.com',
  bmo: 'bmo.com',
  scotiabank: 'scotiabank.com',
  cibc: 'cibc.com',
  'national bank': 'nbc.ca',
  tangerine: 'tangerine.ca',
  simplii: 'simplii.com',
  'intact insurance': 'intact.net',
  intact: 'intact.net',
  sonnet: 'sonnet.ca',
  'td insurance': 'tdinsurance.com',
  wawanesa: 'wawanesa.com',
  economical: 'economical.com',
  'belairdirect': 'belairdirect.com',
  belair: 'belairdirect.com',
  aviva: 'avivacanada.com',
  'la capitale': 'lacapitale.com',
  'allstate': 'allstate.ca',
};

export function getBillerLogoUrl(billerName: string): string | null {
  const key = billerName.toLowerCase().trim();
  const domain = BILLER_DOMAIN_MAP[key];
  if (domain) return `https://logo.clearbit.com/${domain}`;
  const partial = Object.keys(BILLER_DOMAIN_MAP).find(k => key.includes(k) || k.includes(key));
  if (partial) return `https://logo.clearbit.com/${BILLER_DOMAIN_MAP[partial]}`;
  return null;
}

export function getBillerInitials(billerName: string): string {
  return billerName
    .split(' ')
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}
