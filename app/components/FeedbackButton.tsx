'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { submitFeedback } from '../lib/firebase';

const FEEDBACK_CATEGORIES = [
  { value: 'bug', label: 'Bug Report', icon: '🐛' },
  { value: 'feature', label: 'Feature Request', icon: '💡' },
  { value: 'billing', label: 'Billing Question', icon: '💳' },
  { value: 'usability', label: 'Usability', icon: '🎯' },
  { value: 'general', label: 'General Feedback', icon: '📝' },
];

export default function FeedbackButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetForm = useCallback(() => {
    setCategory('');
    setMessage('');
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, category]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit feedback');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (message.trim().length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(
        user.uid,
        user.email || 'anonymous',
        user.displayName || 'BillPort User',
        category,
        message,
        typeof window !== 'undefined' ? window.location.pathname : '/',
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );
      toast.success('Feedback submitted — thank you!');
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg shadow-teal-900/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Send feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label="Feedback form"
        >
          <div
            ref={modalRef}
            className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-500/15 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Send Feedback</h2>
                  <p className="text-xs text-slate-400">Help us improve BillPort</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close feedback form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${
                        category === cat.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="mr-1.5">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your feedback, issue, or suggestion..."
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/2000</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Submitting as {user.email}
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
