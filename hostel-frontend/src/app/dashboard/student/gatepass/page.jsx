'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
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
  CheckCheck,
  X
} from 'lucide-react';

export default function GatePassDetails() {
  const { user, showToast } = useAuth() || {};
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePass, setActivePass] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    departure_time: '',
    expected_return: '',
    reason: '',
    is_night_stay: false
  });
  const [submitting, setSubmitting] = useState(false);

  const copyQrCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fetchPasses = async () => {
    try {
      const response = await axios.get('/student/student-gatepass');
      if (response.data.success) {
        const allPasses = response.data.data;
        setPasses(allPasses);
        
        // Active pass: Approved and not fully used
        const active = allPasses.find(p => p.permission_status === 'Approved' && (!p.used_for_exit || !p.used_for_return));
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
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreatePass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post('/student/student-gatepass', formData);
      if (res.data.success) {
        if (showToast) showToast('Gate pass requested successfully.', 'success');
        setIsModalOpen(false);
        fetchPasses();
      }
    } catch (err) {
      if (showToast) showToast('Failed to create gate pass.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPass = async (id) => {
    if (showToast) showToast('Gate pass cancellation request submitted successfully.', 'success');
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
              <span className="text-slate-800">Student Gate Pass</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gate Pass Details</h1>
                <p className="text-slate-500 font-medium">Manage your active exit permissions and night stays.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:opacity-90 transition-all cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Request Exit Pass
              </button>
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
                        <div className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-center relative">
                          <QRCodeSVG value={activePass.qr_code} size={150} />
                          {activePass.permission_status !== 'Approved' && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
                              <span className="font-extrabold text-slate-800">{activePass.permission_status}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center w-full">
                          <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                            activePass.permission_status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : activePass.permission_status === 'Rejected'
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {activePass.permission_status}
                          </span>

                          {/* Copyable QR Code String */}
                          <div className="mt-4 w-full">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gate Pass Code</p>
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3">
                              <code className="flex-1 text-xs font-mono text-indigo-300 break-all text-left">{activePass.qr_code}</code>
                              <button
                                onClick={() => copyQrCode(activePass.qr_code)}
                                title="Copy code"
                                disabled={activePass.permission_status !== 'Approved'}
                                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-indigo-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {copied
                                  ? <CheckCheck className="w-4 h-4 text-emerald-400" />
                                  : <Copy className="w-4 h-4 text-slate-400" />
                                }
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Scan this code at the Gate Kiosk</p>
                          </div>
                        </div>
                      </div>

                      {/* Pass Details */}
                      <div className="flex-1 space-y-6">
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-900">{activePass.reason}</h2>
                          <p className="text-slate-500 font-medium">Night Stay: {activePass.is_night_stay ? 'Yes' : 'No'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Departure</p>
                            <p className="text-sm font-bold text-slate-800">
                              {new Date(activePass.departure_time).toLocaleString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Return</p>
                            <p className="text-sm font-bold text-slate-800">
                              {new Date(activePass.expected_return).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">
                                {activePass.used_for_exit && activePass.used_for_return ? 'Trip Completed' :
                                 activePass.used_for_exit ? 'Currently Out of Campus' : 'In Campus'}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                Permission: {activePass.permission_status}
                              </p>
                            </div>
                            {activePass.permission_status === 'Approved' && (
                              <CheckCircle className="text-emerald-500 w-5 h-5" />
                            )}
                          </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                          <button 
                            disabled={activePass.permission_status !== 'Approved'}
                            onClick={() => showToast && showToast('Offline ticket downloaded successfully.', 'success')}
                            className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                            Save Offline
                          </button>
                          {activePass.permission_status === 'Pending' && (
                            <button 
                              onClick={() => handleCancelPass(activePass.id)}
                              className="px-6 py-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 cursor-pointer"
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 font-medium">
                      No gate passes found. Request one to exit the campus.
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Pass History */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-800">Pass History</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {passes.slice(1, 3).map((p) => (
                    <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                          <History className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter ${
                          p.permission_status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                          p.permission_status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {p.permission_status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 truncate">{p.reason}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {new Date(p.departure_time).toLocaleDateString()} • {new Date(p.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">{p.is_night_stay ? 'Night Stay' : 'Day Pass'}</span>
                        </div>
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
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Aarav'}`} className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700" alt="Avatar" />
                    <div>
                      <p className="text-lg font-bold">{user?.name || 'Student'}</p>
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Student ID: {user?.roll_number || 'N/A'}</p>
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
                    <p className="text-sm text-slate-600 font-medium">Night stays and all female student exits require <span className="text-slate-900 font-bold">Warden Approval</span>.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <Scan className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Male day passes are <span className="text-slate-900 font-bold">Auto-approved</span>.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Maximum <span className="text-slate-900 font-bold">48 hours</span> for weekend passes.</p>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* New Gate Pass Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-800">Request Exit Pass</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePass} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for Exit</label>
                <input 
                  type="text" 
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g. Visiting family home for weekend, Medical appointment at district hospital, Attending wedding function" 
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                  <input 
                    type="datetime-local" 
                    name="departure_time"
                    value={formData.departure_time}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-600"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Expected Return</label>
                  <input 
                    type="datetime-local" 
                    name="expected_return"
                    value={formData.expected_return}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-600"
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="nightStay"
                  name="is_night_stay"
                  checked={formData.is_night_stay}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div>
                  <label htmlFor="nightStay" className="text-sm font-bold text-slate-800 cursor-pointer">Night Stay Required</label>
                  <p className="text-xs text-slate-500 font-medium">Check this if you plan to return after 10 PM or the next day.</p>
                </div>
              </div>

              {user?.gender === 'Female' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    As per hostel guidelines, all exit requests for female students require explicit warden approval.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
