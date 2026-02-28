'use client';

import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, User, Bell, Shield, Lock, LogOut, ChevronRight, Loader2, X, Eye, EyeOff, MessageSquare, Receipt, DollarSign, Check, AlertTriangle, Camera, Trash2, Mail, RefreshCw, Unplug, Inbox } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import {
  getUserPreferences, setUserPreferences,
  getLinkedProviders,
  getUserProfile, saveUserProfile,
  updateUserDisplayName, updateUserProfilePhoto,
  updateUserEmail, deleteUserAccount,
  type UserProfile,
} from '../lib/firebase';

type SettingsModal = 'notifications' | 'privacy' | 'security' | 'profile' | null;

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<SettingsModal>(null);

  const [notifyDays, setNotifyDays] = useState<number[]>([7, 2, 1, 0]);
  const [inAppReminders, setInAppReminders] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

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

  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailSyncing, setGmailSyncing] = useState(false);
  const [gmailMessage, setGmailMessage] = useState<string | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setLoadingPrefs(true);
      getUserPreferences(user.uid).then(prefs => {
        setInAppReminders(prefs.inAppReminders);
        setNotifyDays(prefs.notifyDays || [7, 2, 1, 0]);
      }).catch(() => {}).finally(() => {
        setLoadingPrefs(false);
      });

      setLinkedProviders(getLinkedProviders());

      getUserProfile(user.uid).then(p => {
        if (p) {
          setProfile(p);
          setUsername(p.username || '');
        } else {
          setUsername(user.displayName || '');
        }
        setNewEmail(user.email || '');
      });

      user.getIdToken().then(token => {
        fetch('/api/gmail/status', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(data => {
            setGmailConnected(data.connected || false);
            setGmailEmail(data.email || '');
          })
          .catch(() => {});
      });
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmailStatus = params.get('gmail');
    if (gmailStatus === 'connected') {
      setGmailConnected(true);
      setGmailMessage('Gmail connected successfully!');
      window.history.replaceState({}, '', '/settings');
    } else if (gmailStatus === 'error') {
      const reason = params.get('reason') || 'Unknown error';
      setGmailError(`Failed to connect Gmail: ${reason}`);
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

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
        photoURL: user.photoURL || null,
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
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Photo must be under 2MB');
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await updateUserProfilePhoto(dataUrl);
        await saveUserProfile(user.uid, { photoURL: dataUrl });
        setProfile(prev => prev ? { ...prev, photoURL: dataUrl } : null);
        setSavingProfile(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setProfileError('Failed to upload photo');
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

  const handleConnectGmail = async () => {
    if (!user) return;
    setGmailLoading(true);
    setGmailError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/gmail/auth', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setGmailError(data.error || 'Failed to get authorization URL');
      }
    } catch {
      setGmailError('Failed to connect Gmail');
    } finally {
      setGmailLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!user) return;
    setGmailLoading(true);
    setGmailError(null);
    try {
      const token = await user.getIdToken();
      await fetch('/api/gmail/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setGmailConnected(false);
      setGmailEmail('');
      setGmailMessage('Gmail disconnected.');
      setTimeout(() => setGmailMessage(null), 3000);
    } catch {
      setGmailError('Failed to disconnect Gmail');
    } finally {
      setGmailLoading(false);
    }
  };

  const handleSyncGmail = async () => {
    if (!user) return;
    setGmailSyncing(true);
    setGmailError(null);
    setGmailMessage(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) {
        setGmailError(data.error);
      } else {
        setGmailMessage(data.message || `Found ${data.added} new bills.`);
        if (data.added > 0) {
          setTimeout(() => router.push('/pending-bills'), 2000);
        }
      }
    } catch {
      setGmailError('Failed to sync Gmail bills');
    } finally {
      setGmailSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {}
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
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
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <div className="relative">
              <Receipt className="text-white w-6 h-6" />
              <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-teal-500/30">
                <DollarSign className="text-teal-400 w-3 h-3" />
              </div>
            </div>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">My<span className="text-teal-500">BillPort</span></span>
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
              <img src={photoURL} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-teal-200" />
            ) : (
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-teal-600" />
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

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Free Plan</p>
              <p className="text-sm text-slate-500">Up to 5 bills</p>
            </div>
            <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Gmail Bill Scanner</p>
              <p className="text-xs text-slate-500">Auto-detect bills from your email</p>
            </div>
            {gmailConnected && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Connected</span>
            )}
          </div>

          {gmailConnected ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Connected to <span className="font-medium text-slate-800">{gmailEmail}</span>
              </p>
              <p className="text-xs text-slate-400">We only read emails from known billers to extract bill data. No emails are stored.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleSyncGmail}
                  disabled={gmailSyncing}
                  className="flex-1 py-2.5 bg-teal-500 text-white rounded-lg font-medium text-sm hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {gmailSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {gmailSyncing ? 'Scanning...' : 'Scan for Bills'}
                </button>
                <Link
                  href="/pending-bills"
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Inbox className="w-4 h-4" />
                  Review
                </Link>
                <button
                  onClick={handleDisconnectGmail}
                  disabled={gmailLoading}
                  className="py-2.5 px-3 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Disconnect Gmail"
                >
                  <Unplug className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Connect your Gmail to automatically find and import bills from your inbox. We only read bill-related emails — your privacy is protected.</p>
              <button
                onClick={handleConnectGmail}
                disabled={gmailLoading}
                className="w-full py-2.5 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {gmailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {gmailLoading ? 'Connecting...' : 'Connect Gmail'}
              </button>
            </div>
          )}

          {gmailMessage && (
            <div className="bg-teal-50 border border-teal-200 text-teal-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              {gmailMessage}
            </div>
          )}
          {gmailError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {gmailError}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl overflow-hidden divide-y divide-slate-100">
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
            <MessageSquare className="w-5 h-5 text-teal-500" />
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

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
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
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
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
                        <img src={photoURL} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-teal-200" />
                      ) : (
                        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-teal-600" />
                        </div>
                      )}
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-600 transition-colors"
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
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-lg text-sm text-center flex items-center justify-center gap-2">
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

            {activeModal === 'notifications' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-teal-600" />
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
                      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
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
                          className={`w-12 h-7 rounded-full transition-colors relative ${inAppReminders ? 'bg-teal-500' : 'bg-slate-300'}`}
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
                                  notifyDays.includes(day) ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'
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

                      {prefsSaved && (
                        <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-lg text-sm text-center">
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
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>All your data is encrypted and stored securely</li>
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>We never sell or share your personal information</li>
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>You can request data deletion at any time</li>
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

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-slate-800">Account Security</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>Your password is securely hashed</li>
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>Sessions expire automatically for safety</li>
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>All connections use HTTPS encryption</li>
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
