'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, Eye, EyeOff, Mail, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GateKioskLogin() {
  const router = useRouter();
  const { login, showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Authenticate against database. We send 'admin' as default role fallback,
      // but the backend will return the user's actual database role.
      const res = await login(email, password, 'admin');
      
      if (res.success) {
        // Enforce that only security admin or wardens can unlock the gate console
        if (res.user.role === 'admin' || res.user.role === 'warden') {
          router.push('/gate');
        } else {
          setError('Unauthorized: Only Warden or Admin accounts can unlock this console.');
        }
      } else {
        setError(res.error || 'Authentication credentials rejected.');
      }
    } catch (err) {
      setError('Connection refused. Database verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerSOS = () => {
    if (showToast) showToast('ALERT: SOS Alarm Broadcasted to Campus Warden Network.', 'error');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex text-white overflow-hidden font-sans">
      
      {/* Main Form Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative p-8 z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-[0.15em] mb-4 text-white">GATE ENTRY SYSTEM</h1>
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Authorized Security Terminal Access Only</p>
        </div>

        <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-10 md:p-12 text-slate-900 shadow-2xl shadow-black/50 border border-slate-100">
          <div className="space-y-8">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">Security Officer Login</h3>
                <p className="text-xs text-slate-400 font-medium">Verify credentials to initialize AI scanners.</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="security@hostel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-12 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Initializing AI Terminal...' : 'Unlock Security Console'}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400 flex flex-wrap justify-center gap-4 font-bold uppercase tracking-wider border-t border-slate-100 pt-6">
            <Link href="/login" className="hover:text-indigo-600">Warden Portal</Link>
            <span>•</span>
            <Link href="/" className="hover:text-indigo-600">Main Portal Selection</Link>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Terminal Stats */}
      <aside className="w-80 bg-slate-950 border-l border-slate-800 p-8 hidden lg:flex flex-col justify-between relative z-10">
        <div className="space-y-8">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Node Health</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Core Network</span>
                <span className="text-xs font-bold text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">AI Scanning Core</span>
                <span className="text-xs font-bold text-emerald-400">Ready</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Biometrics Hub</span>
                <span className="text-xs font-bold text-emerald-400">Online</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/30 p-4 rounded-2xl border border-indigo-500/20">
            <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Terminal Uptime</p>
            <p className="text-base font-bold">142 Hours, 22 Mins</p>
          </div>
        </div>

        <div className="space-y-6 pt-10">
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Last Secure Login</p>
            <p className="text-[10px] font-bold text-slate-400 tracking-tight">OFC. SINGH @ 06:12 AM</p>
          </div>
          <button
            onClick={triggerSOS}
            className="w-full h-14 bg-rose-600/10 border border-rose-600/30 text-rose-500 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
          >
            Emergency SOS
          </button>
        </div>
      </aside>

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
