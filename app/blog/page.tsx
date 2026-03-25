import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { BLOG_POSTS } from './posts';

export const metadata: Metadata = {
  title: 'Bill Management Blog — Tips & Guides for Canadians | MyBillPort',
  description: 'Practical guides on tracking bills, avoiding late fees, and managing monthly expenses. Written for Canadians.',
  alternates: { canonical: 'https://mybillport.com/blog' },
  openGraph: {
    title: 'Bill Management Blog | MyBillPort',
    description: 'Practical guides on tracking bills, avoiding late fees, and managing monthly expenses.',
    url: 'https://mybillport.com/blog',
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-12">

        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-400">Blog</span>
        </nav>

        <header className="space-y-4">
          <p className="text-[#6BCB77] text-sm font-semibold uppercase tracking-wider">Bill Management Guides</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Practical Guides for Canadians</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Straightforward advice on tracking bills, avoiding late fees, and keeping your monthly finances organized.
          </p>
        </header>

        <div className="space-y-4">
          {BLOG_POSTS.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-[#1a2535] border border-white/5 rounded-2xl p-6 hover:border-[#4D6A9F]/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white group-hover:text-[#4D6A9F] transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                    <span>·</span>
                    <span>{post.publishedDate}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#4D6A9F] transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-[#1a2535] border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">More Guides</h2>
          <ul className="space-y-3">
            {[
              { label: 'How to track bills in one place', href: '/how-to-track-bills' },
              { label: 'How to avoid late fees on bills', href: '/avoid-late-fees' },
              { label: 'The best Canadian bill tracker', href: '/bill-tracker-canada' },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-2 text-[#4D6A9F] hover:text-white transition-colors text-sm font-medium">
                  <ArrowRight className="w-4 h-4" /> {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
