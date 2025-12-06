'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Mail, Lock, Loader2, ChevronRight, Wheat, Gem, TreePine, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect based on role
      const role = data.data.user.role;
      if (role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN') {
        router.push('/dashboard');
      } else if (role === 'PRODUCER') {
        router.push('/dashboard');
      } else if (role === 'BUYER') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(212, 168, 83, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)`
        }} />
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600
              flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Globe className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">SRGG</h1>
              <p className="text-sm text-slate-400 tracking-widest uppercase">Marketplace</p>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Quantified. Insured.<br />
            Hedged. Tokenized.
          </h2>
          <p className="text-lg text-slate-400 mb-12 max-w-md">
            The global marketplace for African & LATAM commodities,
            cultural IP, and carbon credits.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Wheat, label: 'Agriculture', desc: 'Cocoa, Coffee, Grains' },
              { icon: Gem, label: 'Minerals', desc: 'Gold, Diamonds, Bauxite' },
              { icon: TreePine, label: 'Carbon Credits', desc: 'Forest & Mangrove' },
              { icon: Shield, label: 'Insured', desc: "Lloyd's Integration" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30
                  rounded-xl p-4 hover:border-amber-500/30 transition-all">
                  <Icon className="w-6 h-6 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold text-white">$18.5M+</p>
              <p className="text-sm text-slate-500">Assets Tokenized</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">2,847</p>
              <p className="text-sm text-slate-500">Active Producers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-sm text-slate-500">Countries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600
              flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">SRGG</h1>
              <p className="text-xs text-slate-500 tracking-widest uppercase">Marketplace</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-slate-400">Sign in to access your dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                      text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50
                      focus:ring-1 focus:ring-amber-500/20 transition-all"
                    placeholder="admin@srgg.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                      text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50
                      focus:ring-1 focus:ring-amber-500/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r
                  from-amber-500 to-amber-600 rounded-xl text-white font-semibold
                  hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Login */}
            <div className="mt-8">
              <p className="text-center text-xs text-slate-500 mb-4">Quick Login (Demo)</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => quickLogin('admin@srgg.com', 'Admin123!')}
                  className="px-3 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl
                    text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => quickLogin('producer@srgg.com', 'Producer123!')}
                  className="px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl
                    text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  Producer
                </button>
                <button
                  onClick={() => quickLogin('buyer@srgg.com', 'Buyer123!')}
                  className="px-3 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl
                    text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
                >
                  Buyer
                </button>
              </div>
            </div>

            {/* Test Credentials */}
            <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
              <p className="text-xs font-semibold text-slate-400 mb-2">Test Credentials:</p>
              <div className="space-y-1 text-xs text-slate-500">
                <p><span className="text-slate-400">Admin:</span> admin@srgg.com / Admin123!</p>
                <p><span className="text-slate-400">Producer:</span> producer@srgg.com / Producer123!</p>
                <p><span className="text-slate-400">Buyer:</span> buyer@srgg.com / Buyer123!</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-600">
            © 2025 SRGG Marketplace • Built for Africa & LATAM
          </p>
        </div>
      </div>
    </div>
  );
}
