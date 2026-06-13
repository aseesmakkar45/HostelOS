'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  QrCode, 
  ArrowRight, 
  Info, 
  AlertCircle 
} from 'lucide-react';

export default function RequestVisitorPass() {
  const [visitorName, setVisitorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [passes, setPasses] = useState([]);
  const [currentPass, setCurrentPass] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const response = await axios.get('/student/gatepasses');
      if (response.data.success) {
        setPasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching passes:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!visitorName || !phone || !visitDate || !entryTime || !exitTime) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const valid_from = new Date(`${visitDate}T${entryTime}`);
      const valid_until = new Date(`${visitDate}T${exitTime}`);

      const response = await axios.post('/student/gatepass', {
        visitor_name: visitorName,
        visitor_phone: phone,
        purpose: purpose || `Visit by ${relationship || 'Guest'}`,
        valid_from,
        valid_until
      });

      if (response.data.success) {
        alert('Pass requested successfully!');
        setCurrentPass(response.data.data);
        
        // Reset form
        setVisitorName('');
        setRelationship('');
        setPhone('');
        setEmail('');
        setVisitDate('');
        setEntryTime('');
        setExitTime('');
        setPurpose('');
        
        fetchPasses();
      }
    } catch (err) {
      console.error('Error creating gate pass:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to create pass request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar activeItem="visitors" visitorsHref="/dashboard/student/visitors" passHref="/dashboard/student/gatepass" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-800">Request Visitor Pass</h1>
            <p className="text-slate-500 font-medium">Create a digital entry pass for your guests.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Multi-step Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-bold">1</div>
                  <span className="text-sm font-bold text-slate-700 hidden sm:block">Guest Details</span>
                </div>
                <div className="flex-1 border-t-2 border-slate-100 mx-4"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-300">2</div>
                  <span className="text-sm font-bold text-slate-400 hidden sm:block">Duration</span>
                </div>
                <div className="flex-1 border-t-2 border-slate-100 mx-4"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-300">3</div>
                  <span className="text-sm font-bold text-slate-400 hidden sm:block">Review</span>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Guest Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter guest's full name" 
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Relationship</label>
                      <select 
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select relationship</option>
                        <option>Parent</option>
                        <option>Sibling</option>
                        <option>Friend</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="tel" 
                          placeholder="+1 (555) 000-0000" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="email" 
                          placeholder="guest@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Visit Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="date" 
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Entry</label>
                        <input 
                          type="time" 
                          value={entryTime}
                          onChange={(e) => setEntryTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Exit</label>
                        <input 
                          type="time" 
                          value={exitTime}
                          onChange={(e) => setExitTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Purpose of Visit</label>
                    <textarea 
                      placeholder="Explain why the guest is visiting..." 
                      rows="4" 
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-slate-600 transition-all resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button 
                      type="button" 
                      onClick={() => { setVisitorName(''); setPhone(''); setVisitDate(''); }}
                      className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
                    >
                      Reset Form
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="px-10 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Guest Info Card Preview */}
            <aside className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Active / Generated Pass</h3>
                
                {currentPass ? (
                  <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/80">
                          <User className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Visitor Pass</p>
                          <p className="text-lg font-bold">{currentPass.visitor_name}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Valid Until</p>
                          <p className="text-sm font-medium">{new Date(currentPass.valid_until).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Status</p>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            <p className="text-sm font-medium">Approved</p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center p-4">
                        <QRCodeSVG value={currentPass.qr_code} size={150} />
                      </div>
                      <p className="text-[10px] text-center text-white/40 font-bold">{currentPass.qr_code}</p>
                    </div>
                    
                    {/* Decorative circles */}
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/80">
                          <User className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Visitor Pass</p>
                          <p className="text-lg font-bold">{visitorName || 'Guest Name'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Date</p>
                          <p className="text-sm font-medium">{visitDate || 'Oct 24, 2023'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Status</p>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                            <p className="text-sm font-medium">Pending</p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center opacity-40">
                        <QrCode className="w-20 h-20 text-slate-800" />
                      </div>
                      <p className="text-[10px] text-center text-white/40">QR Code generates upon submission</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                      All requests are subject to warden approval. Ensure the guest carries a valid government ID for AI verification at the gate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2 text-rose-600">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">Required Field Missing</p>
                  </div>
                  <p className="text-xs text-rose-500 font-medium">
                    {errorMsg}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
