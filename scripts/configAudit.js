#!/usr/bin/env node
// @ts-check

/**
 * Configuration Audit Script for MyBillPort
 * Checks all required environment variables and provides actionable feedback
 */

const requiredSecrets = {
  // Firebase Configuration
  'VITE_FIREBASE_API_KEY': {
    description: 'Firebase Web API Key',
    required: true,
    action: 'Get from Firebase Console > Project Settings > General > Web apps'
  },
  'VITE_FIREBASE_PROJECT_ID': {
    description: 'Firebase Project ID',
    required: true,
    action: 'Get from Firebase Console > Project Settings > General'
  },
  'VITE_FIREBASE_APP_ID': {
    description: 'Firebase App ID',
    required: true,
    action: 'Get from Firebase Console > Project Settings > General > Web apps'
  },
  'FIREBASE_SERVICE_ACCOUNT_KEY': {
    description: 'Firebase Admin Service Account (JSON single line)',
    required: true,
    action: 'Generate from Firebase Console > Project Settings > Service accounts > Generate new private key'
  },
  
  // Plaid Configuration
  'PLAID_CLIENT_ID': {
    description: 'Plaid Client ID',
    required: true,
    action: 'Get from Plaid Dashboard > Keys'
  },
  'PLAID_SECRET': {
    description: 'Plaid Secret Key (sandbox)',
    required: true,
    action: 'Get from Plaid Dashboard > Keys (use sandbox key)'
  },
  'PLAID_ENV': {
    description: 'Plaid Environment',
    required: true,
    defaultValue: 'sandbox',
    action: 'Set to "sandbox" for testing, "production" for live'
  },
  
  // Stripe Configuration
  'STRIPE_SECRET_KEY': {
    description: 'Stripe Secret Key',
    required: true,
    action: 'Get from Stripe Dashboard > Developers > API Keys (use test key)'
  },
  'STRIPE_WEBHOOK_SECRET': {
    description: 'Stripe Webhook Secret',
    required: false,
    action: 'Generate from Stripe Dashboard > Developers > Webhooks after creating endpoint'
  },
  
  // Email Configuration
  'MAILERSEND_API_KEY': {
    description: 'MailerSend API Key',
    required: false,
    alternatives: ['SENDGRID_API_KEY'],
    action: 'Get from MailerSend Dashboard > API Tokens'
  },
  'FROM_EMAIL': {
    description: 'From Email Address',
    required: true,
    action: 'Set to verified sender email (e.g. noreply@mybillport.com)'
  },
  'FROM_NAME': {
    description: 'From Name',
    required: true,
    defaultValue: 'MyBillPort',
    action: 'Set to "MyBillPort" or your preferred sender name'
  },
  'TEST_EMAIL': {
    description: 'Test Email Address',
    required: true,
    action: 'Set to your email for testing notifications'
  },
  
  // App Configuration
  'PUBLIC_APP_URL': {
    description: 'Public App URL',
    required: true,
    defaultValue: 'https://mybillport.com',
    action: 'Set to your deployment URL'
  }
};

function checkSecret(key, config) {
  const value = process.env[key];
  const exists = value && value.length > 0;
  
  return {
    key,
    exists,
    value: exists ? (key.includes('SECRET') || key.includes('KEY') ? '[REDACTED]' : value) : null,
    config,
    status: exists ? '✅' : (config.required ? '❌' : '⚠️'),
    message: exists 
      ? `${config.description}: OK`
      : `${config.description}: ${config.required ? 'REQUIRED' : 'OPTIONAL'} - ${config.action}`
  };
}

export function auditConfiguration() {
  console.log('🔍 MyBillPort Configuration Audit\n');
  
  const results = {};
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check each secret
  Object.entries(requiredSecrets).forEach(([key, config]) => {
    const result = checkSecret(key, config);
    results[key] = result;
    
    console.log(`${result.status} ${result.message}`);
    
    if (!result.exists && config.required) {
      hasErrors = true;
    } else if (!result.exists && !config.required) {
      hasWarnings = true;
    }
  });
  
  // Summary
  console.log('\n📊 Summary:');
  const totalSecrets = Object.keys(requiredSecrets).length;
  const presentSecrets = Object.values(results).filter(r => r.exists).length;
  const requiredSecrets_ = Object.values(requiredSecrets).filter(s => s.required).length;
  const presentRequired = Object.values(results).filter(r => r.exists && r.config.required).length;
  
  console.log(`Total secrets: ${presentSecrets}/${totalSecrets}`);
  console.log(`Required secrets: ${presentRequired}/${requiredSecrets_}`);
  
  if (hasErrors) {
    console.log('\n❌ Configuration incomplete - missing required secrets');
    console.log('Please add the missing environment variables to proceed.');
  } else if (hasWarnings) {
    console.log('\n⚠️ Configuration mostly complete - some optional secrets missing');
    console.log('App will work but some features may be limited.');
  } else {
    console.log('\n✅ Configuration complete - all secrets present!');
  }
  
  return {
    hasErrors,
    hasWarnings,
    results,
    summary: {
      totalSecrets,
      presentSecrets,
      requiredSecrets: requiredSecrets_,
      presentRequired
    }
  };
}

// Export for use in routes
export { auditConfiguration, requiredSecrets };

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  auditConfiguration();
}