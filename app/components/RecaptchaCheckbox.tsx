'use client';

import { useEffect, useRef, useCallback } from 'react';

const V2_SITE_KEY = '6Le8B4IsAAAAAPPjIrCIA1396bULHve3ZLImPNT0';

interface Props {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onReady?: () => void;
}

export function RecaptchaCheckbox({ onVerify, onExpire, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tryRender = useCallback(() => {
    const w = window as any;
    if (!containerRef.current) return false;
    if (widgetIdRef.current !== null) return true;
    if (!w.grecaptcha?.render) return false;

    try {
      widgetIdRef.current = w.grecaptcha.render(containerRef.current, {
        sitekey: V2_SITE_KEY,
        theme: 'dark',
        callback: (token: string) => {
          onVerify(token);
          onReady?.();
        },
        'expired-callback': onExpire,
      });
      onReady?.();
      return true;
    } catch {
      return false;
    }
  }, [onVerify, onExpire, onReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (tryRender()) return;

    pollRef.current = setInterval(() => {
      if (tryRender() && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 300);

    const timeout = setTimeout(() => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 12000);

    return () => {
      clearInterval(pollRef.current!);
      clearTimeout(timeout);
      pollRef.current = null;
    };
  }, [tryRender]);

  return (
    <div className="flex justify-center py-1">
      <div ref={containerRef} />
    </div>
  );
}
