import React from 'react';
import { TrendingUp, Shield, Zap, BarChart3, Brain, Lock, Star } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis , Tooltip } from 'recharts';
import {useNavigate } from "react-router-dom"
const chartData = [
  { time: '00:00', price: 42000 },
  { time: '04:00', price: 43200 },
  { time: '08:00', price: 42800 },
  { time: '12:00', price: 44500 },
  { time: '16:00', price: 45200 },
  { time: '20:00', price: 46800 },
  { time: '24:00', price: 47500 },
];

const features = [
  { icon: BarChart3, title: 'Real-Time Charts', desc: 'Advanced charting tools with live market data' },
  { icon: TrendingUp, title: 'Portfolio Tracking', desc: 'Monitor your investments in real-time' },
  { icon: Brain, title: 'AI Insights', desc: 'Smart analytics powered by machine learning' },
  { icon: Shield, title: 'Bank-Grade Security', desc: 'Your assets protected with enterprise security' },
  { icon: Zap, title: 'Instant Execution', desc: 'Lightning-fast trade execution' },
  { icon: Lock, title: 'Secure Trading', desc: '2FA and encryption for all transactions' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Day Trader', text: 'Best trading platform I\'ve used. The AI insights are game-changing.', rating: 5 },
  { name: 'Michael Rodriguez', role: 'Investor', text: 'Clean interface and powerful tools. Highly recommend for serious traders.', rating: 5 },
  { name: 'Emma Thompson', role: 'Portfolio Manager', text: 'Professional-grade platform with excellent customer support.', rating: 5 },
];

export function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
const navigator = useNavigate();


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0D1117] dark:via-[#0D1117] dark:to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20">
              <Zap className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-teal-600 dark:text-teal-400">Trusted by 500K+ traders worldwide</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Trade Smarter, <br />Invest Better
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg">
              Advanced trading platform with real-time data, AI-powered insights, and institutional-grade tools.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigator("/login")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all"
              >
                Start Trading Free
              </button>
              <button 
                onClick={() => navigator("/dashboard")}
                className="px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                View Demo
              </button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 border-2 border-white dark:border-slate-900" />
                ))}
              </div>
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">4.9/5 from 10,000+ reviews</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl blur-3xl opacity-20" />
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">BTC/USD</p>
                  <p className="text-3xl text-slate-900 dark:text-white mt-1">$47,500.00</p>
                  <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +12.5% Today
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  Live
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    dot={false}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-slate-900 dark:text-white mb-4">Everything You Need to Trade</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">Professional tools for serious traders</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-slate-900 dark:text-white mb-4">Trusted by Traders</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">See what our users have to say</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-6">{testimonial.text}</p>
              <div>
                <p className="text-slate-900 dark:text-white">{testimonial.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Security Badges */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap items-center justify-center gap-8 py-8 border-t border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-500" />
            <div>
              <p className="text-sm text-slate-900 dark:text-white">Bank-Level Security</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">256-bit encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-8 h-8 text-teal-500" />
            <div>
              <p className="text-sm text-slate-900 dark:text-white">2FA Protected</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Multi-factor auth</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-500" />
            <div>
              <p className="text-sm text-slate-900 dark:text-white">Licensed & Regulated</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">SEC compliant</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500" />
          <div className="relative px-8 py-16 text-center">
            <h2 className="text-4xl text-white mb-4">Ready to Start Trading?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of traders using our platform to trade smarter
            </p>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-all"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
