'use client';

import React, { useState } from 'react';
import axios from '@/lib/axios';
import { 
  UserCheck, 
  QrCode, 
  RefreshCw, 
  Send, 
  Snowflake, 
  Sparkles, 
  Wifi, 
  Plus, 
  UtensilsCrossed, 
  Check, 
  X, 
  Phone,
  HelpCircle,
  Home
} from 'lucide-react';

export default function GuestPortal() {
  const [status, setStatus] = useState('Approval Pending');
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState('John Doe');
  const [purpose, setPurpose] = useState('Meeting Student');
  const [entryTime, setEntryTime] = useState('14:00');
  const [exitTime, setExitTime] = useState('18:00');
  const [phone, setPhone] = useState('');

  const checkStatus = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('Approved');
      alert('Pass Status updated: Approved!');
    }, 1500);
  };

  const handleGenerateRequest = (e) => {
    e.preventDefault();
    alert(`Instant pass requested for ${guestName} from ${entryTime} to ${exitTime}.`);
  };

  const handleQuickReport = (item) => {
    alert(`Reported ${item} issue to Hostel desk.`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800 block">CampusStay</span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Guest Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-2">
            <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">My Passes</button>
            <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Help Center</button>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">John Doe</p>
              <p className="text-xs text-slate-500 font-medium">Registered Guest</p>
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Guest" className="w-10 h-10 rounded-xl bg-slate-100" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            {/* Active pass status */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="w-48 h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group cursor-pointer hover:border-indigo-300 transition-all">
                  <QrCode className="w-16 h-16 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase mt-2">Scan at Entry</p>
                </div>
                <div className="flex-1 space-y-5 text-center md:text-left">
                  <div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                      status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {status}
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Afternoon Visit Pass</h2>
                    <p className="text-slate-500 font-medium font-semibold">Request submitted today at 09:15 AM</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visit Date</p>
                      <p className="font-bold text-slate-700">Oct 18, 2023</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Host Name</p>
                      <p className="font-bold text-slate-700">Alex Johnson (402-B)</p>
                    </div>
                  </div>
                  <div className="pt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                    <button 
                      onClick={checkStatus}
                      disabled={loading}
                      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 transition-all text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Check Status
                    </button>
                    <button 
                      onClick={() => alert('Modify pass modal opened')}
                      className="px-6 py-3 bg-slate-50 text-slate-600 border border-slate-100 font-bold rounded-2xl hover:bg-slate-100 transition-all text-sm cursor-pointer"
                    >
                      Modify Request
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl"></div>
            </section>

            {/* Quick pass generator */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-slate-800">Request Quick Pass</h2>
                <p className="text-xs font-bold text-indigo-500">Next Available: 2:00 PM Today</p>
              </div>
              <form onSubmit={handleGenerateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Guest Name</label>
                  <input 
                    type="text" 
                    value={guestName} 
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Visit Purpose</label>
                  <select 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option>Meeting Student</option>
                    <option>Official Work</option>
                    <option>Delivery</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Entry Time</label>
                  <input 
                    type="time" 
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Exit Time</label>
                  <input 
                    type="time" 
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Emergency Contact (Phone)</label>
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="md:col-span-2 w-full py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Generate Instant Request
                </button>
              </form>
            </section>

            {/* Quick reporting */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover">
              <h2 className="text-xl font-extrabold text-slate-800 mb-8">Quick Issue Reporting</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Snowflake, label: 'AC/Climate', value: 'ac' },
                  { icon: Sparkles, label: 'Cleanliness', value: 'clean' },
                  { icon: Wifi, label: 'Internet', value: 'wifi' },
                  { icon: Plus, label: 'Others', value: 'other' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={idx}
                      onClick={() => handleQuickReport(item.label)}
                      className="p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex flex-col items-center gap-3 group cursor-pointer"
                    >
                      <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white card-hover relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <UtensilsCrossed className="w-6 h-6" />
                  <h3 className="font-extrabold">Dining Schedule</h3>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Lunch</p>
                      <p className="text-sm font-bold">Buffet served</p>
                    </div>
                    <p className="text-xs font-bold">12:30 - 14:30</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Snacks</p>
                      <p className="text-sm font-bold">Tea & Cookies</p>
                    </div>
                    <p className="text-xs font-bold">16:30 - 17:30</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md opacity-60">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Dinner</p>
                      <p className="text-sm font-bold">Asian Cuisine</p>
                    </div>
                    <p className="text-xs font-bold">19:30 - 21:30</p>
                  </div>
                </div>
                <p className="text-[10px] text-center text-indigo-100 mt-6 font-medium">Location: Main Mess Hall, Ground Floor</p>
              </div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </section>

            <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover">
              <h3 className="text-lg font-extrabold text-slate-800 mb-6">Hostel Dos & Don'ts</h3>
              <ul className="space-y-6">
                {[
                  { icon: Check, title: 'Carry Guest ID', desc: 'Mandatory for AI face sync at gate.', success: true },
                  { icon: Check, title: 'Stay in Lounge', desc: 'Room access requires warden entry.', success: true },
                  { icon: X, title: 'No Late Entry', desc: 'Guests must exit by 10:00 PM.', success: false },
                  { icon: X, title: 'No Loud Audio', desc: 'Respect the student study hours.', success: false }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index} className="flex gap-4">
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                        item.success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col items-center text-center card-hover shadow-xl">
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-900/40 animate-pulse">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-extrabold text-xl mb-2">Gate Assistance</h4>
              <p className="text-slate-400 text-sm mb-6">Facing issues with QR scanning or entry? Contact gate staff now.</p>
              <button 
                onClick={() => alert('Calling Helpdesk at +91 99999 88888')}
                className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Call Gate Helpdesk
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
