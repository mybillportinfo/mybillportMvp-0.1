'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, User, Bell, Shield, Lock, LogOut, ChevronRight, Loader2, X, Mail, Eye, EyeOff, KeyRound } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { getUserPreferences, setUserPreferences } from '../lib/firebase';

type SettingsModal = 'notifications' | 'privacy' | 'security' | null;

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<SettingsModal>(null);

  const [inAppReminders, setInAppReminders] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState('2');
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUserPreferences(user.uid).then(prefs => {
        setInAppReminders(prefs.inAppReminders);
      }).catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-6">
        <Link href="/app" className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-white text-2xl font-semibold">Settings</h1>
        <p className="text-slate-400">Manage your preferences</p>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">
                {user.displayName || 'MyBillPort User'}
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>

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
          MyBillPort v0.1 MVP
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">In-App Bill Reminders</p>
                        <p className="text-sm text-slate-500">Get reminders when bills are due soon</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setInAppReminders(!inAppReminders)}
                      className={`w-12 h-7 rounded-full transition-colors relative ${inAppReminders ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${inAppReminders ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">Email Reminders</p>
                        <p className="text-sm text-slate-500">Get notified before bills are due</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailReminders(!emailReminders)}
                      className={`w-12 h-7 rounded-full transition-colors relative ${emailReminders ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${emailReminders ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div>
                    <p className="font-medium text-slate-800 mb-2">Remind me before due date</p>
                    <select
                      value={reminderDays}
                      onChange={(e) => setReminderDays(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="1">1 day before</option>
                      <option value="2">2 days before</option>
                      <option value="3">3 days before</option>
                      <option value="7">7 days before</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">Overdue Alerts</p>
                      <p className="text-sm text-slate-500">Get alerted when bills are past due</p>
                    </div>
                    <button
                      onClick={() => setOverdueAlerts(!overdueAlerts)}
                      className={`w-12 h-7 rounded-full transition-colors relative ${overdueAlerts ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${overdueAlerts ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">
                      Advanced notification settings including SMS and push notifications will be available in a future update.
                    </p>
                  </div>

                  {prefsSaved && (
                    <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-lg text-sm text-center">
                      Preferences saved!
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (!user) return;
                      setSavingPrefs(true);
                      setPrefsSaved(false);
                      try {
                        await setUserPreferences(user.uid, { inAppReminders });
                        setPrefsSaved(true);
                        setTimeout(() => setPrefsSaved(false), 2000);
                      } catch (err) {
                        console.error('Failed to save preferences:', err);
                      } finally {
                        setSavingPrefs(false);
                      }
                    }}
                    disabled={savingPrefs}
                    className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingPrefs ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
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
                      <li className="flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">&#10003;</span>
                        All your data is encrypted and stored securely
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">&#10003;</span>
                        We never sell or share your personal information
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">&#10003;</span>
                        You can request data deletion at any time
                      </li>
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
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Account Secured</p>
                      <p className="text-sm text-green-600">Your account is protected with Firebase Auth</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-800">Sign-in Method</h3>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <KeyRound className="w-5 h-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          {user.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'Email & Password'}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">Active</span>
                    </div>
                  </div>

                  {user.providerData[0]?.providerId !== 'google.com' && (
                    <Link
                      href="/forgot-password"
                      onClick={() => setActiveModal(null)}
                      className="block w-full text-center py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                      Change Password
                    </Link>
                  )}

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-slate-800">Security Features</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">&#10003;</span>
                        Encrypted data transmission (TLS/SSL)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">&#10003;</span>
                        Per-user data isolation in Firestore
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">&#10003;</span>
                        Secure session management
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">
                      Two-factor authentication (2FA) will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
