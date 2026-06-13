'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ChevronRight, 
  PlusCircle, 
  QrCode, 
  Download, 
  Users, 
  CheckCircle,
  History,
  Fingerprint,
  Clock,
  ShieldCheck,
  Scan,
  Info,
  Copy,
  CheckCheck
} from 'lucide-react';

export default function GatePassDetails() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePass, setActivePass] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyQrCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    async function fetchPasses() {
      try {
        const response = await axios.get('/student/gatepasses');
        if (response.data.success) {
          const allPasses = response.data.data;
          setPasses(allPasses);
          // Set the first active/unused pass as the main focused pass
          const active = allPasses.find(p => !p.used && new Date(p.valid_until) > new Date());
          if (active) {
            setActivePass(active);
          } else if (allPasses.length > 0) {
            setActivePass(allPasses[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching gate passes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPasses();
  }, []);

  const handleCancelPass = async (id) => {
    if (confirm('Are you sure you want to cancel this gate pass?')) {
      alert('Cancel request sent.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar activeItem="pass" visitorsHref="/dashboard/student/visitors" passHref="/dashboard/student/gatepass" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          {/* Breadcrumbs & Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 font-medium">
              <Link href="/dashboard/student" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800">Digital Gate Pass</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gate Pass Details</h1>
                <p className="text-slate-500 font-medium">Manage your active exit permissions and visitor access.</p>
              </div>
              <Link 
                href="/dashboard/student/visitors" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:opacity-90 transition-all cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Request New Pass
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Active Pass (Main Focus) */}
            <div className="xl:col-span-2 space-y-8">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 card-hover overflow-hidden relative">
                {/* Decorative Background Shape */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                
                <div className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : activePass ? (
                    <div className="flex flex-col md:flex-row items-center gap-12">
                      {/* Digital QR Pass */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-center">
                          <QRCodeSVG value={activePass.qr_code} size={150} />
                        </div>
                        <div className="text-center w-full">
                          <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                            activePass.used 
                              ? 'bg-slate-50 text-slate-500 border-slate-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {activePass.used ? 'Used Pass' : 'Active Pass'}
                          </span>

                          {/* Copyable QR Code String */}
                          <div className="mt-4 w-full">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gate Pass Code</p>
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3">
                              <code className="flex-1 text-xs font-mono text-indigo-300 break-all text-left">{activePass.qr_code}</code>
                              <button
                                onClick={() => copyQrCode(activePass.qr_code)}
                                title="Copy code"
                                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-indigo-600 transition-colors cursor-pointer"
                              >
                                {copied
                                  ? <CheckCheck className="w-4 h-4 text-emerald-400" />
                                  : <Copy className="w-4 h-4 text-slate-400" />
                                }
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Copy &amp; paste this code at the Gate Kiosk scanner</p>
                          </div>
                        </div>
                      </div>

                      {/* Pass Details */}
                      <div className="flex-1 space-y-6">
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-900">{activePass.purpose}</h2>
                          <p className="text-slate-500 font-medium">Visitor: {activePass.visitor_name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valid From</p>
                            <p className="text-sm font-bold text-slate-800">
                              {new Date(activePass.valid_from).toLocaleString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valid Until</p>
                            <p className="text-sm font-bold text-slate-800">
                              {new Date(activePass.valid_until).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">{activePass.visitor_phone || 'N/A'}</p>
                              <p className="text-xs text-slate-500 font-medium">Verified visitor phone</p>
                            </div>
                            <CheckCircle className="text-emerald-500 w-5 h-5" />
                          </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                          <button 
                            onClick={() => alert('Offline ticket downloaded.')}
                            className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            Save Offline
                          </button>
                          {!activePass.used && (
                            <button 
                              onClick={() => handleCancelPass(activePass.id)}
                              className="px-6 py-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 cursor-pointer"
                            >
                              Cancel Pass
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 font-medium">
                      No active gate passes found.
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Pass History */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-800">Pass History</h3>
                  <button 
                    onClick={() => alert('Loading full history...')}
                    className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    View All Records
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {passes.slice(1, 3).map((p) => (
                    <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                          <History className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter ${
                          p.used ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {p.used ? 'Used' : 'Unused'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800">{p.purpose}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {new Date(p.valid_from).toLocaleDateString()} • {new Date(p.valid_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(p.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{p.visitor_name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">AI verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Info / Rules */}
            <div className="space-y-8">
              {/* Digital Identity Card */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-extrabold">AI Identity</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700" alt="Avatar" />
                    <div>
                      <p className="text-lg font-bold">Aarav Sharma</p>
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Student ID: 402202</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Face Data</span>
                      <span className="text-emerald-400 font-bold">Verified</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">Verified students can auto-gate exit within approved leave hours.</p>
                </div>
                {/* Decoration */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              </div>

              {/* Hostel Exit Rules */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6">Gate Policies</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Night curfew starts at <span className="text-slate-900 font-bold">10:00 PM</span> sharp.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Visitors must provide <span className="text-slate-900 font-bold">National ID</span> upon entry.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <Scan className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">AI verification failure requires <span className="text-slate-900 font-bold">Manual Register</span> entry.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Maximum <span className="text-slate-900 font-bold">48 hours</span> for weekend passes.</p>
                  </li>
                </ul>
              </section>

              {/* Request Status Tracker */}
              <section className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Pending Requests</h4>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-slate-800">Parent Visit Request</p>
                    <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-extrabold uppercase">Awaiting</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Scheduled for Next Friday</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
