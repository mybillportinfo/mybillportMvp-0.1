'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Wand2, Download, Loader2, Image as ImageIcon, ChevronDown, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

const PROMPT_TEMPLATES = [
  {
    label: 'App Store Screenshot',
    prompt: 'A clean, premium mobile app screenshot showing a bill management dashboard with a dark navy background. Modern fintech UI with bill cards, status badges in green and orange, and a sleek navigation bar. Professional, minimal, app store ready.',
  },
  {
    label: 'Product Hunt Banner',
    prompt: 'A Product Hunt launch banner for "MyBillPort" — a bill management app. Dark navy background, teal and green accents, bold typography, featuring a phone mockup of the app dashboard. Clean, modern, professional.',
  },
  {
    label: 'Social Media Post',
    prompt: 'A square social media graphic for MyBillPort bill management app. Bold headline "Never Miss a Bill Again". Dark background with teal and green gradient accents. Clean modern fintech style with subtle bill/receipt icons.',
  },
  {
    label: 'Email Header Banner',
    prompt: 'A wide email header banner for MyBillPort. Dark navy gradient background, logo area on left, tagline "Your bills. Managed." on right. Professional, clean, fintech aesthetic with green accent.',
  },
  {
    label: 'Feature Illustration',
    prompt: 'A flat-style illustration of a smartphone displaying a bill management app with bills neatly organized on screen. Soft dark navy background with teal and green icons. Modern, clean, minimal.',
  },
];

const SIZE_OPTIONS = [
  { value: '1024x1024', label: '1:1 Square (1024×1024)' },
  { value: '1792x1024', label: '16:9 Landscape (1792×1024)' },
  { value: '1024x1792', label: '9:16 Portrait (1024×1792)' },
];

const QUALITY_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'hd', label: 'HD (2× detail)' },
];

const STYLE_OPTIONS = [
  { value: 'vivid', label: 'Vivid (hyper-real)' },
  { value: 'natural', label: 'Natural (realistic)' },
];

interface GeneratedImage {
  url: string;
  revised_prompt: string;
}

export default function GenerateAssetsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [style, setStyle] = useState('vivid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<{ prompt: string; images: GeneratedImage[] }[]>([]);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !isAdmin) {
      router.push('/app');
    }
  }, [user, loading, isAdmin, router]);

  const getToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    setImages([]);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, size, quality, style }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          toast.error('OpenAI API key not configured. Add OPENAI_API_KEY to your environment variables.');
        } else {
          toast.error(data.error || 'Generation failed');
        }
        return;
      }
      setImages(data.images || []);
      setHistory(prev => [{ prompt, images: data.images || [] }, ...prev.slice(0, 9)]);
      toast.success('Image generated!');
    } catch {
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `mybillport-asset-${Date.now()}-${index + 1}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4D6A9F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <div className="max-w-4xl mx-auto px-5 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/app" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-[#4D6A9F]" />
              Marketing Asset Generator
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Generate images with DALL-E 3 for app store, social media, and Product Hunt</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200/80 space-y-1">
            <p className="font-medium text-amber-300">OpenAI API key required</p>
            <p>Add <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">OPENAI_API_KEY</code> to your Replit secrets and Vercel environment variables to enable generation. Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline">platform.openai.com</a>.</p>
          </div>
        </div>

        <div className="bg-[#1a2535] border border-white/5 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quick templates</label>
            <div className="flex flex-wrap gap-2">
              {PROMPT_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setPrompt(t.prompt)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#4D6A9F]/30 text-[#7a9fd4] hover:bg-[#4D6A9F]/10 hover:border-[#4D6A9F]/50 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prompt <span className="text-slate-500">({prompt.length}/1000)</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, 1000))}
              placeholder="Describe the marketing image you want to generate..."
              rows={4}
              className="w-full px-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4D6A9F] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Size</label>
              <select
                value={size}
                onChange={e => setSize(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4D6A9F]"
              >
                {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Quality</label>
              <select
                value={quality}
                onChange={e => setQuality(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4D6A9F]"
              >
                {QUALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Style</label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full px-3 py-2 bg-[#111827] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4D6A9F]"
              >
                {STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3.5 bg-[#4D6A9F] hover:bg-[#3d5a8f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating with DALL-E 3...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>
        </div>

        {images.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Generated Images</h2>
            <div className="grid grid-cols-1 gap-6">
              {images.map((img, i) => (
                <div key={i} className="bg-[#1a2535] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="relative">
                    <img src={img.url} alt="Generated asset" className="w-full object-contain max-h-[600px]" />
                  </div>
                  <div className="p-5 space-y-3">
                    {img.revised_prompt && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <span className="text-slate-400 font-medium">Revised prompt: </span>
                        {img.revised_prompt}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDownload(img.url, i)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download PNG
                      </button>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium rounded-lg transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Open full size
                      </a>
                    </div>
                    <p className="text-xs text-slate-600">Note: OpenAI image URLs expire after ~1 hour. Download immediately.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Session History</h2>
            <div className="space-y-3">
              {history.slice(1).map((h, i) => (
                <div key={i} className="bg-[#1a2535] border border-white/5 rounded-xl p-4 flex gap-4 items-start">
                  {h.images[0] && (
                    <img src={h.images[0].url} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 line-clamp-2">{h.prompt}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => { setPrompt(h.prompt); setImages(h.images); window.scrollTo(0, 0); }}
                        className="text-xs text-[#4D6A9F] hover:underline"
                      >
                        Reuse prompt
                      </button>
                      {h.images[0] && (
                        <button
                          onClick={() => handleDownload(h.images[0].url, 0)}
                          className="text-xs text-slate-500 hover:text-white"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
