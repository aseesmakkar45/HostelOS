'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  UserCheck, 
  Key, 
  ShieldCheck, 
  Building2,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  const portals = [
    {
      name: 'Student Portal',
      description: 'Manage room details, leaves, gate passes, billing records, and Face ID registration.',
      href: '/student/login',
      icon: GraduationCap,
      color: 'from-indigo-500 to-purple-600 shadow-indigo-100',
      badge: 'Resident Access',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
      name: 'Warden Portal',
      description: 'Oversee student allocations, approve leave passes, resolve complaints, and view AI dining forecasts.',
      href: '/login',
      icon: UserCheck,
      color: 'from-blue-600 to-indigo-700 shadow-blue-100',
      badge: 'Staff Operations',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    {
      name: 'Central Admin',
      description: 'Configure hostel tariffs, run automated billing sweeps, schedule staff rosters, and audit logs.',
      href: '/admin/login',
      icon: Key,
      color: 'from-violet-600 to-fuchsia-700 shadow-violet-100',
      badge: 'System Admin',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-100'
    },
    {
      name: 'Gate AI Kiosk',
      description: 'Authorized terminal for real-time BlazeFace biometric matching and QR gate pass verification.',
      href: '/gate/login',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600 shadow-emerald-100',
      badge: 'Security Desk',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Background shapes & ambient glows */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full blur-[150px] opacity-40 z-0"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-200 rounded-full blur-[150px] opacity-40 z-0"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-10 shrink-0 mb-8 md:mb-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-800">CampusStay</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200/60 px-4 py-2 rounded-2xl shadow-sm">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          All Systems Online
        </div>
      </header>

      {/* Main content selector */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full relative z-10 py-8">
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Hostel Management <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Operating System</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-sm md:text-base leading-relaxed">
            Welcome to the CampusStay Unified Portal. Select your role below to access dedicated dashboards, manage security, and execute central operations.
          </p>
        </div>

        {/* Portals Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link 
                key={portal.name}
                href={portal.href}
                className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between h-[360px] cursor-pointer"
              >
                <div>
                  {/* Icon Card Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className={`w-14 h-14 bg-gradient-to-br ${portal.color} rounded-[1.4rem] flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${portal.badgeColor}`}>
                      {portal.badge}
                    </span>
                  </div>

                  {/* Body Text */}
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {portal.name}
                  </h3>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed mt-3">
                    {portal.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors mt-6">
                  Access Portal
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto border-t border-slate-200/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 shrink-0 mt-8 md:mt-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-600 transition-colors flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Help Desk
          </a>
          <span>•</span>
          <span className="normal-case font-medium">CampusStay OS v4.2.5</span>
        </div>
        <p className="normal-case font-medium tracking-normal text-slate-400">&copy; 2026 CampusStay OS. All rights reserved.</p>
      </footer>
    </div>
  );
}
