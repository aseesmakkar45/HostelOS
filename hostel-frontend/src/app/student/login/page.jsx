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

          <div className="mt-8 text-center text-xs text-slate-400 flex flex-wrap justify-center gap-4 font-bold uppercase tracking-wider border-t border-slate-100 pt-6">
            <Link href="/login" className="hover:text-indigo-600">Warden Portal</Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-indigo-600">Admin Portal</Link>
            <span>•</span>
            <Link href="/gate/login" className="hover:text-indigo-600">Gate Kiosk</Link>
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
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="avatar" />
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="avatar" />
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="avatar" />
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
