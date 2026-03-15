'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const DISMISSED_KEY = 'billport_install_dismissed';

export function InstallBanner() {
  const { canInstall, isInstalled, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only show on mobile-sized screens
    setIsMobile(window.innerWidth <= 768);
    // Check if user already dismissed
    setDismissed(!!localStorage.getItem(DISMISSED_KEY));
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  // Don't show: already installed, dismissed, not mobile, or prompt not available
  if (!canInstall || dismissed || isInstalled || !isMobile) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#4D6A9F]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-[#4D6A9F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Add to Home Screen</p>
          <p className="text-slate-400 text-xs mt-0.5">Get the full app experience</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-[#4D6A9F] text-white rounded-lg text-sm font-semibold hover:bg-[#4D6A9F] transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
