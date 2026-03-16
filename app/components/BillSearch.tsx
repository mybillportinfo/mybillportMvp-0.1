'use client';

import { useState, useRef } from 'react';
import { Search, X, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SearchResult {
  id: string;
  reason: string;
}

interface Props {
  onResults: (ids: string[] | null, summary: string) => void;
}

export default function BillSearch({ onResults }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q || !user) return;

    setLoading(true);
    setSummary('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/search/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      const ids: string[] = (data.results || []).map((r: SearchResult) => r.id);
      setSummary(data.summary || '');
      setActive(true);
      onResults(ids, data.summary || '');
    } catch {
      setSummary('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setQuery('');
    setSummary('');
    setActive(false);
    onResults(null, '');
    inputRef.current?.focus();
  }

  const suggestions = [
    'Bills due this week',
    'Overdue bills',
    'Internet & phone',
    'Paid last month',
  ];

  return (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search bills… e.g. "Rogers last summer" or "overdue utilities"'
            className="w-full bg-[#263244] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4D6A9F]/50 focus:ring-1 focus:ring-[#4D6A9F]/30 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {(query || active) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-1.5 bg-[#4D6A9F] hover:bg-[#3d5a8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Searching…' : 'AI Search'}
        </button>
      </form>

      {!active && !loading && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); setTimeout(() => handleSearch(), 0); }}
              className="text-xs bg-white/5 hover:bg-[#4D6A9F]/15 border border-white/10 hover:border-[#4D6A9F]/30 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {summary && (
        <div className="flex items-center gap-2 text-xs text-[#6BCB77] bg-[#6BCB77]/5 border border-[#6BCB77]/15 rounded-lg px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          {summary}
          <button onClick={handleClear} className="ml-auto text-slate-500 hover:text-white transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
