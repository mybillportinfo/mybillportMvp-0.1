import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

// Determine Plaid environment - normalize the value
const plaidEnvRaw = (process.env.PLAID_ENV || '').toLowerCase().trim();
const plaidEnv = plaidEnvRaw === 'sandbox' || plaidEnvRaw === 'production' || plaidEnvRaw === 'development' 
  ? plaidEnvRaw 
  : 'sandbox'; // Default to sandbox if invalid value

// Plaid configuration
const configuration = new Configuration({
  basePath: plaidEnv === 'sandbox' 
    ? PlaidEnvironments.sandbox 
    : plaidEnv === 'production' 
    ? PlaidEnvironments.production 
    : PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

console.log('Plaid environment (raw):', process.env.PLAID_ENV);
console.log('Plaid environment (used):', plaidEnv);
console.log('Plaid client ID configured:', !!process.env.PLAID_CLIENT_ID);
console.log('Plaid secret configured:', !!process.env.PLAID_SECRET);