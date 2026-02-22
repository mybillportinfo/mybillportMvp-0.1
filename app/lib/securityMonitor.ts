'use client';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp, getApps } from 'firebase/app';

interface SecurityReport {
  activityType: string;
  details: string;
  confidence: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

const billCreationTimestamps: number[] = [];
const scanFailureTimestamps: number[] = [];

const BILL_CREATION_THRESHOLD = 10;
const BILL_CREATION_WINDOW_MS = 60 * 60 * 1000;
const SCAN_FAILURE_THRESHOLD = 5;
const SCAN_FAILURE_WINDOW_MS = 10 * 60 * 1000;

function cleanOldTimestamps(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter(t => t > cutoff);
}

async function reportToCloud(report: SecurityReport) {
  try {
    if (getApps().length === 0) return;
    const app = getApp();
    const functions = getFunctions(app);
    const reportFn = httpsCallable(functions, 'reportSuspiciousActivity');
    await reportFn(report);
  } catch {
    // Silently fail - don't block user flow for security reporting
  }
}

export function trackBillCreation() {
  billCreationTimestamps.push(Date.now());
  const recent = cleanOldTimestamps(billCreationTimestamps, BILL_CREATION_WINDOW_MS);
  billCreationTimestamps.length = 0;
  billCreationTimestamps.push(...recent);

  if (recent.length >= BILL_CREATION_THRESHOLD) {
    const confidence = recent.length >= BILL_CREATION_THRESHOLD * 2 ? 'high' : 'medium';
    reportToCloud({
      activityType: 'rapid_bill_creation',
      details: `${recent.length} bills created in the last hour`,
      confidence,
      metadata: { count: recent.length, windowMs: BILL_CREATION_WINDOW_MS },
    });
  }
}

export function trackFailedScan(errorType: string) {
  scanFailureTimestamps.push(Date.now());
  const recent = cleanOldTimestamps(scanFailureTimestamps, SCAN_FAILURE_WINDOW_MS);
  scanFailureTimestamps.length = 0;
  scanFailureTimestamps.push(...recent);

  if (recent.length >= SCAN_FAILURE_THRESHOLD) {
    const confidence = recent.length >= SCAN_FAILURE_THRESHOLD * 2 ? 'high' : 'medium';
    reportToCloud({
      activityType: 'excessive_scan_failures',
      details: `${recent.length} scan failures in 10 minutes (${errorType})`,
      confidence,
      metadata: { count: recent.length, errorType, windowMs: SCAN_FAILURE_WINDOW_MS },
    });
  }
}

export function trackSuspiciousPaymentPattern(billId: string, details: string) {
  reportToCloud({
    activityType: 'suspicious_payment',
    details,
    confidence: 'medium',
    metadata: { billId },
  });
}
