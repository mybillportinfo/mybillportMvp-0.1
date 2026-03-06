'use client';

import { useEffect, useRef, useCallback } from 'react';

const V2_SITE_KEY = '6Le8B4IsAAAAAPPjIrCIA1396bULHve3ZLImPNT0';
const SCRIPT_ID = 'recaptcha-v2-script';

interface Props {
  onVerify: (token: string) => void;
  onExpire: () => void;
}

export function RecaptchaCheckbox({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const renderWidget = useCallback(() => {
    const w = window as any;
    if (!containerRef.current || widgetIdRef.current !== null) return;
    if (!w.grecaptcha?.render) return;

    try {
      widgetIdRef.current = w.grecaptcha.render(containerRef.current, {
        sitekey: V2_SITE_KEY,
        theme: 'dark',
        callback: onVerify,
        'expired-callback': onExpire,
      });
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (e) {
      console.warn('[recaptcha-v2] render error:', e);
    }
  }, [onVerify, onExpire]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startPolling = () => {
      renderWidget();
      if (widgetIdRef.current !== null) return;
      pollRef.current = setInterval(() => {
        const w = window as any;
        if (w.grecaptcha?.render) {
          renderWidget();
        }
      }, 200);
      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, 15000);
    };

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = startPolling;
      document.head.appendChild(script);
    } else {
      startPolling();
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [renderWidget]);

  return (
    <div className="flex justify-center py-1">
      <div ref={containerRef} />
    </div>
  );
}
