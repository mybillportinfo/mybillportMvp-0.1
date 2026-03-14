'use client';

import { useState, useCallback } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useAuth } from '../contexts/AuthContext';

export function useBiometricPayment() {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError('Not signed in');
      return false;
    }

    setVerifying(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      const challengeRes = await fetch('/api/webauthn/authenticate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!challengeRes.ok) {
        const err = await challengeRes.json();
        throw new Error(err.error || 'Failed to get challenge');
      }

      const { options } = await challengeRes.json();
      const authResponse = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch('/api/webauthn/verify-authentication', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: authResponse }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Verification failed');
      }

      const result = await verifyRes.json();
      return result.verified === true;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('Biometric verification was cancelled');
      } else {
        setError(err?.message || 'Biometric verification failed');
      }
      return false;
    } finally {
      setVerifying(false);
    }
  }, [user]);

  return { authenticate, verifying, error, clearError: () => setError(null) };
}
