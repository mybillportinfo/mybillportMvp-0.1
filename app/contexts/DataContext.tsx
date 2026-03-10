'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchBills, fetchNotifications, getUserProfile, getUserSubscription,
  isPremiumUser, getPendingBills, getUserPreferences,
  checkAndCreateDueDateNotifications, sortBills, createReferralCode,
  Bill, AppNotification, UserProfile, UserPreferences, UserSubscription,
} from '../lib/firebase';

interface DataState {
  bills: Bill[];
  notifications: AppNotification[];
  profile: UserProfile | null;
  isPremium: boolean;
  subscription: UserSubscription;
  pendingBillCount: number;
  preferences: UserPreferences;
  emailAlias: string | null;
  billsLoading: boolean;
  profileLoading: boolean;
  initialized: boolean;
}

interface DataContextValue extends DataState {
  refreshBills: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAll: () => Promise<void>;
  updateBillsLocally: (updater: (prev: Bill[]) => Bill[]) => void;
}

const DEFAULT_PREFS: UserPreferences = { inAppReminders: true, notifyDays: [7, 2, 1, 0] };
const DEFAULT_SUB: UserSubscription = { status: 'free' };

const DataContext = createContext<DataContextValue | null>(null);

async function fetchEmailAliasFromAPI(token: string): Promise<string | null> {
  try {
    const res = await fetch('/api/email-alias', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.aliasTag || null;
  } catch {
    return null;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const fetchedRef = useRef<string | null>(null);
  const userRef = useRef(user);

  useEffect(() => { userRef.current = user; }, [user]);

  const [state, setState] = useState<DataState>({
    bills: [],
    notifications: [],
    profile: null,
    isPremium: false,
    subscription: DEFAULT_SUB,
    pendingBillCount: 0,
    preferences: DEFAULT_PREFS,
    emailAlias: null,
    billsLoading: true,
    profileLoading: true,
    initialized: false,
  });

  const fetchBillsData = useCallback(async (uid: string) => {
    const raw = await fetchBills(uid);
    const sorted = sortBills(raw);
    checkAndCreateDueDateNotifications(uid, sorted).catch(() => {});
    return sorted;
  }, []);

  const loadAll = useCallback(async (uid: string) => {
    setState(prev => ({ ...prev, billsLoading: true, profileLoading: true }));

    const token = await userRef.current?.getIdToken().catch(() => '') ?? '';

    const [bills, notifications, profile, sub, pendingArr, prefs, alias] = await Promise.allSettled([
      fetchBillsData(uid),
      fetchNotifications(uid).catch(() => []),
      getUserProfile(uid),
      getUserSubscription(uid),
      getPendingBills(uid).catch(() => []),
      getUserPreferences(uid).catch(() => DEFAULT_PREFS),
      fetchEmailAliasFromAPI(token),
    ]);

    const resolvedBills   = bills.status        === 'fulfilled' ? bills.value        : [];
    const resolvedNotifs  = notifications.status === 'fulfilled' ? notifications.value : [];
    const resolvedProfile = profile.status       === 'fulfilled' ? profile.value       : null;
    const resolvedSub     = sub.status           === 'fulfilled' ? sub.value           : DEFAULT_SUB;
    const resolvedPending = pendingArr.status    === 'fulfilled' ? pendingArr.value    : [];
    const resolvedPrefs   = prefs.status         === 'fulfilled' ? prefs.value         : DEFAULT_PREFS;
    const resolvedAlias   = alias.status         === 'fulfilled' ? alias.value         : null;

    setState({
      bills: resolvedBills,
      notifications: resolvedNotifs,
      profile: resolvedProfile,
      isPremium: isPremiumUser(resolvedSub),
      subscription: resolvedSub,
      pendingBillCount: resolvedPending.length,
      preferences: resolvedPrefs,
      emailAlias: resolvedAlias,
      billsLoading: false,
      profileLoading: false,
      initialized: true,
    });

    if (!resolvedProfile?.referralCode) {
      createReferralCode(uid)
        .then(code => setState(prev => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, referralCode: code } : prev.profile,
        })))
        .catch(() => {});
    }
  }, [fetchBillsData]);

  useEffect(() => {
    if (!user) {
      fetchedRef.current = null;
      setState(prev => ({ ...prev, initialized: false, bills: [], notifications: [], profile: null, isPremium: false, subscription: DEFAULT_SUB, pendingBillCount: 0, emailAlias: null }));
      return;
    }
    if (fetchedRef.current === user.uid) return;
    fetchedRef.current = user.uid;
    loadAll(user.uid);
  }, [user, loadAll]);

  const refreshBills = useCallback(async () => {
    if (!user) return;
    setState(prev => ({ ...prev, billsLoading: true }));
    const bills = await fetchBillsData(user.uid).catch(() => state.bills);
    setState(prev => ({ ...prev, bills, billsLoading: false }));
  }, [user, fetchBillsData, state.bills]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    const notifications = await fetchNotifications(user.uid).catch(() => state.notifications);
    setState(prev => ({ ...prev, notifications }));
  }, [user, state.notifications]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setState(prev => ({ ...prev, profileLoading: true }));
    const [profile, sub] = await Promise.allSettled([
      getUserProfile(user.uid),
      getUserSubscription(user.uid),
    ]);
    setState(prev => ({
      ...prev,
      profileLoading: false,
      profile: profile.status === 'fulfilled' ? profile.value : prev.profile,
      subscription: sub.status === 'fulfilled' ? sub.value : prev.subscription,
      isPremium: isPremiumUser(sub.status === 'fulfilled' ? sub.value : prev.subscription),
    }));
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    fetchedRef.current = null;
    await loadAll(user.uid);
    fetchedRef.current = user.uid;
  }, [user, loadAll]);

  const updateBillsLocally = useCallback((updater: (prev: Bill[]) => Bill[]) => {
    setState(prev => ({ ...prev, bills: sortBills(updater(prev.bills)) }));
  }, []);

  return (
    <DataContext.Provider value={{ ...state, refreshBills, refreshNotifications, refreshProfile, refreshAll, updateBillsLocally }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
