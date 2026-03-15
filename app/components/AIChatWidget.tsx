'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type HistoryItem = { role: 'user' | 'assistant'; content: string };

const QUICK_PROMPTS = [
  'Bills due this week',
  'Monthly spending summary',
  'Any bill increases?',
  'My subscriptions & annual cost',
];

const WELCOME = `Hi! I'm your MyBillPort AI assistant. I can answer questions about your bills, spending patterns, and help you find ways to save money.\n\nWhat would you like to know?`;

async function getIdToken(): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  } catch {
    return null;
  }
}

export default function AIChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !user) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setHistory(data.history || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([{ role: 'assistant', content: WELCOME }]);
    setHistory([]);
    setError(null);
    setInput('');
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)' }}
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
          style={{ height: '520px', background: '#0f172a' }}>

          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700"
            style={{ background: 'linear-gradient(135deg, #134e4a 0%, #0f172a 100%)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#3d5a8f] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#4D6A9F]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">MyBillPort AI</p>
                <p className="text-xs text-[#4D6A9F]">Bill assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Clear chat">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#3d5a8f] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-[#4D6A9F]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : 'text-slate-200 rounded-tl-sm border border-slate-700'
                  }`}
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #0f766e, #134e4a)' }
                    : { background: '#1e293b' }
                  }
                >
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#3d5a8f] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-[#4D6A9F]" />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D6A9F] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D6A9F] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D6A9F] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-1 px-3 py-2 rounded-xl bg-red-950 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-500 text-center">Quick questions</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-xs px-2 py-2 rounded-xl border border-[#4D6A9F]/30 text-[#4D6A9F] bg-[#4D6A9F]/10 hover:bg-[#4D6A9F]/10 hover:border-[#4D6A9F] transition-colors text-left leading-tight"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-slate-700" style={{ background: '#0f172a' }}>
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your bills..."
                disabled={loading}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4D6A9F] disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0f766e, #134e4a)' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
