'use client';

import { useEffect, useRef, useCallback } from 'react';

const V2_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY || '6Le8B4IsAAAAAPPjIrCIA1396bULHve3ZLImPNT0';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaV2Ready: () => void;
  }
}

interface Props {
  onVerify: (token: string) => void;
  onExpire: () => void;
}

export function RecaptchaCheckbox({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || widgetIdRef.current !== null) return;
    if (typeof window === 'undefined' || !window.grecaptcha?.render) return;
    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: V2_SITE_KEY,
        theme: 'dark',
        callback: onVerify,
        'expired-callback': onExpire,
      });
    } catch (e) {
      console.warn('[recaptcha-v2] render failed:', e);
    }
  }, [onVerify, onExpire]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.grecaptcha?.render) {
      renderWidget();
    } else {
      const prev = window.onRecaptchaV2Ready;
      window.onRecaptchaV2Ready = () => {
        prev?.();
        renderWidget();
      };
    }
  }, [renderWidget]);

  return (
    <div className="flex justify-center py-1">
      <div ref={containerRef} />
    </div>
  );
}
