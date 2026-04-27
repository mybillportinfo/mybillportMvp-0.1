'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Download, ChevronLeft, ChevronRight,
  Film, Zap, TrendingDown, RefreshCw, CheckCircle,
  Bell, ShieldCheck, Loader2, Play
} from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { LogoFull, LogoIcon } from '../components/Logo';

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

/* ─── Brand colours ─────────────────────────────────────────── */
const C = {
  bg: '#0d1829',
  navy: '#1a2740',
  card: '#1e3148',
  blue: '#4D6A9F',
  green: '#6BCB77',
  orange: '#FFB347',
  red: '#FF6B6B',
  white: '#ffffff',
  muted: '#94a3b8',
};

/* ─── Scene components (9:16 = 390×844) ──────────────────────── */

function SceneBg({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: 390, height: 844, background: C.bg, position: 'relative',
      overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {/* subtle radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(77,106,159,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {children}
    </div>
  );
}

function BigLabel({ text, size = 52, color = C.white, align = 'center', px = 32 }: { text: string; size?: number; color?: string; align?: 'center' | 'left'; px?: number }) {
  return (
    <div style={{ fontSize: size, fontWeight: 900, color, textAlign: align, lineHeight: 1.1, paddingLeft: px, paddingRight: px, letterSpacing: '-0.02em' }}>
      {text}
    </div>
  );
}

function Sub({ text, color = C.muted }: { text: string; color?: string }) {
  return <div style={{ fontSize: 20, color, textAlign: 'center', lineHeight: 1.4, padding: '0 36px', fontWeight: 500 }}>{text}</div>;
}

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ background: color + '20', border: `1px solid ${color}40`, color, borderRadius: 999, padding: '6px 18px', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {text}
    </div>
  );
}

function MockBillCard({ biller, amount, dueText, status }: { biller: string; amount: string; dueText: string; status: 'overdue' | 'due' | 'paid' }) {
  const statusColor = status === 'overdue' ? C.red : status === 'paid' ? C.green : C.orange;
  const statusLabel = status === 'overdue' ? 'Overdue' : status === 'paid' ? 'Paid' : 'Due soon';
  return (
    <div style={{ background: C.card, borderRadius: 20, padding: '20px 22px', width: 318, border: `1px solid rgba(255,255,255,0.06)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.white }}>{biller}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{dueText}</div>
        </div>
        <div style={{ background: statusColor + '20', color: statusColor, borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{statusLabel}</div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.white }}>{amount}</div>
        <div style={{ background: C.blue, borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: C.white }}>Pay →</div>
      </div>
    </div>
  );
}

function MockNotification({ text }: { text: string }) {
  return (
    <div style={{ background: C.navy, borderRadius: 18, padding: '16px 20px', width: 318, display: 'flex', gap: 14, alignItems: 'center', border: `1px solid rgba(255,255,255,0.08)` }}>
      <div style={{ width: 40, height: 40, background: C.orange + '20', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={20} color={C.orange} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>MyBillPort</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{text}</div>
      </div>
    </div>
  );
}

function MockSwitchCard({ current, offer, saving }: { current: string; offer: string; saving: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 20, padding: '22px', width: 318, border: `1px solid rgba(255,255,255,0.06)` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Switch & Save</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: C.muted }}>You pay now</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.red, marginTop: 4 }}>{current}</div>
        </div>
        <div style={{ alignSelf: 'center', color: C.muted }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: C.muted }}>With them</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.green, marginTop: 4 }}>{offer}</div>
        </div>
      </div>
      <div style={{ background: C.green + '18', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
        <span style={{ color: C.green, fontWeight: 800, fontSize: 15 }}>Save {saving}/month</span>
      </div>
    </div>
  );
}

function CTAScene({ tagline = 'mybillport.com' }: { tagline?: string }) {
  return (
    <SceneBg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <LogoIcon size={72} />
        <BigLabel text="Try MyBillPort" size={46} />
        <Sub text="Track every bill. Never pay a late fee again." />
        <div style={{ background: C.blue, borderRadius: 999, padding: '16px 40px', fontSize: 18, fontWeight: 800, color: C.white }}>{tagline}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
          <Pill text="Free to start" color={C.green} />
          <Pill text="No bank login" color={C.orange} />
        </div>
      </div>
    </SceneBg>
  );
}

/* ─── Template definitions ─────────────────────────────────── */

type Scene = { id: string; label: string; script: string; component: React.ReactNode };
type Template = { id: string; title: string; emoji: string; tagline: string; color: string; scenes: Scene[] };

const TEMPLATES: Template[] = [
  {
    id: 'problem-solution',
    title: 'Problem / Solution',
    emoji: '😩',
    tagline: '"Missed a bill again?"',
    color: C.red,
    scenes: [
      {
        id: 'ps-1', label: 'Hook', script: 'POV: you just got a $45 late fee because you forgot about your Rogers bill.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Pill text="This you?" color={C.red} />
              <BigLabel text={"Missed a\nbill again?"} size={58} />
              <Sub text="Late fees cost Canadians $850M+ a year." color={C.muted} />
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'ps-2', label: 'Pain', script: 'This Rogers bill was due 3 days ago. That\'s $35 in late fees you didn\'t need to pay.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Sub text="Late fees are painful" color={C.red} />
              <MockBillCard biller="Rogers" amount="$89.99" dueText="Was due Apr 24 · 3 days ago" status="overdue" />
              <div style={{ fontSize: 36, fontWeight: 900, color: C.red }}>+ $35 late fee 😬</div>
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'ps-3', label: 'Solution', script: 'MyBillPort sends you a reminder 3 days before every bill is due. Never miss one again.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Pill text="We've got you" color={C.green} />
              <MockNotification text="Rogers bill due in 3 days · Tap to pay $89.99" />
              <BigLabel text={"Smart reminders.\nZero late fees."} size={40} color={C.white} />
              <div style={{ display: 'flex', gap: 8 }}>
                <CheckCircle size={18} color={C.green} />
                <span style={{ color: C.green, fontWeight: 600, fontSize: 15 }}>Sent before every due date</span>
              </div>
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'ps-4', label: 'CTA', script: 'Link in bio. Free to start, no bank login needed.',
        component: <CTAScene />,
      },
    ],
  },
  {
    id: 'late-fee-shame',
    title: 'Late Fee Shame',
    emoji: '💸',
    tagline: '"Stop donating to Bell"',
    color: C.orange,
    scenes: [
      {
        id: 'lf-1', label: 'Hook', script: 'The average Canadian pays $45 in late fees every single year. That\'s a dinner out.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Pill text="Fun fact 🇨🇦" color={C.orange} />
              <BigLabel text="Average Canadian late fee" size={30} color={C.muted} />
              <div style={{ fontSize: 110, fontWeight: 900, color: C.red, lineHeight: 1 }}>$45</div>
              <Sub text="Per year. Per biller. Just for forgetting." />
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'lf-2', label: 'One tap', script: 'One tap marks a bill as paid and removes it from your list. Takes 2 seconds.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
              <Sub text="One tap. No stress." color={C.white} />
              <MockBillCard biller="Enbridge Gas" amount="$142.00" dueText="Due in 2 days" status="due" />
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <div style={{ background: C.green + '20', border: `1px solid ${C.green}40`, borderRadius: 14, padding: '14px 28px', color: C.green, fontWeight: 800, fontSize: 16 }}>
                  ✓ Mark as Paid
                </div>
              </div>
              <Sub text="Bill removed. Late fee: avoided." color={C.green} />
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'lf-3', label: 'Score', script: 'Your Savings Score goes up every time you pay on time. Hit 90 and you\'re basically debt-proof.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Pill text="Your score" color={C.green} />
              <div style={{ position: 'relative', width: 160, height: 160 }}>
                <svg width={160} height={160} viewBox="0 0 160 160">
                  <circle cx={80} cy={80} r={68} fill="none" stroke={C.navy} strokeWidth={14} />
                  <circle cx={80} cy={80} r={68} fill="none" stroke={C.green} strokeWidth={14}
                    strokeDasharray={`${427 * 0.85} 427`} strokeLinecap="round"
                    transform="rotate(-90 80 80)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 42, fontWeight: 900, color: C.green }}>85</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Savings Score</div>
                </div>
              </div>
              <BigLabel text={"You avoid 90%\nof late fees"} size={36} />
              <Sub text="Keep it up 🏆" color={C.orange} />
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'lf-4', label: 'CTA', script: 'Link in bio. Takes 30 seconds to add your first bill.',
        component: <CTAScene />,
      },
    ],
  },
  {
    id: 'switch-save',
    title: 'Switch & Save',
    emoji: '💡',
    tagline: '"You\'re overpaying"',
    color: C.green,
    scenes: [
      {
        id: 'ss-1', label: 'Hook', script: 'Raise your hand if you\'re still paying $89 for internet when you could be paying $55.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Pill text="Hot take 🔥" color={C.orange} />
              <BigLabel text={"You're\noverpaying\nfor internet"} size={52} />
              <Sub text="Most Canadians do. Here's how to fix it." />
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'ss-2', label: 'Compare', script: 'Rogers charges you $89. TekSavvy has the same speed for $55. That\'s $34 you\'re throwing away every month.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
              <Sub text="MyBillPort found this for you" color={C.muted} />
              <MockSwitchCard current="$89/mo" offer="$55/mo" saving="$34" />
              <Sub text="Same speed. Different bill." color={C.white} />
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'ss-3', label: 'Savings', script: 'That\'s $408 a year back in your pocket. MyBillPort finds these deals automatically.',
        component: (
          <SceneBg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Pill text="Do the math" color={C.green} />
              <div style={{ fontSize: 22, color: C.muted }}>$34 × 12 months =</div>
              <div style={{ fontSize: 96, fontWeight: 900, color: C.green, lineHeight: 1 }}>$408</div>
              <Sub text="Back in your pocket. Every year." color={C.white} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <TrendingDown size={18} color={C.green} />
                <span style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>MyBillPort finds this automatically</span>
              </div>
            </div>
          </SceneBg>
        ),
      },
      {
        id: 'ss-4', label: 'CTA', script: 'Link in bio. Free to start — no bank login, no card needed.',
        component: <CTAScene />,
      },
    ],
  },
];

/* ─── Main page ─────────────────────────────────────────────── */

export default function ReelStudio() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<Template>(TEMPLATES[0]);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const sceneRef = useRef<HTMLDivElement>(null);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  useEffect(() => {
    if (user === null) { router.push('/login'); return; }
    if (user && !isAdmin) { router.push('/dashboard'); }
  }, [user, isAdmin, router]);

  const currentScene = selected.scenes[sceneIdx];

  const exportZip = useCallback(async () => {
    setExporting(true);
    const zip = new JSZip();
    const imgs = zip.folder('scenes')!;

    for (let i = 0; i < selected.scenes.length; i++) {
      setSceneIdx(i);
      setExportProgress(`Capturing scene ${i + 1} of ${selected.scenes.length}…`);
      await new Promise(r => setTimeout(r, 400)); // let DOM re-render
      if (sceneRef.current) {
        try {
          const png = await toPng(sceneRef.current, { pixelRatio: 2, cacheBust: true });
          const b64 = png.split(',')[1];
          imgs.file(`scene-${i + 1}-${selected.scenes[i].label.toLowerCase().replace(/\s+/g, '-')}.png`, b64, { base64: true });
        } catch (e) {
          console.error('capture error', e);
        }
      }
    }

    // script.txt
    const scriptLines = [
      `MyBillPort Reel – ${selected.title}`,
      `Generated: ${new Date().toLocaleDateString('en-CA')}`,
      '',
      '─────────────────────────────────',
      'SCENE SCRIPTS (paste into CapCut)',
      '─────────────────────────────────',
      '',
      ...selected.scenes.map((s, i) => [
        `Scene ${i + 1} – ${s.label}`,
        `Script: "${s.script}"`,
        `Duration: ~3-4 seconds`,
        '',
      ].join('\n')),
      '─────────────────────────────────',
      'INSTRUCTIONS',
      '─────────────────────────────────',
      '1. Open CapCut (or InShot)',
      '2. Create a new 9:16 project',
      '3. Add each scene image in order (3-4 sec each)',
      '4. Use the script above as on-screen text or voiceover',
      '5. Add a trending audio track',
      '6. Export at 1080x1920 and post!',
      '',
      'mybillport.com',
    ];
    zip.file('script.txt', scriptLines.join('\n'));

    // instructions.md
    zip.file('README.md', `# ${selected.title} Reel\n\nSee script.txt for scene scripts.\nImages are in the /scenes folder.\n\nBest video editors: CapCut, InShot, DaVinci Resolve.`);

    setExportProgress('Building ZIP…');
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mybillport-reel-${selected.id}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    setExportProgress('');
    setSceneIdx(0);
  }, [selected]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1829] flex items-center justify-center">
        <div className="text-slate-400 text-sm">Checking access…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1829] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#4D6A9F]" />
            <span className="font-bold text-lg">Reel Studio</span>
          </div>
          <span className="text-xs bg-[#4D6A9F]/20 text-[#4D6A9F] px-2 py-0.5 rounded-full font-semibold">ADMIN</span>
        </div>
        <button
          onClick={exportZip}
          disabled={exporting}
          className="flex items-center gap-2 bg-[#6BCB77] hover:bg-[#5ab867] text-[#0d1829] font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? exportProgress : 'Export ZIP'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr_300px] gap-8">

        {/* Left — template picker */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Templates</p>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelected(t); setSceneIdx(0); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selected.id === t.id
                  ? 'border-white/20 bg-white/5'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{t.emoji}</div>
                <div>
                  <div className="font-bold text-sm text-white">{t.title}</div>
                  <div className="text-xs text-slate-500">{t.scenes.length} scenes</div>
                </div>
              </div>
              <div className="text-xs italic" style={{ color: t.color }}>{t.tagline}</div>
            </button>
          ))}

          <div className="mt-6 p-4 bg-[#1a2740] rounded-2xl border border-white/5">
            <p className="text-xs font-semibold text-slate-400 mb-2">How to use</p>
            <ol className="text-xs text-slate-500 space-y-1.5 list-decimal list-inside">
              <li>Pick a template</li>
              <li>Preview each scene</li>
              <li>Click Export ZIP</li>
              <li>Open in CapCut / InShot</li>
              <li>Add audio & post!</li>
            </ol>
          </div>
        </div>

        {/* Center — 9:16 preview */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400 font-medium">
              Scene {sceneIdx + 1} of {selected.scenes.length} — <span className="text-white">{currentScene.label}</span>
            </div>
          </div>

          {/* The actual 9:16 frame */}
          <div className="relative" style={{ width: 300, height: 650 }}>
            {/* Phone frame border */}
            <div className="absolute inset-0 rounded-[36px] border-2 border-white/10 pointer-events-none z-10" />
            {/* Scaled scene (390×844 → 300×650) */}
            <div style={{ transform: 'scale(0.769)', transformOrigin: 'top left', width: 390, height: 844, borderRadius: 36, overflow: 'hidden' }}>
              <div ref={sceneRef}>
                {currentScene.component}
              </div>
            </div>
          </div>

          {/* Scene navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSceneIdx(Math.max(0, sceneIdx - 1))}
              disabled={sceneIdx === 0}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {selected.scenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSceneIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === sceneIdx ? 'bg-white scale-125' : 'bg-white/20'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setSceneIdx(Math.min(selected.scenes.length - 1, sceneIdx + 1))}
              disabled={sceneIdx === selected.scenes.length - 1}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-slate-600">9:16 vertical · 1080×1920 export</div>
        </div>

        {/* Right — script panel */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Scene Script</p>
            <div className="bg-[#1a2740] rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-slate-500 mb-2">Voiceover / on-screen text</div>
              <div className="text-sm text-white leading-relaxed font-medium">"{currentScene.script}"</div>
              <div className="mt-3 text-xs text-slate-500">Duration: ~3–4 seconds</div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">All Scenes</p>
            <div className="space-y-2">
              {selected.scenes.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSceneIdx(i)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                    i === sceneIdx
                      ? 'border-white/20 bg-white/5 text-white'
                      : 'border-white/5 bg-transparent text-slate-400 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-slate-600 mr-2">#{i + 1}</span>
                  <span className="font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Export Info</p>
            <div className="bg-[#1a2740] rounded-2xl p-4 border border-white/5 space-y-2">
              {[
                ['Format', '4× PNG scenes'],
                ['Size', '780×1688px (2×)'],
                ['Aspect', '9:16 vertical'],
                ['Includes', 'script.txt + README'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-300 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={exportZip}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 bg-[#6BCB77] hover:bg-[#5ab867] text-[#0d1829] font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? exportProgress || 'Exporting…' : 'Export ZIP for CapCut'}
          </button>
        </div>

      </div>
    </div>
  );
}
