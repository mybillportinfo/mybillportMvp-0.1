'use client';

import { useEffect, useRef, useCallback } from 'react';

const V2_SITE_KEY = '6Le8B4IsAAAAAPPjIrCIA1396bULHve3ZLImPNT0';
const SCRIPT_ID = 'recaptcha-v2-api';
const CALLBACK_NAME = 'onRecaptchaV2Ready';

declare global {
  interface Window {
    onRecaptchaV2Ready?: () => void;
    grecaptcha: any;
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

  const renderWidget = useCallback(() => {
    const w = window as any;
    if (!containerRef.current) return;
    if (widgetIdRef.current !== null) return;
    if (!w.grecaptcha?.render) return;

    try {
      widgetIdRef.current = w.grecaptcha.render(containerRef.current, {
        sitekey: V2_SITE_KEY,
        theme: 'dark',
        callback: onVerify,
        'expired-callback': onExpire,
      });
      onReady?.();
    } catch (e) {
      console.warn('[recaptcha] render error:', e);
    }
  }, [onVerify, onExpire, onReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as any;

    // Script already loaded (e.g. navigating back to page)
    if (w.grecaptcha?.render) {
      renderWidget();
      return;
    }

    // Register callback BEFORE injecting the script
    window[CALLBACK_NAME] = () => {
      renderWidget();
    };

    // Only inject once
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?onload=${CALLBACK_NAME}&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [renderWidget]);

  return (
    <div className="flex justify-center py-1">
      <div ref={containerRef} />
    </div>
  );
}
