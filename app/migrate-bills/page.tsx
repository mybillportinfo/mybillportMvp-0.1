'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { migrateBillsAddCategory } from '../lib/firebase';

export default function MigrateBillsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const runMigration = async () => {
    if (migrating) return;
    setMigrating(true);
    setError(null);
    setResult(null);

    try {
      const res = await migrateBillsAddCategory();
      setResult(res);
    } catch (err: any) {
      console.error('Migration failed:', err);
      setError(err.message || 'Migration failed');
    } finally {
      setMigrating(false);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-5 pt-12 pb-12">
      <Link href="/app" className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Dashboard
      </Link>

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6 text-teal-400" />
          <h1 className="text-white text-2xl font-semibold">Data Migration</h1>
        </div>
        <p className="text-slate-400 mb-6 text-sm">
          One-time fix for bills created before the category feature. This assigns a default category to any bill that doesn&apos;t have one yet.
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
          <div className="text-sm text-slate-300 space-y-2">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Finds bills without a category</li>
              <li>Assigns them to &quot;Miscellaneous &gt; Other&quot;</li>
              <li>Bills that already have categories are left unchanged</li>
              <li>No data is deleted</li>
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>This only needs to be run once. Running it again is safe — it will skip bills that already have categories.</span>
          </div>

          {!result && (
            <button
              onClick={runMigration}
              disabled={migrating}
              className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {migrating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Migrating...
                </>
              ) : (
                'Run Migration'
              )}
            </button>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Migration Complete</span>
              </div>
              <div className="text-sm space-y-1">
                <p>{result.updated} bill{result.updated !== 1 ? 's' : ''} updated with default category</p>
                <p>{result.skipped} bill{result.skipped !== 1 ? 's' : ''} already had categories (skipped)</p>
                <p>{result.total} total bills scanned</p>
              </div>
              <Link
                href="/app"
                className="inline-block mt-2 text-teal-300 underline hover:no-underline text-sm"
              >
                Go to Dashboard to see the results
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
