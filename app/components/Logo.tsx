'use client';

export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" fill="url(#logo-grad)" />
      <path d="M14 16h20v2H14zm0 6h20v2H14zm0 6h14v2H14z" fill="white" opacity="0.9" />
      <path d="M32 28l4-4 4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 24v10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="36" cy="36" r="3" fill="#C4E538" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8A5C" />
          <stop offset="1" stopColor="#e5753d" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoFull({ height = 32, className = '' }: { height?: number; className?: string }) {
  const iconSize = height;
  const textHeight = height * 0.55;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      <div className="flex flex-col">
        <span className="font-bold tracking-tight text-white leading-none" style={{ fontSize: textHeight }}>
          My<span style={{ color: '#FF8A5C' }}>Bill</span>Port
        </span>
      </div>
    </div>
  );
}

export function LogoIconAlt({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="24" fill="url(#logo-alt-grad)" />
      <path d="M15 14h18a2 2 0 012 2v16a2 2 0 01-2 2H15a2 2 0 01-2-2V16a2 2 0 012-2z" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M17 20h14M17 24h14M17 28h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 26l2.5 2.5L37 24" stroke="#C4E538" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="logo-alt-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e5753d" />
          <stop offset="1" stopColor="#c45e2a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoMono({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" fill="currentColor" opacity="0.1" />
      <path d="M14 16h20v2H14zm0 6h20v2H14zm0 6h14v2H14z" fill="currentColor" opacity="0.7" />
      <path d="M32 28l4-4 4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 24v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="36" cy="36" r="3" fill="currentColor" />
    </svg>
  );
}

export function Favicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#fav-grad)" />
      <path d="M9 11h14v1.5H9zm0 4h14v1.5H9zm0 4h10v1.5H9z" fill="white" opacity="0.9" />
      <circle cx="24" cy="24" r="2" fill="#C4E538" />
      <defs>
        <linearGradient id="fav-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8A5C" />
          <stop offset="1" stopColor="#e5753d" />
        </linearGradient>
      </defs>
    </svg>
  );
}
