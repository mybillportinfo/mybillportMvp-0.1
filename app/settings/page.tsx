'use client';

import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, CalendarDays, User, Bell, Shield, Lock, LogOut, ChevronRight, Loader2, X, Eye, EyeOff, MessageSquare, Receipt, DollarSign, Check, AlertTriangle, Camera, Trash2, Mail, Smartphone, CreditCard, Forward, Copy, CheckCheck, Sparkles, Inbox, Gift, Users, Fingerprint } from "lucide-react";
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  setUserPreferences,
  getLinkedProviders,
  saveUserProfile,
  updateUserDisplayName, updateUserProfilePhoto,
  updateUserEmail, deleteUserAccount,
  type UserProfile, type UserSubscription,
} from '../lib/firebase';

type SettingsModal = 'notifications' | 'privacy' | 'security' | 'profile' | 'referral' | null;

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const { profile: ctxProfile, subscription: ctxSub, preferences: ctxPrefs, emailAlias, refreshProfile } = useData();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<SettingsModal>(null);

  const [notifyDays, setNotifyDays] = useState<number[]>([7, 2, 1, 0]);
  const [inAppReminders, setInAppReminders] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const loadingPrefs = false;

  const subscription = ctxSub;
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const [aliasCopied, setAliasCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');

  const { supported: pushSupported, permission: pushPermission, isSubscribed: pushSubscribed, isLoading: pushLoading, error: pushError, subscribe: subscribePush, unsubscribe: unsubscribePush } = usePushNotifications(user?.uid || null);

  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Hydrate local state from context (instant — no Firebase call)
  useEffect(() => {
    if (ctxPrefs) {
      setInAppReminders(ctxPrefs.inAppReminders);
      setNotifyDays(ctxPrefs.notifyDays || [7, 2, 1, 0]);
    }
  }, [ctxPrefs]);

  useEffect(() => {
    if (ctxProfile) {
      setProfile(ctxProfile);
      setUsername(ctxProfile.username || '');
    } else if (user) {
      setUsername(user.displayName || '');
    }
    if (user) setNewEmail(user.email || '');
  }, [ctxProfile, user]);

  useEffect(() => {
    if (user) setLinkedProviders(getLinkedProviders());
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBiometricSupported(!!window.PublicKeyCredential);
    }
  }, []);

  useEffect(() => {
    if (ctxProfile && typeof ctxProfile.biometricEnabled === 'boolean') {
      setBiometricEnabled(ctxProfile.biometricEnabled);
    }
  }, [ctxProfile]);

  useEffect(() => {
    if (ctxProfile?.referralCode) {
      setReferralCode(ctxProfile.referralCode);
      return;
    }
    if (activeModal === 'referral' && user && !referralCode) {
      user.getIdToken().then(token =>
        fetch('/api/referral-code', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.code) setReferralCode(data.code); })
          .catch(() => {})
      );
    }
  }, [ctxProfile, activeModal, user]);

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    setPrefsSaved(false);
    try {
      await setUserPreferences(user.uid, { inAppReminders, notifyDays });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch {
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleNotifyDay = (day: number) => {
    setNotifyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => b - a)
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      if (username.trim()) {
        await updateUserDisplayName(username.trim());
      }
      await saveUserProfile(user.uid, {
        username: username.trim(),
        email: user.email || '',
        photoURL: profile?.photoURL ?? user.photoURL ?? null,
      });
      if (newEmail && newEmail !== user.email) {
        try {
          await updateUserEmail(newEmail);
        } catch (err: any) {
          const msg = err.message || '';
          if (msg.includes('requires-recent-login')) {
            setProfileError('For security, please sign out and sign back in before changing your email.');
          } else {
            setProfileError('Failed to update email. ' + msg);
          }
          setSavingProfile(false);
          return;
        }
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
      refreshProfile().catch(() => {});
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const resizeImage = (dataUrl: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 256;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = dataUrl;
    });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Photo must be under 5MB');
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const dataUrl = await resizeImage(raw);
      await saveUserProfile(user.uid, { photoURL: dataUrl });
      setProfile(prev => prev
        ? { ...prev, photoURL: dataUrl }
        : { userId: user.uid, username: '', email: user.email || '', photoURL: dataUrl });
    } catch (err: any) {
      setProfileError('Failed to upload photo. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateUserProfilePhoto(null);
      await saveUserProfile(user.uid, { photoURL: null });
      setProfile(prev => prev ? { ...prev, photoURL: null } : null);
    } catch {
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || !user) return;
    setDeletingAccount(true);
    try {
      await deleteUserAccount();
      router.push('/');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('requires-recent-login')) {
        setProfileError('For security, please sign out and sign back in before deleting your account.');
      } else {
        setProfileError('Failed to delete account. ' + msg);
      }
      setDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {}
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setBillingLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Failed to start checkout');
    } catch { alert('Could not connect to billing. Please try again.'); }
    finally { setBillingLoading(false); }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setBillingLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Failed to open billing portal');
    } catch { alert('Could not open billing portal. Please try again.'); }
    finally { setBillingLoading(false); }
  };

  const handleCopyAlias = () => {
    if (!emailAlias) return;
    const email = `bills+${emailAlias}@mybillport.com`;
    navigator.clipboard.writeText(email).catch(() => {});
    setAliasCopied(true);
    setTimeout(() => setAliasCopied(false), 2000);
  };

  const handleBiometricToggle = async () => {
    if (!user) return;
    setBiometricLoading(true);
    setBiometricError(null);
    try {
      const token = await user.getIdToken();
      if (biometricEnabled) {
        const res = await fetch('/api/webauthn/disable', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to disable biometric');
        setBiometricEnabled(false);
      } else {
        const { startRegistration } = await import('@simplewebauthn/browser');
        const regRes = await fetch('/api/webauthn/register', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!regRes.ok) throw new Error('Failed to start registration');
        const { options } = await regRes.json();
        const attResp = await startRegistration({ optionsJSON: options });
        const verifyRes = await fetch('/api/webauthn/verify-registration', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: attResp }),
        });
        if (!verifyRes.ok) {
          const err = await verifyRes.json();
          throw new Error(err.error || 'Verification failed');
        }
        setBiometricEnabled(true);
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setBiometricError('Biometric setup was cancelled');
      } else {
        setBiometricError(err?.message || 'Failed to toggle biometric');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const isPremium = subscription.status === 'active';

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF8A5C] animate-spin" />
      </div>
    );
  }

  const photoURL = profile?.photoURL || user.photoURL;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-6">
        <Link href="/app" className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FF8A5C] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,138,92,0.3)]">
            <div className="relative">
              <Receipt className="text-white w-6 h-6" />
              <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-[#FF8A5C]/30">
                <DollarSign className="text-[#FF8A5C] w-3 h-3" />
              </div>
            </div>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">My<span className="text-[#FF8A5C]">BillPort</span></span>
        </div>
        <p className="text-slate-400">Manage your preferences</p>
      </div>

      <div className="px-4 space-y-4">
        <button
          onClick={() => { setActiveModal('profile'); setProfileError(null); setProfileSaved(false); setShowDeleteConfirm(false); }}
          className="w-full bg-white rounded-xl overflow-hidden hover:bg-slate-50 transition-colors"
        >
          <div className="p-4 flex items-center gap-4">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-[#FF8A5C]/30" />
            ) : (
              <div className="w-14 h-14 bg-[#FF8A5C]/15 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-[#FF8A5C]" />
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="font-semibold text-slate-800">
                {username || user.displayName || 'MyBillPort User'}
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </button>

        {/* Plan & Billing */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPremium ? 'bg-amber-100' : 'bg-slate-100'}`}>
                <CreditCard className={`w-5 h-5 ${isPremium ? 'text-amber-600' : 'text-slate-500'}`} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{isPremium ? 'Premium Plan' : 'Free Plan'}</p>
                <p className="text-xs text-slate-500">
                  {isPremium
                    ? subscription.currentPeriodEnd
                      ? `Renews ${new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Active subscription'
                    : 'Up to 5 bills'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {isPremium ? '✦ Premium' : 'Free'}
            </span>
          </div>
          {!isPremium && (
            <button
              disabled
              className="w-full py-2.5 bg-gradient-to-r from-[#FF8A5C] to-[#e5753d] text-white text-sm font-semibold rounded-lg opacity-60 flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Payments coming soon
            </button>
          )}
          {isPremium && (
            <button
              disabled
              className="w-full py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg opacity-60 flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              Payments coming soon
            </button>
          )}
        </div>

        {/* Email Forwarding */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF8A5C]/10 rounded-lg flex items-center justify-center">
              <Forward className="w-5 h-5 text-[#FF8A5C]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Bill Forwarding Email</p>
              <p className="text-xs text-slate-500">Forward bills here for automatic detection</p>
            </div>
            <Link href="/pending-bills" className="text-xs text-[#FF8A5C] font-medium hover:underline flex items-center gap-1">
              <Inbox className="w-3.5 h-3.5" />
              Inbox
            </Link>
          </div>
          {emailAlias ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <span className="flex-1 text-sm text-slate-700 font-mono truncate">bills+{emailAlias}@mybillport.com</span>
                <button onClick={handleCopyAlias} className="text-[#FF8A5C] hover:text-[#e5753d] transition-colors flex-shrink-0">
                  {aliasCopied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Forward bill emails to this address or set up auto-forwarding in Gmail / Outlook. Bills will appear in your inbox for review.
              </p>
            </div>
          ) : (
            <div className="h-8 flex items-center">
              <Loader2 className="w-4 h-4 text-[#FF8A5C] animate-spin" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl overflow-hidden divide-y divide-slate-100">
          <button
            onClick={() => setActiveModal('referral')}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <Gift className="w-5 h-5 text-[#FF8A5C]" />
            <div className="flex-1 text-left">
              <span className="text-slate-800">Refer a Friend</span>
              {(ctxProfile?.referralCount ?? 0) > 0 && (
                <span className="ml-2 text-xs bg-[#FF8A5C]/15 text-[#e5753d] px-2 py-0.5 rounded-full font-medium">
                  {ctxProfile?.referralCount} referred
                </span>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveModal('notifications')}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left text-slate-800">Notifications</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveModal('privacy')}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <Shield className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left text-slate-800">Privacy</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveModal('security')}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <Lock className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left text-slate-800">Security</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="bg-white rounded-xl overflow-hidden divide-y divide-slate-100">
          <Link href="/feedback" className="block p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-[#FF8A5C]" />
            <span className="flex-1 text-slate-800">Send Feedback</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <Link href="/privacy" className="block p-4 hover:bg-slate-50 transition-colors">
            <span className="text-slate-800">Privacy Policy</span>
          </Link>
          <Link href="/terms" className="block p-4 hover:bg-slate-50 transition-colors">
            <span className="text-slate-800">Terms of Service</span>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl p-4 flex items-center gap-4 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-red-500 font-medium">Sign Out</span>
        </button>

        <p className="text-center text-slate-600 text-xs pt-2">
          MyBillPort v1.0 Production
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-4">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/calendar" className="nav-item">
            <CalendarDays className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
          </Link>
          <Link href="/add-bill" className="nav-item">
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add Bill</span>
          </Link>
          <Link href="/settings" className="nav-item nav-item-active">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>

      {activeModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onKeyDown={(e) => { if (e.key === 'Escape') setActiveModal(null); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">

            {activeModal === 'profile' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF8A5C]/15 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-[#FF8A5C]" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {photoURL ? (
                        <img src={photoURL} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-[#FF8A5C]/30" />
                      ) : (
                        <div className="w-20 h-20 bg-[#FF8A5C]/15 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-[#FF8A5C]" />
                        </div>
                      )}
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FF8A5C] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF8A5C] transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    {photoURL && (
                      <button onClick={handleRemovePhoto} className="text-sm text-red-500 hover:text-red-600">
                        Remove photo
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8A5C] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8A5C] focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Changing email requires recent sign-in</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sign-in Methods</label>
                    <div className="flex gap-2">
                      {linkedProviders.includes('password') && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Email/Password</span>
                      )}
                      {linkedProviders.includes('google.com') && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">Google</span>
                      )}
                    </div>
                  </div>

                  {profileError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {profileError}
                    </div>
                  )}

                  {profileSaved && (
                    <div className="bg-[#FF8A5C]/10 border border-[#FF8A5C]/30 text-[#e5753d] px-4 py-2 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Profile saved!
                    </div>
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? (<><Loader2 className="w-5 h-5 animate-spin" />Saving...</>) : 'Save Profile'}
                  </button>

                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-3 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-red-700">This will permanently delete your account and all your data. Type <strong>DELETE</strong> to confirm.</p>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder='Type "DELETE"'
                          className="w-full px-3 py-2 border border-red-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                            className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'referral' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF8A5C]/15 rounded-lg flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[#FF8A5C]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">Refer a Friend</h2>
                      <p className="text-xs text-slate-500">1 free month per friend who subscribes</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  <div className="bg-gradient-to-br from-[#FF8A5C]/10 to-slate-50 border border-[#FF8A5C]/30 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">Your referral code</p>
                    {referralCode ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white border-2 border-[#FF8A5C]/40 rounded-lg px-4 py-3 text-center">
                            <span className="text-2xl font-bold text-[#e5753d] tracking-[0.3em]">{referralCode}</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(referralCode);
                              setReferralCopied(true);
                              setTimeout(() => setReferralCopied(false), 2000);
                            }}
                            className="p-3 bg-[#FF8A5C] text-white rounded-lg hover:bg-[#FF8A5C] transition-colors"
                          >
                            {referralCopied ? <CheckCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            const link = `https://mybillport.com/signup?ref=${referralCode}`;
                            navigator.clipboard.writeText(link);
                            setReferralCopied(true);
                            setTimeout(() => setReferralCopied(false), 2000);
                          }}
                          className="w-full text-sm text-[#FF8A5C] hover:text-[#e5753d] flex items-center justify-center gap-1.5 py-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {referralCopied ? 'Copied!' : 'Copy invite link'}
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-[#FF8A5C]" />
                        <span className="ml-2 text-sm text-slate-500">Generating your code...</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <Users className="w-6 h-6 text-[#FF8A5C] mx-auto mb-1" />
                      <p className="text-2xl font-bold text-slate-800">{ctxProfile?.referralCount ?? 0}</p>
                      <p className="text-xs text-slate-500">Friends joined</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <Gift className="w-6 h-6 text-[#FF8A5C] mx-auto mb-1" />
                      <p className="text-2xl font-bold text-slate-800">{ctxProfile?.referralFreeMonths ?? 0}</p>
                      <p className="text-xs text-slate-500">Free months earned</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">How it works</p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FF8A5C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                        <p className="text-sm text-slate-600">Share your referral code or invite link with a friend</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FF8A5C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                        <p className="text-sm text-slate-600">They enter your code when signing up for MyBillPort</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FF8A5C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                        <p className="text-sm text-slate-600">When they subscribe to Premium, you get <strong>1 month free</strong>. More referrals = more free months, one per friend.</p>
                      </div>
                    </div>
                  </div>

                  {(ctxProfile?.referralFreeMonths ?? 0) > 0 && (
                    <div className="bg-[#FF8A5C]/10 border border-[#FF8A5C]/30 rounded-xl p-4 flex items-center gap-3">
                      <Gift className="w-5 h-5 text-[#FF8A5C] flex-shrink-0" />
                      <p className="text-sm text-[#e5753d]">
                        You have <strong>{ctxProfile?.referralFreeMonths} free month{(ctxProfile?.referralFreeMonths ?? 0) > 1 ? 's' : ''}</strong> waiting — applied automatically to your next Premium renewal.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeModal === 'notifications' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF8A5C]/15 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-[#FF8A5C]" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  {loadingPrefs ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-[#FF8A5C] animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800">In-App Notifications</p>
                            <p className="text-sm text-slate-500">Get notified when bills are due</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setInAppReminders(!inAppReminders)}
                          className={`w-12 h-7 rounded-full transition-colors relative ${inAppReminders ? 'bg-[#FF8A5C]' : 'bg-slate-300'}`}
                        >
                          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${inAppReminders ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>

                      {inAppReminders && (
                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                          <p className="text-sm font-medium text-slate-700">Notify me before a bill is due:</p>
                          {[
                            { day: 7, label: '7 days before' },
                            { day: 2, label: '2 days before' },
                            { day: 1, label: '1 day before' },
                            { day: 0, label: 'Same day (due today)' },
                          ].map(({ day, label }) => (
                            <label key={day} className="flex items-center gap-3 cursor-pointer">
                              <div
                                onClick={() => toggleNotifyDay(day)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                  notifyDays.includes(day) ? 'bg-[#FF8A5C] border-[#FF8A5C]' : 'border-slate-300 bg-white'
                                }`}
                              >
                                {notifyDays.includes(day) && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm text-slate-700">{label}</span>
                            </label>
                          ))}
                          <p className="text-xs text-slate-500 mt-2">Overdue bills always generate notifications</p>
                        </div>
                      )}

                      <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-800">Phone Notifications</p>
                              <p className="text-sm text-slate-500">
                                {!pushSupported
                                  ? 'Not supported on this device'
                                  : pushPermission === 'denied'
                                  ? 'Blocked — enable in browser settings'
                                  : pushSubscribed
                                  ? 'Active — alerts pop up even when app is closed'
                                  : 'Get alerts on your phone even when app is closed'}
                              </p>
                            </div>
                          </div>
                          {pushSupported && pushPermission !== 'denied' && (
                            <button
                              onClick={pushSubscribed ? unsubscribePush : subscribePush}
                              disabled={pushLoading}
                              className={`w-12 h-7 rounded-full transition-colors relative disabled:opacity-50 ${pushSubscribed ? 'bg-[#FF8A5C]' : 'bg-slate-300'}`}
                            >
                              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${pushSubscribed ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                          )}
                        </div>
                        {pushSubscribed && (
                          <p className="text-xs text-[#FF8A5C] mt-2 ml-8">
                            You&apos;ll receive push alerts for overdue bills, due-today reminders, and more.
                          </p>
                        )}
                        {pushError && (
                          <p className="text-xs text-red-500 mt-2 ml-8">{pushError}</p>
                        )}
                      </div>

                      {prefsSaved && (
                        <div className="bg-[#FF8A5C]/10 border border-[#FF8A5C]/30 text-[#e5753d] px-4 py-2 rounded-lg text-sm text-center">
                          Preferences saved!
                        </div>
                      )}

                      <button
                        onClick={handleSavePreferences}
                        disabled={savingPrefs}
                        className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {savingPrefs ? (<><Loader2 className="w-5 h-5 animate-spin" />Saving...</>) : 'Save Preferences'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Privacy</h2>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">Data Visibility</p>
                        <p className="text-sm text-slate-500">Your bill data is only visible to you</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Private</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EyeOff className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">Hide Bill Amounts</p>
                        <p className="text-sm text-slate-500">Mask dollar amounts on dashboard</p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Coming Soon</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-slate-800">Your Data Rights</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2"><span className="text-[#FF8A5C] mt-0.5">&#10003;</span>All your data is encrypted and stored securely</li>
                      <li className="flex items-start gap-2"><span className="text-[#FF8A5C] mt-0.5">&#10003;</span>We never sell or share your personal information</li>
                      <li className="flex items-start gap-2"><span className="text-[#FF8A5C] mt-0.5">&#10003;</span>You can request data deletion at any time</li>
                    </ul>
                  </div>

                  <Link
                    href="/privacy"
                    onClick={() => setActiveModal(null)}
                    className="block w-full text-center py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Read Full Privacy Policy
                  </Link>
                </div>
              </div>
            )}

            {activeModal === 'security' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Security</h2>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">Email Verification</p>
                        <p className="text-sm text-slate-500">
                          {user.emailVerified ? 'Your email is verified' : 'Email not verified'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-500">Email-based 2FA</p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Coming Soon</span>
                  </div>

                  {biometricSupported && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-800">Biometric Payment Auth</p>
                          <p className="text-sm text-slate-500">
                            {biometricEnabled ? 'Verify with fingerprint/face before paying' : 'Use fingerprint or face to confirm payments'}
                          </p>
                          {biometricError && <p className="text-xs text-red-500 mt-1">{biometricError}</p>}
                        </div>
                      </div>
                      <button
                        onClick={handleBiometricToggle}
                        disabled={biometricLoading}
                        className={`relative w-12 h-7 rounded-full transition-colors ${biometricEnabled ? 'bg-[#FF8A5C]' : 'bg-slate-300'} ${biometricLoading ? 'opacity-50' : ''}`}
                      >
                        {biometricLoading ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                        ) : (
                          <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${biometricEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-slate-800">Account Security</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2"><span className="text-[#FF8A5C] mt-0.5">&#10003;</span>Your password is securely hashed</li>
                      <li className="flex items-start gap-2"><span className="text-[#FF8A5C] mt-0.5">&#10003;</span>Sessions expire automatically for safety</li>
                      <li className="flex items-start gap-2"><span className="text-[#FF8A5C] mt-0.5">&#10003;</span>All connections use HTTPS encryption</li>
                    </ul>
                  </div>

                  <Link
                    href="/forgot-password"
                    onClick={() => setActiveModal(null)}
                    className="block w-full text-center py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Change Password
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
