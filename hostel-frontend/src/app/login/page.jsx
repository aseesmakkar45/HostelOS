'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Eye, EyeOff, Lock, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function WardenLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password, 'warden');
      if (res.success) {
        router.push('/dashboard/warden');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
      <div className="w-full max-w-[1440px] h-screen overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-white h-full overflow-y-auto">
          {/* Logo */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-800">CampusStay</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Warden Operations</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">Log in to oversee student occupancy, leaves, and safety logs.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="warden@campusstay.com"
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
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

            <div className="flex items-center justify-between ml-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-500">Remember Me</span>
              </label>
              <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-150 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In as Warden'}
            </button>
          </form>

          {/* Quick links to alternate portals */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alternate Access Portals</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500">
              <Link href="/student/login" className="hover:text-indigo-600 hover:underline">Student Login</Link>
              <span className="text-slate-300">•</span>
              <Link href="/admin/login" className="hover:text-indigo-600 hover:underline">Central Admin Portal</Link>
              <span className="text-slate-300">•</span>
              <Link href="/gate/login" className="hover:text-indigo-600 hover:underline">Gate AI Kiosk</Link>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Banner */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden h-full">
          <div className="max-w-md text-white text-center space-y-8 relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Effortless Hostel Governance</h1>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed">
              Equipped with smart occupancy metrics, automated gate verification lists, and proactive maintenance logs.
            </p>
            
            {/* Embedded Mock Widget */}
            <div className="mx-auto bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 p-8 shadow-2xl relative w-full">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Active Shift Status</span>
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Sarah Miller</h4>
                  <p className="text-xs text-indigo-200">Senior Warden • Block A</p>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 w-56 border border-white/10 flex items-center gap-3 shadow-xl">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left text-white">
                  <p className="text-[9px] font-bold uppercase opacity-65">Support Desk</p>
                  <p className="text-xs font-black">12 Active Tickets</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Background Blobs */}
          <div className="absolute top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-950/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
