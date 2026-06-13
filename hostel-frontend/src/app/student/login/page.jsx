'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function StudentLogin() {
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
      const res = await login(email, password, 'student');
      if (res.success) {
        router.push('/dashboard/student');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection refused. Demo mode enabled. Log in anyway.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background patterns and blur circles */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-100 rounded-full blur-[100px] opacity-60 z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-100 rounded-full blur-[100px] opacity-60 z-0"></div>

      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative z-10 border border-slate-100">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-800">CampusStay</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Student Portal</h2>
            <p className="text-sm text-slate-400 font-semibold mt-1">Manage your room keys, passes, complaints, and billing schedules.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Student Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="student@campusstay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between ml-1 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Remember Me
              </label>
              <a href="#" className="text-indigo-600 hover:underline">Forgot?</a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Connecting...' : 'Secure Log In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Sign-on Option */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or login using</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setEmail('student@campusstay.com');
                  setPassword('password');
                  alert('Mock credentials pre-filled. Press Secure Log In.');
                }}
                className="flex-1 h-12 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Use Single Sign-On (SSO)
              </button>
            </div>
          </div>

          {/* Portal Switcher Footer */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Other Portals</p>
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/login"
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-extrabold text-slate-700 group-hover:text-indigo-700 uppercase tracking-wide">Warden</p>
                  <p className="text-[9px] text-slate-400 font-medium">Staff Portal</p>
                </div>
              </Link>

              <Link
                href="/admin/login"
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-extrabold text-slate-700 group-hover:text-purple-700 uppercase tracking-wide">Admin</p>
                  <p className="text-[9px] text-slate-400 font-medium">Management</p>
                </div>
              </Link>

              <Link
                href="/gate/login"
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-extrabold text-slate-700 group-hover:text-emerald-700 uppercase tracking-wide">Gate AI</p>
                  <p className="text-[9px] text-slate-400 font-medium">Entry Kiosk</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Community Banner */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center p-12 relative overflow-hidden text-white">
          <div className="max-w-md space-y-8 relative z-10 text-center flex flex-col items-center">
            <GraduationCap className="w-20 h-20 text-white/95 animate-bounce mb-2" />
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Your Digital Campus Stay</h1>
            <p className="text-indigo-50 text-sm font-medium leading-relaxed">
              Book dining sessions, lodge maintenance complaints directly to wardens, check in at the automated gate kiosk, and view roommate profiles.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-[1.8rem] border border-white/10 mt-6 shadow-xl">
              <div className="flex -space-x-3">
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" alt="avatar" />
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="avatar" />
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" alt="avatar" />
              </div>
              <p className="text-xs font-bold tracking-wide">Join 5,000+ students living better.</p>
            </div>
          </div>

          <div className="absolute -right-40 bottom-0 top-0 w-80 pointer-events-none opacity-10 flex items-center justify-center">
            <GraduationCap className="text-[300px] text-white rotate-[30deg]" />
          </div>
        </div>
      </div>
    </div>
  );
}
