'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GateKioskLogin() {
  const router = useRouter();
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [useBiometrics, setUseBiometrics] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Simulated terminal authentication
    setTimeout(() => {
      if (staffId && pin) {
        router.push('/gate');
      } else {
        setError('Authentication credentials rejected. Check code.');
        setSubmitting(false);
      }
    }, 1200);
  };

  const triggerSOS = () => {
    alert('ALERT: SOS Alarm Broadcasted to Campus Warden Network.');
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff ID Card Number</label>
                <div className="relative">
                  <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter Staff ID (e.g. SGT-409)"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access PIN Code</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    maxLength="6"
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 text-2xl font-bold tracking-widest focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <label className="flex items-center gap-3 cursor-pointer select-none font-bold text-slate-500">
                  <input
                    type="checkbox"
                    checked={useBiometrics}
                    onChange={(e) => setUseBiometrics(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Enable FaceID / Biometric Bypass
                </label>
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
            <Link href="/student/login" className="hover:text-indigo-600">Student Portal</Link>
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
                <span className={`text-xs font-bold ${useBiometrics ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {useBiometrics ? 'Online' : 'Disabled'}
                </span>
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
            <p className="text-[10px] font-bold text-slate-400 tracking-tight">OFC. ANDREWS @ 06:12 AM</p>
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
