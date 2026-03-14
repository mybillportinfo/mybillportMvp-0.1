'use client';

import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "./firebase";

function safeLogEvent(eventName: string, params?: Record<string, any>) {
  try {
    const analytics = getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch {
    // Analytics not available
  }
}

export function trackBillCreated(method: 'manual' | 'scan' | 'suggested', category?: string) {
  safeLogEvent('bill_created', {
    method,
    category: category || 'unknown',
    timestamp: Date.now(),
  });
}

export function trackBillPaid(onTime: boolean, amount: number, method: string) {
  safeLogEvent('bill_paid', {
    on_time: onTime,
    amount,
    payment_method: method,
    timestamp: Date.now(),
  });
}

export function trackBillScanAttempt(success: boolean, fileType: string, errorType?: string) {
  safeLogEvent('bill_scan_attempt', {
    success,
    file_type: fileType,
    error_type: errorType || 'none',
    timestamp: Date.now(),
  });
}

export function trackUserLogin(method: 'email' | 'google') {
  safeLogEvent('user_login', {
    method,
    timestamp: Date.now(),
  });
}

export function trackUserSignup(method: 'email' | 'google') {
  safeLogEvent('user_signup', {
    method,
    timestamp: Date.now(),
  });
}

export function trackFeatureUsed(feature: string, details?: Record<string, any>) {
  safeLogEvent('feature_used', {
    feature,
    ...details,
    timestamp: Date.now(),
  });
}

export function trackBillDeleted() {
  safeLogEvent('bill_deleted', { timestamp: Date.now() });
}

export function trackBillEdited() {
  safeLogEvent('bill_edited', { timestamp: Date.now() });
}

export function trackPaymentRedirect(billerName: string, found: boolean) {
  safeLogEvent('payment_redirect', {
    biller: billerName,
    url_found: found,
    timestamp: Date.now(),
  });
}

export function trackFeedbackSubmitted(category: string) {
  safeLogEvent('feedback_submitted', {
    category,
    timestamp: Date.now(),
  });
}
