'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Settings } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push('/settings?tab=billing'), 6000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 bg-[#FF8A5C]/15 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-9 h-9 text-[#FF8A5C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Premium!</h1>
          <p className="text-slate-500 text-sm mt-2">Your subscription is now active. Enjoy unlimited bills and all premium features.</p>
        </div>
        <div className="space-y-3">
          <Link href="/app" className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF8A5C] text-white rounded-xl font-semibold hover:bg-[#e5753d] transition-colors">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link href="/settings?tab=billing" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
            <Settings className="w-4 h-4" />
            Manage Subscription
          </Link>
        </div>
        <p className="text-xs text-slate-400">Redirecting to settings in a few seconds…</p>
      </div>
    </div>
  );
}
