'use client';

const SITE_KEY = '6Lfby0ksAAAAAPcrsjoe3qZjjD03IxkvRW8pZanp';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

export function useRecaptcha() {
  const executeRecaptcha = (action: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.grecaptcha?.enterprise) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(SITE_KEY, { action });
          resolve(token);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  return { executeRecaptcha };
}
