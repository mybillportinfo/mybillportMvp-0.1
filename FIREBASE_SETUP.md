# Firebase Setup Instructions

If you're getting `Firebase: Error (auth/configuration-not-found)`, follow these steps:

## 1. Enable Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `mybillport-8e05a`
3. Click on "Authentication" in the left sidebar
4. Click "Get started" if not already enabled
5. Go to "Sign-in method" tab
6. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## 2. Verify Environment Variables

Your current environment variables should be:
- `VITE_FIREBASE_API_KEY` ✓ (exists)
- `VITE_FIREBASE_PROJECT_ID` ✓ (mybillport-8e05a)
- `VITE_FIREBASE_APP_ID` ✓ (exists)

## 3. Check Firebase Project Settings

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Make sure the web app is registered
4. Copy the config values to match your secrets

## 4. Test Authentication

After enabling Email/Password authentication:
1. Visit `/signup`
2. Create a test account
3. Check Firebase Console > Authentication > Users to see if user was created

## Common Issues

- **auth/configuration-not-found**: Authentication not enabled in Firebase Console
- **auth/project-not-found**: Wrong project ID in environment variables
- **auth/api-key-not-valid**: Invalid API key in environment variables

## Quick Fix

If issues persist, try:
1. Disable authentication in Firebase Console
2. Re-enable Email/Password authentication
3. Restart your development server