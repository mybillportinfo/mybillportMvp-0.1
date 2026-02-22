'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, CheckCircle, MessageSquare, Home, Plus, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('https://formspree.io/f/mpqjlqwz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'anonymous',
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setMessage('');
        toast.success('Feedback submitted — thank you!');
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-6">
        <Link href="/settings" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Send Feedback</h1>
            <p className="text-slate-400 text-sm">Help us improve BillPort</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        {success ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h2>
            <p className="text-slate-500 mb-6">
              Your feedback has been submitted. We appreciate you taking the time to help us improve.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Send More
              </button>
              <Link
                href="/app"
                className="flex-1 py-3 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors text-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">What&apos;s on your mind?</h2>
              <p className="text-sm text-slate-500 mt-1">Your email ({user?.email}) will be included so we can follow up if needed.</p>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your feedback, issue, or suggestion in detail..."
                  rows={5}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/2000</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
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
