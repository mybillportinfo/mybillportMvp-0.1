import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { BLOG_POSTS, getPostBySlug, Section } from '../posts';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | MyBillPort`,
    description: post.metaDescription,
    alternates: { canonical: `https://mybillport.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://mybillport.com/blog/${post.slug}`,
    },
  };
}

function renderSection(section: Section, index: number) {
  switch (section.type) {
    case 'h2':
      return <h2 key={index} className="text-xl font-bold text-white mt-10 mb-3">{section.text}</h2>;
    case 'h3':
      return <h3 key={index} className="text-base font-bold text-white mt-6 mb-2">{section.text}</h3>;
    case 'p':
      return <p key={index} className="text-slate-400 leading-relaxed">{section.text}</p>;
    case 'ul':
      return (
        <ul key={index} className="space-y-2 mt-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex gap-2 text-slate-400 text-sm">
              <span className="text-[#4D6A9F] mt-1.5 flex-shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={index} className="space-y-3 mt-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex gap-3 text-slate-400 text-sm">
              <span className="w-6 h-6 bg-[#4D6A9F]/15 text-[#4D6A9F] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div key={index} className="flex gap-3 bg-[#6BCB77]/5 border border-[#6BCB77]/15 rounded-xl px-4 py-3 mt-2">
          <CheckCircle className="w-4 h-4 text-[#6BCB77] flex-shrink-0 mt-0.5" />
          <p className="text-[#6BCB77] text-sm font-medium">{section.text}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const otherPosts = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#060d1a] text-white">
      <div className="max-w-3xl mx-auto px-5 py-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2 mb-10">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-48">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="space-y-5 mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{post.title}</h1>
          <p className="text-slate-400 text-lg leading-relaxed">{post.excerpt}</p>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{post.readTime}</span>
            <span>·</span>
            <span>{post.publishedDate}</span>
          </div>
        </header>

        {/* Content */}
        <article className="space-y-4">
          {post.content.map((section, i) => renderSection(section, i))}
        </article>

        {/* Related link */}
        <div className="mt-12 bg-[#1a2535] border border-[#4D6A9F]/20 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Related guide</p>
            <p className="text-white font-semibold text-sm">{post.relatedPage.label}</p>
          </div>
          <Link href={post.relatedPage.href} className="flex items-center gap-2 text-sm font-semibold text-[#4D6A9F] hover:text-white transition-colors whitespace-nowrap">
            Read → <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* CTA */}
        <section className="mt-10 bg-gradient-to-br from-[#4D6A9F]/20 to-[#6BCB77]/10 border border-[#4D6A9F]/20 rounded-3xl p-8 text-center space-y-5">
          <h2 className="text-xl font-bold text-white">Try MyBillPort — Free for Canadians</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">Track all your bills in one dashboard. Push notifications before every due date. Takes 2 minutes to set up.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* More posts */}
        {otherPosts.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg font-bold text-white">More Guides</h2>
            <div className="space-y-3">
              {otherPosts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="flex items-center justify-between gap-4 p-4 bg-[#1a2535] border border-white/5 rounded-xl hover:border-[#4D6A9F]/30 transition-colors group">
                  <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-1">{p.title}</p>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-[#4D6A9F] flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
            <Link href="/blog" className="flex items-center gap-2 text-sm text-[#4D6A9F] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
