import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Camera, 
  Bot, 
  CheckCircle, 
  Lock, 
  Clock, 
  Smartphone, 
  Sparkles,
  ChevronDown,
  Mail,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function Float({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`animate-bounce ${className}`} style={{ animationDuration: '3s' }}>
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-semibold text-xl text-slate-800">MyBillPort</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <Link href="/app">
              <Button variant="outline" className="rounded-full">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Built for Canadians
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                All your bills.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                  One simple app.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-lg">
                Track, scan, and manage every bill in one place — without stress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/app">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-blue-200"
                  >
                    Get Early Access
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg border-slate-200"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See How It Works
                  <ChevronDown className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </FadeIn>

            {/* Phone Mockup */}
            <FadeIn delay={0.2} className="relative flex justify-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-72 h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-slate-300">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-slate-50 px-6 py-3 flex justify-between items-center">
                      <span className="text-xs text-slate-600">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-slate-400 rounded-sm"></div>
                        <div className="w-4 h-2 bg-slate-400 rounded-sm"></div>
                        <div className="w-6 h-3 bg-emerald-500 rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* App Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                      <p className="text-blue-100 text-sm">Welcome back,</p>
                      <p className="text-white text-xl font-semibold">John Doe</p>
                    </div>

                    {/* Balance Card */}
                    <div className="px-4 -mt-2">
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
                        <p className="text-slate-400 text-sm">Total Due This Month</p>
                        <p className="text-3xl font-bold mt-1">$487.24</p>
                        <div className="flex justify-between mt-3 text-xs">
                          <span className="text-emerald-400">3 bills paid</span>
                          <span className="text-amber-400">2 upcoming</span>
                        </div>
                      </div>
                    </div>

                    {/* Bill Cards */}
                    <div className="px-4 mt-4 space-y-3">
                      <p className="text-slate-500 text-sm font-medium px-1">Upcoming Bills</p>
                      
                      <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 text-lg">⚡</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">Hydro One</p>
                          <p className="text-xs text-red-500">Due tomorrow</p>
                        </div>
                        <p className="font-semibold text-slate-800">$187.45</p>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-lg">🔥</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">Enbridge Gas</p>
                          <p className="text-xs text-amber-500">Due in 3 days</p>
                        </div>
                        <p className="font-semibold text-slate-800">$156.80</p>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 text-lg">📱</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">Rogers Wireless</p>
                          <p className="text-xs text-slate-400">Due in 7 days</p>
                        </div>
                        <p className="font-semibold text-slate-800">$125.00</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <Float className="absolute -right-8 top-20 bg-white rounded-xl p-3 shadow-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">Bill Paid!</p>
                      <p className="text-xs text-slate-500">Netflix - $22.99</p>
                    </div>
                  </div>
                </Float>

                <Float className="absolute -left-12 bottom-32 bg-white rounded-xl p-3 shadow-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">AI Detected</p>
                      <p className="text-xs text-slate-500">New bill found</p>
                    </div>
                  </div>
                </Float>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Getting started takes less than a minute. Here's how simple it is.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                step: "1",
                title: "Scan or connect",
                description: "Take a photo of any bill or connect your email to auto-import",
                color: "blue"
              },
              {
                icon: Bot,
                step: "2",
                title: "We organize it",
                description: "AI automatically extracts details and tracks due dates",
                color: "emerald"
              },
              {
                icon: CheckCircle,
                step: "3",
                title: "Stay stress-free",
                description: "Get reminders and pay on time, every time",
                color: "amber"
              }
            ].map((item, index) => (
              <FadeIn
                key={index}
                delay={index * 0.1}
                className="relative"
              >
                <div className="bg-slate-50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                    item.color === 'blue' ? 'bg-blue-100' :
                    item.color === 'emerald' ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    <item.icon className={`w-8 h-8 ${
                      item.color === 'blue' ? 'text-blue-600' :
                      item.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-slate-400 border border-slate-200">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Why People Love It */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why People Love It
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with care to make managing bills actually enjoyable.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: "Bank-grade security", description: "Your data is encrypted and protected with the same security banks use." },
              { icon: Bot, title: "Smart AI detection", description: "Our AI reads your bills and extracts all the important details automatically." },
              { icon: Clock, title: "Never miss a date", description: "Smart reminders ensure you're always on time with every payment." },
              { icon: Smartphone, title: "Beautiful mobile app", description: "Designed to feel as good as your favorite apps — smooth and intuitive." },
              { icon: Sparkles, title: "Built for Canada", description: "Supports all major Canadian utilities, telecoms, and service providers." },
              { icon: CheckCircle, title: "Peace of mind", description: "Stop worrying about bills. We've got your back, every month." }
            ].map((feature, index) => (
              <FadeIn
                key={index}
                delay={index * 0.05}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social Trust */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Coming Soon
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Designed to become your daily money app
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              We're building MyBillPort to be as essential as your phone. The first app you install. 
              The one you actually love using.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Early access launching soon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Canadian-first approach</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Privacy-focused</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Make MyBillPort the first app you install
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Join our waitlist and be the first to experience stress-free bill management.
            </p>

            {isSubmitted ? (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-md mx-auto transition-all">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
                <p className="text-blue-100">We'll notify you as soon as MyBillPort is ready.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200 rounded-full px-6 py-6 backdrop-blur"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 rounded-full px-8 py-6 font-semibold"
                >
                  Join Waitlist
                  <Mail className="ml-2 w-5 h-5" />
                </Button>
              </form>
            )}

            <p className="text-blue-200 text-sm mt-6">
              No spam, ever. Unsubscribe anytime.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-semibold text-xl text-white">MyBillPort</span>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 MyBillPort. Made with ❤️ in Canada.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
