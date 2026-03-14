'use client';

import { useEffect, useRef, useState } from 'react';

const V2_SITE_KEY = '6Le8B4IsAAAAAPPjIrCIA1396bULHve3ZLImPNT0';
const SCRIPT_ID = 'recaptcha-v2-api';

declare global {
  interface Window {
    grecaptcha: any;
    __recaptchaCallbacks?: (() => void)[];
  }
}

interface Props {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onReady?: () => void;
}

export function RecaptchaCheckbox({ onVerify, onExpire, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onReady });
  const [scriptLoaded, setScriptLoaded] = useState(false);

  callbacksRef.current = { onVerify, onExpire, onReady };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.grecaptcha?.render) {
      setScriptLoaded(true);
      return;
    }

    if (!window.__recaptchaCallbacks) {
      window.__recaptchaCallbacks = [];
    }
    window.__recaptchaCallbacks.push(() => setScriptLoaded(true));

    if (!document.getElementById(SCRIPT_ID)) {
      (window as any).onRecaptchaV2Load = () => {
        const cbs = window.__recaptchaCallbacks || [];
        cbs.forEach(cb => cb());
        window.__recaptchaCallbacks = [];
      };

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaV2Load&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!scriptLoaded) return;
    if (!containerRef.current) return;
    if (widgetIdRef.current !== null) return;

    const w = window as any;
    if (!w.grecaptcha?.render) return;

    const poll = setInterval(() => {
      if (!containerRef.current) return;
      try {
        widgetIdRef.current = w.grecaptcha.render(containerRef.current, {
          sitekey: V2_SITE_KEY,
          theme: 'dark',
          callback: (token: string) => callbacksRef.current.onVerify(token),
          'expired-callback': () => callbacksRef.current.onExpire(),
        });
        callbacksRef.current.onReady?.();
        clearInterval(poll);
      } catch {
        clearInterval(poll);
      }
    }, 100);

    return () => clearInterval(poll);
  }, [scriptLoaded]);

  return (
    <div className="flex justify-center py-1">
      <div ref={containerRef} />
    </div>
  );
}
