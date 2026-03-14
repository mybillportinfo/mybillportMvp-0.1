'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Check support synchronously — no state delay
function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export type PushPermission = 'default' | 'granted' | 'denied';

export function usePushNotifications(userId: string | null) {
  const [permission, setPermission] = useState<PushPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = isPushSupported();
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  // Read permission and subscription state on mount
  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission as PushPermission);

    // Register SW if not already registered
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});

    // Check if already subscribed
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setIsSubscribed(!!sub))
      .catch(() => {});
  }, [supported]);

  // Re-check when userId changes
  useEffect(() => {
    if (!supported || !userId) return;
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setIsSubscribed(!!sub))
      .catch(() => {});
  }, [supported, userId]);

  // Stale subscription fix: if permission is already granted and we have a subscription,
  // upsert it to Firestore. This handles PWA reinstall / browser data clear scenarios
  // where the browser generates a new push endpoint that Firestore doesn't know about yet.
  useEffect(() => {
    if (!supported || !userId || !VAPID_PUBLIC_KEY) return;
    if (Notification.permission !== 'granted') return;

    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => {
        if (!sub) return;
        fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, subscription: sub }),
        }).catch(() => {});
        setIsSubscribed(true);
      })
      .catch(() => {});
  }, [supported, userId]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setError(null);
    const uid = userIdRef.current;

    if (!isPushSupported()) {
      setError('Push notifications are not supported on this device or browser.');
      return false;
    }
    if (!uid) {
      setError('Please sign in to enable notifications.');
      return false;
    }
    if (!VAPID_PUBLIC_KEY) {
      setError('Push notifications are not configured yet.');
      return false;
    }

    setIsLoading(true);
    try {
      // Register SW first to ensure it's ready
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const reg = await navigator.serviceWorker.ready;

      // Request browser permission
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);

      if (perm !== 'granted') {
        setError(perm === 'denied'
          ? 'Notifications blocked. Go to browser settings to allow them.'
          : 'Permission was not granted.');
        return false;
      }

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, subscription }),
      });

      if (!res.ok) throw new Error('Failed to save subscription');

      setIsSubscribed(true);
      return true;
    } catch (err: any) {
      console.error('[push] subscribe failed:', err);
      setError('Could not enable notifications. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setError(null);
    const uid = userIdRef.current;
    if (!isPushSupported()) return;

    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      if (uid) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid }),
        });
      }
      setIsSubscribed(false);
    } catch (err: any) {
      console.error('[push] unsubscribe failed:', err);
      setError('Could not disable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { supported, permission, isSubscribed, isLoading, error, subscribe, unsubscribe };
}
