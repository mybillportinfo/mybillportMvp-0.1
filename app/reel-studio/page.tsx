'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import {
  ArrowLeft, Download, ChevronLeft, ChevronRight,
  Film, ShieldCheck, CheckCircle, Bell, TrendingDown,
  Loader2, Copy, Check, Lock,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { LogoIcon } from '../components/Logo';

/* ─── Admin guard ───────────────────────────────────────────── */
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

/* ─── Brand tokens ──────────────────────────────────────────── */
const C = {
  bg:     '#0d1829',
  navy:   '#1a2740',
  card:   '#1e3148',
  blue:   '#4D6A9F',
  green:  '#6BCB77',
  orange: '#FFB347',
  red:    '#FF6B6B',
  white:  '#ffffff',
  muted:  '#94a3b8',
};

/* ═══════════════════════════════════════════════════════════════
   SCENE COMPONENTS  (390 × 844 — native 9:16)
═══════════════════════════════════════════════════════════════ */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 390, height: 844,
      background: C.bg,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 20%, rgba(77,106,159,0.20) 0%, transparent 65%)',
        pointerEvents: 'none' }} />
      {children}
    </div>
  );
}

function Heading({ text, size = 54, color = C.white }: { text: string; size?: number; color?: string }) {
  return (
    <div style={{ fontSize: size, fontWeight: 900, color, textAlign: 'center',
      lineHeight: 1.08, padding: '0 32px', letterSpacing: '-0.02em',
      whiteSpace: 'pre-line' }}>
      {text}
    </div>
  );
}

function Sub({ text, color = C.muted }: { text: string; color?: string }) {
  return (
    <div style={{ fontSize: 20, color, textAlign: 'center',
      lineHeight: 1.4, padding: '0 36px', fontWeight: 500 }}>
      {text}
    </div>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ background: color + '22', border: `1.5px solid ${color}44`,
      color, borderRadius: 999, padding: '7px 20px',
      fontSize: 13, fontWeight: 800, letterSpacing: '0.07em',
      textTransform: 'uppercase' }}>
      {text}
    </div>
  );
}

function BillCard({ biller, amount, dueText, status }: {
  biller: string; amount: string; dueText: string;
  status: 'overdue' | 'due' | 'paid';
}) {
  const sc = status === 'overdue' ? C.red : status === 'paid' ? C.green : C.orange;
  const sl = status === 'overdue' ? 'Overdue' : status === 'paid' ? 'Paid' : 'Due soon';
  return (
    <div style={{ background: C.card, borderRadius: 22, padding: '22px 24px',
      width: 320, border: `1px solid rgba(255,255,255,0.07)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.white }}>{biller}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{dueText}</div>
        </div>
        <div style={{ background: sc + '22', color: sc, borderRadius: 99,
          padding: '5px 13px', fontSize: 12, fontWeight: 800 }}>{sl}</div>
      </div>
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.white }}>{amount}</div>
        <div style={{ background: C.blue, borderRadius: 14, padding: '11px 20px',
          fontSize: 14, fontWeight: 800, color: C.white }}>Pay →</div>
      </div>
    </div>
  );
}

function NotifBubble({ text }: { text: string }) {
  return (
    <div style={{ background: C.navy, borderRadius: 20, padding: '18px 22px',
      width: 320, display: 'flex', gap: 14, alignItems: 'center',
      border: `1px solid rgba(255,255,255,0.09)` }}>
      <div style={{ width: 44, height: 44, background: C.orange + '22', borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={22} color={C.orange} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>MyBillPort</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{text}</div>
      </div>
    </div>
  );
}

function SwitchCard({ from, to, saving }: { from: string; to: string; saving: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 22, padding: '24px',
      width: 320, border: `1px solid rgba(255,255,255,0.07)` }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: '0.09em',
        textTransform: 'uppercase', marginBottom: 18 }}>Switch & Save</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: C.muted }}>You pay now</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.red, marginTop: 6 }}>{from}</div>
        </div>
        <div style={{ alignSelf: 'center', color: C.muted, fontSize: 20 }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: C.muted }}>Switch & pay</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.green, marginTop: 6 }}>{to}</div>
        </div>
      </div>
      <div style={{ background: C.green + '1a', borderRadius: 14, padding: '12px 18px', textAlign: 'center' }}>
        <span style={{ color: C.green, fontWeight: 900, fontSize: 16 }}>Save {saving}/month 🎉</span>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 68, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 168, height: 168 }}>
      <svg width={168} height={168} viewBox="0 0 168 168">
        <circle cx={84} cy={84} r={r} fill="none" stroke={C.navy} strokeWidth={14} />
        <circle cx={84} cy={84} r={r} fill="none" stroke={C.green} strokeWidth={14}
          strokeDasharray={`${circ * score / 100} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 84 84)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: C.green }}>{score}</div>
        <div style={{ fontSize: 11, color: C.muted }}>Savings Score</div>
      </div>
    </div>
  );
}

function CTAScene() {
  return (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <LogoIcon size={76} />
        <Heading text={"Try MyBillPort\nfor free"} size={48} />
        <Sub text="Track every bill. Never pay a late fee again." />
        <div style={{ background: C.blue, borderRadius: 999, padding: '16px 44px',
          fontSize: 19, fontWeight: 900, color: C.white }}>mybillport.com</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          {['Free to start', 'No bank login'].map(t => (
            <div key={t} style={{ background: C.green + '18', border: `1.5px solid ${C.green}40`,
              color: C.green, borderRadius: 999, padding: '6px 16px',
              fontSize: 13, fontWeight: 700 }}>{t}</div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ─── Template data ─────────────────────────────────────────── */
type Scene = { label: string; script: string; el: React.ReactNode };
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
        label: 'Hook',
        script: 'POV: you just got a $35 late fee because you forgot your Rogers bill.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
              <Tag text="Relatable 😬" color={C.red} />
              <Heading text={"Missed a\nbill again?"} size={60} />
              <Sub text="Late fees cost Canadians $850M+ a year." />
            </div>
          </Frame>
        ),
      },
      {
        label: 'Pain',
        script: 'This Rogers bill was due 3 days ago. That\'s $35 you didn\'t need to pay.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
              <Sub text="Late fees are painful" color={C.red} />
              <BillCard biller="Rogers" amount="$89.99" dueText="Was due Apr 24 · 3 days late" status="overdue" />
              <div style={{ fontSize: 38, fontWeight: 900, color: C.red }}>+ $35 late fee 😬</div>
            </div>
          </Frame>
        ),
      },
      {
        label: 'Solution',
        script: 'MyBillPort reminds you before every bill is due. Never miss one again.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Tag text="We've got you" color={C.green} />
              <NotifBubble text="Rogers bill due in 3 days · Tap to pay $89.99" />
              <Heading text={"Smart reminders.\nZero late fees."} size={40} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckCircle size={18} color={C.green} />
                <span style={{ color: C.green, fontWeight: 700, fontSize: 15 }}>Sent before every due date</span>
              </div>
            </div>
          </Frame>
        ),
      },
      { label: 'CTA', script: 'Link in bio. Free to start, no bank login needed.', el: <CTAScene /> },
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
        label: 'Hook',
        script: 'The average Canadian pays $45 in late fees every year. Just for forgetting.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Tag text="Fun fact 🇨🇦" color={C.orange} />
              <Sub text="Average Canadian late fee per year" color={C.muted} />
              <div style={{ fontSize: 118, fontWeight: 900, color: C.red, lineHeight: 1 }}>$45</div>
              <Sub text="Just for forgetting. That's it." />
            </div>
          </Frame>
        ),
      },
      {
        label: 'One Tap',
        script: 'One tap marks a bill as paid. Takes 2 seconds. Late fee: avoided.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
              <Sub text="One tap. No stress." color={C.white} />
              <BillCard biller="Enbridge Gas" amount="$142.00" dueText="Due in 2 days" status="due" />
              <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                <div style={{ background: C.green + '22', border: `1.5px solid ${C.green}44`,
                  borderRadius: 16, padding: '15px 30px', color: C.green, fontWeight: 900, fontSize: 17 }}>
                  ✓ Mark as Paid
                </div>
              </div>
              <Sub text="Late fee: avoided ✅" color={C.green} />
            </div>
          </Frame>
        ),
      },
      {
        label: 'Score',
        script: 'Your Savings Score goes up every time you pay on time.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Tag text="Your score" color={C.green} />
              <ScoreRing score={85} />
              <Heading text={"You avoid 90%\nof late fees"} size={38} />
              <Sub text="Keep it up 🏆" color={C.orange} />
            </div>
          </Frame>
        ),
      },
      { label: 'CTA', script: 'Link in bio. Takes 30 seconds to add your first bill.', el: <CTAScene /> },
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
        label: 'Hook',
        script: 'Raise your hand if you\'re paying $89/month for internet when you could pay $55.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
              <Tag text="Hot take 🔥" color={C.orange} />
              <Heading text={"You're\noverpaying\nfor internet"} size={54} />
              <Sub text="Most Canadians do. Here's the fix." />
            </div>
          </Frame>
        ),
      },
      {
        label: 'Compare',
        script: 'Rogers charges $89. TekSavvy has the same speed for $55. MyBillPort found it.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <Sub text="MyBillPort found this for you" color={C.muted} />
              <SwitchCard from="$89/mo" to="$55/mo" saving="$34" />
              <Sub text="Same speed. Different bill." color={C.white} />
            </div>
          </Frame>
        ),
      },
      {
        label: 'Savings',
        script: 'That\'s $408 a year back in your pocket — automatically found by MyBillPort.',
        el: (
          <Frame>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
              <Tag text="Do the math 🧮" color={C.green} />
              <div style={{ fontSize: 22, color: C.muted }}>$34 × 12 months =</div>
              <div style={{ fontSize: 100, fontWeight: 900, color: C.green, lineHeight: 1 }}>$408</div>
              <Sub text="Back in your pocket. Every year." color={C.white} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <TrendingDown size={18} color={C.green} />
                <span style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>Found automatically</span>
              </div>
            </div>
          </Frame>
        ),
      },
      { label: 'CTA', script: 'Link in bio. Free — no bank login, no card needed.', el: <CTAScene /> },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function ReelStudio() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');
  const [copied, setCopied] = useState(false);

  /* We keep one ref per scene slot (max 4). Each export cycle we
     set sceneIdx → re-render → capture. */
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user === undefined) return;          // still loading
    setReady(true);
    if (user === null) return;
    const ok = ADMIN_EMAILS.length === 0     // no env set → allow (dev)
      || ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '');
    setIsAdmin(ok);
  }, [user]);

  /* ── copy script ── */
  const handleCopy = () => {
    const text = template.scenes.map((s, i) => `Scene ${i + 1} – ${s.label}\n"${s.script}"`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── export ZIP ── */
  const exportZip = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    const zip = new JSZip();
    const folder = zip.folder('scenes')!;
    const pngs: string[] = [];

    for (let i = 0; i < template.scenes.length; i++) {
      setSceneIdx(i);
      setExportMsg(`Capturing scene ${i + 1} / ${template.scenes.length}…`);
      // wait two frames for React to paint
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise(r => setTimeout(r, 180));
      try {
        const uri = await toPng(previewRef.current!, { pixelRatio: 2, cacheBust: true });
        pngs.push(uri);
        folder.file(
          `scene-${i + 1}-${template.scenes[i].label.toLowerCase().replace(/\s+/g, '-')}.png`,
          uri.split(',')[1],
          { base64: true },
        );
      } catch (e) { console.error('capture', e); }
    }

    // script.txt
    const scriptTxt = [
      `MyBillPort Reel – ${template.title}`,
      `Generated: ${new Date().toLocaleDateString('en-CA')}`,
      '',
      ...template.scenes.map((s, i) =>
        `Scene ${i + 1} – ${s.label} (3–4 sec)\n"${s.script}"`),
    ].join('\n\n');
    zip.file('script.txt', scriptTxt);

    // README.md
    zip.file('README.md', [
      `# MyBillPort Reel — ${template.title}`,
      '',
      '## How to assemble in CapCut / InShot',
      '1. Create a new **9:16** project (1080 × 1920)',
      '2. Add each scene image in order — 3 to 4 seconds each',
      '3. Paste the captions from script.txt as on-screen text',
      '4. Add a trending audio track (low volume if using voiceover)',
      '5. Export at 1080 × 1920 and post!',
      '',
      '## Scene order',
      ...template.scenes.map((s, i) => `${i + 1}. **${s.label}** — "${s.script}"`),
      '',
      '> mybillport.com',
    ].join('\n'));

    setExportMsg('Building ZIP…');
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mybillport-reel-${template.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExporting(false);
    setExportMsg('');
    setSceneIdx(0);
  }, [template]);

  /* ── auth states ── */
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0d1829] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d1829] flex flex-col items-center justify-center gap-4">
        <Lock className="w-8 h-8 text-slate-500" />
        <p className="text-slate-400">Please <Link href="/login" className="text-[#4D6A9F] underline">sign in</Link> to access Reel Studio.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1829] flex flex-col items-center justify-center gap-4 text-center px-6">
        <ShieldCheck className="w-10 h-10 text-slate-600" />
        <p className="text-white font-bold text-lg">Access denied</p>
        <p className="text-slate-400 text-sm max-w-xs">
          This tool is restricted to admin accounts.<br />
          Set <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_ADMIN_EMAILS</code> in your environment to your email address.
        </p>
        <Link href="/dashboard" className="text-[#4D6A9F] text-sm hover:underline">← Back to dashboard</Link>
      </div>
    );
  }

  const scene = template.scenes[sceneIdx];

  return (
    <div className="min-h-screen bg-[#0d1829] text-white">

      {/* ── Header ── */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <Film className="w-5 h-5 text-[#4D6A9F]" />
              <span className="font-bold text-lg">Reel Studio</span>
            </div>
            <span className="text-xs bg-[#4D6A9F]/20 text-[#4D6A9F] px-2.5 py-0.5 rounded-full font-bold tracking-wide">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCopy}
              className="flex items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium px-4 py-2 rounded-xl transition-colors text-sm">
              {copied ? <Check className="w-4 h-4 text-[#6BCB77]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy script'}
            </button>
            <button onClick={exportZip} disabled={exporting}
              className="flex items-center gap-2 bg-[#6BCB77] hover:bg-[#5ab867] text-[#0d1829] font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-60 text-sm">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? exportMsg : 'Export ZIP'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[260px_1fr_280px] gap-8">

        {/* LEFT — template list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Templates</p>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { setTemplate(t); setSceneIdx(0); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                template.id === t.id
                  ? 'border-white/20 bg-white/[0.06]'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xl">{t.emoji}</span>
                <span className="font-bold text-sm text-white">{t.title}</span>
              </div>
              <div className="text-xs italic ml-8" style={{ color: t.color }}>{t.tagline}</div>
            </button>
          ))}

          <div className="mt-6 p-4 bg-[#1a2740] rounded-2xl border border-white/5 space-y-2">
            <p className="text-xs font-semibold text-slate-400">How to use</p>
            <ol className="text-xs text-slate-500 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Pick a template</li>
              <li>Preview each scene</li>
              <li>Click Export ZIP</li>
              <li>Open in CapCut / InShot</li>
              <li>Add audio &amp; post!</li>
            </ol>
          </div>
        </div>

        {/* CENTER — 9:16 preview */}
        <div className="flex flex-col items-center gap-5">
          <p className="text-sm text-slate-400">
            Scene <span className="text-white font-semibold">{sceneIdx + 1}</span> of {template.scenes.length}
            <span className="text-slate-600 mx-2">·</span>
            <span className="text-white">{scene.label}</span>
          </p>

          {/* Phone frame */}
          <div className="relative" style={{ width: 292, height: 633 }}>
            <div className="absolute inset-0 rounded-[34px] border-2 border-white/10 pointer-events-none z-10" />
            {/* scale 390×844 → 292×633 (factor 0.75) */}
            <div style={{ transform: 'scale(0.749)', transformOrigin: 'top left',
              width: 390, height: 844, borderRadius: 34, overflow: 'hidden' }}>
              <div ref={previewRef}>
                {scene.el}
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSceneIdx(i => Math.max(0, i - 1))}
              disabled={sceneIdx === 0}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-25 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {template.scenes.map((_, i) => (
                <button key={i} onClick={() => setSceneIdx(i)}
                  className={`rounded-full transition-all ${
                    i === sceneIdx ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                  }`} />
              ))}
            </div>
            <button onClick={() => setSceneIdx(i => Math.min(template.scenes.length - 1, i + 1))}
              disabled={sceneIdx === template.scenes.length - 1}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-25 hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600">9:16 vertical · exports at 780 × 1688 px (2×)</p>
        </div>

        {/* RIGHT — script panel */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Scene script</p>
            <div className="bg-[#1a2740] rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-slate-500 mb-2">Voiceover / caption text</p>
              <p className="text-sm text-white leading-relaxed font-medium">"{scene.script}"</p>
              <p className="mt-3 text-xs text-slate-600">Duration: 3–4 seconds</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">All scenes</p>
            <div className="space-y-2">
              {template.scenes.map((s, i) => (
                <button key={i} onClick={() => setSceneIdx(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all text-sm ${
                    i === sceneIdx
                      ? 'border-white/20 bg-white/[0.06] text-white'
                      : 'border-white/5 text-slate-400 hover:bg-white/[0.03]'
                  }`}>
                  <span className="text-slate-600 mr-2">#{i + 1}</span>
                  <span className="font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Export details</p>
            <div className="bg-[#1a2740] rounded-2xl p-4 border border-white/5 space-y-2.5">
              {[
                ['Format', '4 PNG scenes + ZIP'],
                ['Resolution', '780 × 1688 px (2×)'],
                ['Aspect ratio', '9:16 vertical'],
                ['Includes', 'script.txt + README.md'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-300 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={exportZip} disabled={exporting}
            className="w-full flex items-center justify-center gap-2 bg-[#6BCB77] hover:bg-[#5ab867] text-[#0d1829] font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? exportMsg || 'Exporting…' : 'Export ZIP for CapCut'}
          </button>

          <p className="text-xs text-slate-600 text-center">
            Need access?{' '}
            Set <code className="bg-white/5 px-1 rounded">NEXT_PUBLIC_ADMIN_EMAILS</code> in Vercel.
          </p>
        </div>
      </div>
    </div>
  );
}
