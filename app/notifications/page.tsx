'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, Bell, Check, CheckCheck, Loader2, AlertTriangle, Clock, CalendarClock, DollarSign, Receipt } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, AppNotification, NotificationType } from '../lib/firebase';

const typeConfig: Record<NotificationType, { label: string; color: string; bgColor: string }> = {
  bill_added: { label: 'Added', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  due_soon: { label: 'Due Soon', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  due_today: { label: 'Due Today', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  overdue: { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50' },
  payment_success: { label: 'Paid', color: 'text-green-600', bgColor: 'bg-green-50' },
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const notifs = await fetchNotifications(user.uid);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notifId: string) => {
    try {
      await markNotificationRead(notifId);
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'bill_added': return <Bell className="w-5 h-5" />;
      case 'due_soon': return <CalendarClock className="w-5 h-5" />;
      case 'due_today': return <Clock className="w-5 h-5" />;
      case 'overdue': return <AlertTriangle className="w-5 h-5" />;
      case 'payment_success': return <DollarSign className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  if (authLoading) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <div className="relative">
                <Receipt className="text-white w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-teal-500/30">
                  <DollarSign className="text-teal-400 w-3 h-3" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tighter">My<span className="text-teal-500">BillPort</span> Notifications</h1>
              <p className="text-slate-400 text-xs">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-3 py-2 bg-teal-500/10 text-teal-400 rounded-lg text-sm hover:bg-teal-500/20 transition-colors disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={loadNotifications} className="ml-2 underline hover:no-underline">Retry</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-1">No notifications yet</p>
            <p className="text-slate-500 text-sm">You&apos;ll see reminders here when bills are due</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.bill_added;
            return (
              <div
                key={notif.id}
                className={`rounded-xl p-4 transition-colors ${
                  notif.isRead
                    ? 'bg-slate-800/30 border border-slate-700/50'
                    : 'bg-slate-800/70 border border-teal-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notif.isRead ? 'bg-slate-700 text-slate-400' : `${config.bgColor} ${config.color}`
                  }`}>
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          notif.isRead ? 'bg-slate-700 text-slate-400' : `${config.bgColor} ${config.color}`
                        }`}>
                          {config.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className={`text-sm mt-0.5 ${notif.isRead ? 'text-slate-500' : 'text-slate-300'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => notif.id && handleMarkRead(notif.id)}
                      className="p-1.5 text-teal-400 hover:bg-teal-500/20 rounded-lg transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
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
          <Link href="/settings" className="nav-item">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
