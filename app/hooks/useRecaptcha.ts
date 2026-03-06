'use client';

const SITE_KEY = '6Lfby0ksAAAAAPcrsjoe3qZjjD03IxkvRW8pZanp';

export function useRecaptcha() {
  const executeRecaptcha = (action: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const w = window as any;
      if (typeof window === 'undefined' || !w.grecaptcha?.enterprise) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }
      w.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await w.grecaptcha.enterprise.execute(SITE_KEY, { action });
          resolve(token);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  return { executeRecaptcha };
}
