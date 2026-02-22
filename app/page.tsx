'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  Clock, 
  Smartphone, 
  Sparkles,
  Mail,
  ArrowRight,
  Bell,
  Shield,
  Zap,
  Receipt,
  DollarSign
} from "lucide-react";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-transform group-hover:scale-105">
              <div className="relative">
                <Receipt className="text-white w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-teal-500/30">
                  <DollarSign className="text-teal-400 w-3 h-3" />
                </div>
              </div>
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">
              My<span className="text-teal-500">BillPort</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app">
              <button className="btn-accent rounded-full px-6 py-2">
                Open App
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-slate-600">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Built for Canadians
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              All your bills.{" "}
              <span className="text-gradient">
                One simple app.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Track every bill, get smart reminders, and never miss a payment again. 
              Simple. Trustworthy. Built for real life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <button className="btn-accent rounded-full px-8 py-4 text-lg shadow-lg flex items-center gap-2 mx-auto">
                  Get Early Access
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </FadeIn>

          {/* Phone Mockup */}
          <FadeIn delay={0.2} className="mt-16">
            <div className="relative max-w-sm mx-auto">
              <div className="w-72 mx-auto bg-slate-800 rounded-[2.5rem] p-3 shadow-2xl shadow-black/50 border border-slate-700">
                <div className="w-full h-[500px] bg-slate-900 rounded-[2rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="px-6 py-3 flex justify-between items-center">
                    <span className="text-xs text-slate-500">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-slate-600 rounded-sm"></div>
                      <div className="w-6 h-3 bg-teal-500 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App Header */}
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                        <div className="relative">
                          <Receipt className="text-white w-5 h-5" />
                          <DollarSign className="text-teal-200 w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5" />
                        </div>
                      </div>
                      <span className="text-white font-bold tracking-tighter text-lg">My<span className="text-teal-500">BillPort</span></span>
                    </div>
                    <p className="text-slate-400 text-sm">Good morning</p>
                    <p className="text-white text-xl font-semibold">Here&apos;s your overview</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="px-4 grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                      <p className="text-lg font-bold text-white">5</p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                      <p className="text-lg font-bold text-amber-400">2</p>
                      <p className="text-xs text-slate-500">Due Soon</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
                      <p className="text-lg font-bold text-red-400">0</p>
                      <p className="text-xs text-slate-500">Overdue</p>
                    </div>
                  </div>

                  {/* Bill Cards */}
                  <div className="px-4 space-y-2">
                    <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">Toronto Hydro</p>
                        <p className="text-xs text-amber-500">Due in 2 days</p>
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">$142.50</p>
                    </div>

                    <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-sm">📶</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">Rogers Internet</p>
                        <p className="text-xs text-teal-600">Due in 8 days</p>
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">$89.99</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -right-4 top-32 bg-white rounded-xl p-3 shadow-lg animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">Reminder</p>
                    <p className="text-xs text-slate-500">Hydro due soon</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple bill management, done right
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              No complexity. No clutter. Just a calm, clear view of what&apos;s due.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Smart Reminders", description: "Get notified 7 days, 2 days, and the day before each bill is due." },
              { icon: Shield, title: "Bank-grade Security", description: "Your data is encrypted and protected. We never sell your information." },
              { icon: Bell, title: "Never Miss a Payment", description: "Clear status indicators show exactly what needs attention." },
              { icon: Smartphone, title: "Mobile First Design", description: "Built for your phone. Check bills anytime, anywhere." },
              { icon: Sparkles, title: "Made for Canada", description: "Supports CAD and all major Canadian service providers." },
              { icon: CheckCircle, title: "Peace of Mind", description: "Stop worrying about late fees. We've got your back." }
            ].map((feature, index) => (
              <FadeIn
                key={index}
                delay={index * 0.05}
                className="card-dark p-6 hover:border-slate-500/40 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-700/50 group-hover:bg-slate-700/80 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start managing your bills today
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Take control of your bills with a simple, trusted Canadian app.
            </p>

            {isSubmitted ? (
              <div className="bg-teal-500/10 backdrop-blur rounded-2xl p-6 max-w-md mx-auto border border-teal-500/20">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">You&apos;re on the list!</h3>
                <p className="text-slate-400">We&apos;ll notify you when new features launch.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Link href="/app">
                  <button className="btn-accent rounded-full px-10 py-4 text-lg font-semibold flex items-center gap-2 mx-auto">
                    Open App
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                
                <p className="text-slate-500 text-sm">
                  Or join our newsletter for updates
                </p>
                
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-full px-6 py-3"
                  />
                  <button 
                    type="submit"
                    className="bg-slate-700 hover:bg-slate-600 text-white rounded-full px-6 py-3 flex items-center gap-2 justify-center"
                  >
                    Subscribe
                    <Mail className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                <div className="relative">
                  <Receipt className="text-white w-6 h-6" />
                  <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-teal-500/30">
                    <DollarSign className="text-teal-400 w-3 h-3" />
                  </div>
                </div>
              </div>
              <span className="font-bold text-2xl tracking-tighter text-white">
                My<span className="text-teal-500">BillPort</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:mybillportinfo@gmail.com" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-slate-500 text-sm">
              &copy; 2026 MyBillPort. Made with care in Canada.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
