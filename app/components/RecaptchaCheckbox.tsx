'use client';

import { useEffect, useRef, useCallback } from 'react';

const V2_SITE_KEY = '6Le8B4IsAAAAAPPjIrCIA1396bULHve3ZLImPNT0';

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
    if (!containerRef.current) return;
    if (widgetIdRef.current !== null) return;
    const enterprise = w.grecaptcha?.enterprise;
    if (!enterprise?.render) return;

    try {
      enterprise.ready(() => {
        if (!containerRef.current || widgetIdRef.current !== null) return;
        try {
          widgetIdRef.current = enterprise.render(containerRef.current, {
            sitekey: V2_SITE_KEY,
            theme: 'dark',
            callback: onVerify,
            'expired-callback': onExpire,
          });
        } catch (e) {
          console.warn('[recaptcha] render failed:', e);
        }
      });
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (e) {
      console.warn('[recaptcha] ready failed:', e);
    }
  }, [onVerify, onExpire]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    renderWidget();

    if (widgetIdRef.current === null) {
      pollRef.current = setInterval(() => {
        const w = window as any;
        if (w.grecaptcha?.enterprise?.render) {
          renderWidget();
        }
      }, 250);

      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, 15000);
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
