'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { 
  Building2, 
  Bed, 
  Users, 
  ZapOff, 
  Droplet, 
  WifiOff, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle,
  ExternalLink,
  PhoneForwarded,
  Search,
  Bell,
  Sparkles
} from 'lucide-react';

export default function WardenDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch stats if available, or simulate from DB endpoints
        const statsRes = await axios.get('/admin/stats').catch(() => null);
        const complaintsRes = await axios.get('/warden/complaints').catch(() => null);
        const leavesRes = await axios.get('/warden/leaves').catch(() => null);
        
        if (statsRes?.data?.success) {
          setStats(statsRes.data.data);
        }
        if (complaintsRes?.data?.success) {
          setComplaints(complaintsRes.data.data);
        }
        // Use leave requests or pending guest passes for the visitors list
        if (leavesRes?.data?.success) {
          setVisitors(leavesRes.data.data);
        }
      } catch (err) {
        console.error('Error loading admin operations data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleAction = (type, id) => {
    alert(`Action ${type} triggered on ID ${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="dashboard" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Operations Hub</h1>
            <div className="flex items-center gap-6 border-l border-slate-200 pl-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupancy</span>
                <span className="text-sm font-bold text-slate-800">92% <span className="text-emerald-500 font-semibold">↑</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Residents</span>
                <span className="text-sm font-bold text-slate-800">482 / 520</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                <span className="text-sm font-bold text-rose-500">24 Alerts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search records, rooms, IDs..." 
                className="w-80 h-11 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
              />
            </div>
            <button className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all relative cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-12 gap-8">
            <section className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 card-hover relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Bed className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-800">Room Availability</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Block A - 4th Floor</p>
                      </div>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-extrabold text-slate-900">38</p>
                        <p className="text-sm font-bold text-emerald-500 mb-1">Vacant Beds</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-24 bg-indigo-600 rounded-full flex flex-col items-center justify-center text-white border-8 border-indigo-50">
                        <span className="text-xl font-bold">92%</span>
                        <span className="text-[8px] font-bold uppercase tracking-tighter">Full</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2 relative z-10">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Real-time Capacity Use</span>
                      <span className="text-indigo-600">482 Residents</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 w-[92%]"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 card-hover">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-extrabold text-slate-800">AI Crowd Alert</h3>
                    <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-bold uppercase rounded-full">High Activity</span>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                      <Users className="w-8 h-8 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-900">Dining Hall Congestion</p>
                      <p className="text-xs text-rose-700 font-medium leading-relaxed">Occupancy is 115% of safe capacity. Automated dispersal alerts sent to student portal.</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => alert('Alert dismissed')}
                      className="py-2 bg-white border border-rose-200 text-rose-600 text-[10px] font-bold rounded-lg hover:bg-rose-50 transition-all uppercase tracking-widest cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={() => alert('Gate staff deployed to Dining Hall')}
                      className="py-2 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition-all uppercase tracking-widest cursor-pointer"
                    >
                      Deploy Staff
                    </button>
                  </div>
                </div>
              </div>

              {/* Complaint Queue */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 card-hover shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold text-slate-800">Urgent Complaint Queue</h3>
                  <button className="text-slate-400 hover:text-slate-600 p-1">Filter</button>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin h-6 w-6 border-b-2 border-indigo-600 rounded-full"></div>
                    </div>
                  ) : complaints.length === 0 ? (
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-5 hover:border-indigo-200 transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                        <ZapOff className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800">Electrical Short - Room 204</h4>
                          <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-bold uppercase rounded-full">Emergency</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Reported by Kevin Spacey • 12 mins ago</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned To</p>
                          <p className="text-xs font-bold text-slate-700">Robert (Maint.)</p>
                        </div>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" className="w-8 h-8 rounded-full bg-slate-200" alt="avatar" />
                      </div>
                    </div>
                  ) : (
                    complaints.slice(0, 3).map((item) => (
                      <div key={item.id} className="group p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-5 hover:border-indigo-200 transition-all cursor-pointer shadow-sm">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                          <Droplet className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-800">{item.title}</h4>
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase rounded-full">{item.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">Reported by Student ID: {item.student_id} • Category: {item.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleAction('assign', item.id)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-lg hover:bg-indigo-100 cursor-pointer"
                          >
                            Assign Staff
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* logs table */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 card-hover shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold text-slate-800">Recent Activity & Logs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="pb-4 px-2">Student</th>
                        <th className="pb-4 px-2">Room</th>
                        <th className="pb-4 px-2">Event</th>
                        <th className="pb-4 px-2">Time</th>
                        <th className="pb-4 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr className="group">
                        <td className="py-5 px-2">
                          <div className="flex items-center gap-3">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" className="w-9 h-9 rounded-lg bg-indigo-50" alt="avatar" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">John Wick</p>
                              <p className="text-[10px] text-slate-400">ID: 239012</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-2 font-bold text-slate-600 text-sm">402-A</td>
                        <td className="py-5 px-2">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase">Gate Check-In</span>
                        </td>
                        <td className="py-5 px-2 text-xs font-medium text-slate-500">09:42 PM</td>
                        <td className="py-5 px-2 text-right">
                          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-indigo-600 transition-all cursor-pointer">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Right column */}
            <section className="col-span-12 lg:col-span-4 space-y-8">
              {/* Financial logs widget */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-extrabold">Financial Health</h3>
                    <TrendingUp className="text-emerald-400 w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Collections (Monthly)</p>
                    <p className="text-4xl font-extrabold">₹4,28,500</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Paid</p>
                      <p className="text-lg font-bold">₹3,82,000</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Pending</p>
                      <p className="text-lg font-bold">₹46,500</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert('Generating revenue report...')}
                    className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all uppercase tracking-widest cursor-pointer"
                  >
                    Generate Revenue Report
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
              </div>

              {/* Visitor requests list */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 card-hover">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold text-slate-800">Visitor Requests</h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">8 New</span>
                </div>
                <div className="space-y-5">
                  <div className="flex gap-4 p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest3" className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" alt="avatar" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">David Beckham</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Visiting: Leo Messi (302-C)</p>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 cursor-pointer">Approve</button>
                        <button className="flex-1 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg hover:bg-rose-50 hover:text-rose-600 cursor-pointer">Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto allocation card */}
              <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">Auto-Allocation</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 font-semibold">24 new applications detected. AI can suggest the best room matches based on student interests and habits.</p>
                  <button 
                    onClick={() => alert('Starting smart allocation matching...')}
                    className="w-full py-3 bg-white text-indigo-600 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest cursor-pointer"
                  >
                    Start Smart Allocation
                  </button>
                </div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-200/30 rounded-full blur-2xl"></div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
