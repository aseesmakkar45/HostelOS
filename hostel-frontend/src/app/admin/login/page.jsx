'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password, 'admin');
      if (res.success) {
        router.push('/dashboard/admin');
      } else {
        setError(res.error || 'Invalid administrator credentials');
      }
    } catch (err) {
      setError('System authentication fault. Check console or contact network desk.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans justify-between relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#1e1b4b] pointer-events-none z-0"></div>
      <div className="absolute top-20 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-0"></div>

      {/* Header */}
      <header className="w-full py-6 px-10 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-white font-extrabold text-2xl tracking-tight">CampusStay</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">System Operational</span>
          </div>
          <span className="text-white/40 text-xs hidden sm:inline">v4.2.0-Enterprise</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Central Operations <br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Administration Panel</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                Configure hostel structures, execute financial ledger audit sweeps, schedule staff rosters, and monitor enterprise platform safety.
              </p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Load Factor</p>
                <p className="text-xl font-bold">92% Cap</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ledgers Status</p>
                <p className="text-xl font-bold text-emerald-400">Audited</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Core Engines</p>
                <p className="text-xl font-bold text-indigo-400">Online</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Secure Terminal Login</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Authorized personnel only.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="admin@campusstay.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all text-white"
                    required
                  />
                </div>
              </div>


              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Verifying Credentials...' : 'Authenticate Terminal'}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-400 flex flex-wrap justify-center gap-4 font-bold uppercase tracking-wider border-t border-white/5 pt-6">
              <Link href="/login" className="hover:text-indigo-400">Warden Portal</Link>
              <span>•</span>
              <Link href="/student/login" className="hover:text-indigo-400">Student Portal</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Security Protocols</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Governance</a>
        </div>
        <p className="text-white/20 font-medium tracking-normal normal-case">&copy; 2026 CampusStay Enterprise Operations. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
