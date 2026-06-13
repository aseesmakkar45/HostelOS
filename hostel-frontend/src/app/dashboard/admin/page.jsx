'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { 
  TrendingUp, 
  CreditCard, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Settings,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get('/admin/finance');
        if (res.data.success) {
          setFinanceData(res.data.data);
        }
      } catch (err) {
        console.error('Error loading finance dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Paid') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Pending') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-755'; // Overdue
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="admin" activeItem="dashboard" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Page Title */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Finance & Operations Hub</h1>
              <p className="text-sm text-slate-500 font-medium">Platform financial logs, billing sweeps, and occupancy auditing.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => alert('Billing cycle execution started...')}
                className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
              >
                <DollarSign className="w-4 h-4" />
                Run Billing Sweep
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-8">
              
              {/* Left Column: Stats and Analytics */}
              <section className="col-span-12 lg:col-span-9 space-y-8">
                
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Revenue</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">₹{financeData?.totalRevenue?.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-emerald-500 text-xs font-bold">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>+12.4% MoM</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collections Cleared</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">₹{financeData?.revenuePaid?.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-emerald-500 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>89% Collected</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding Ledger</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">₹{financeData?.revenuePending?.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-amber-500 text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      <span>11% Awaiting</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Residents</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">{financeData?.totalStudents}</h3>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-indigo-500 text-xs font-bold">
                      <Users className="w-4 h-4" />
                      <span>{financeData?.occupancyRate}% Bed Cap</span>
                    </div>
                  </div>
                </div>

                {/* Revenue trends Chart */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">Revenue Trends & Expenses</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Comparison logs for the last two quarters.</p>
                    </div>
                    <TrendingUp className="text-indigo-600 w-6 h-6" />
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={financeData?.monthlyRevenue}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Gross Revenue" />
                        <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={0.05} fill="#f43f5e" name="Operating Cost" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ledger Sweeps */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-6">Outstanding Ledger Audit Sweeps</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="pb-4">Audit Date</th>
                          <th className="pb-4">Student</th>
                          <th className="pb-4">Billing Category</th>
                          <th className="pb-4">Dues Amount</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4 text-right">Audit Log</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {financeData?.ledgers?.map((ledger) => (
                          <tr key={ledger.id}>
                            <td className="py-4 text-xs font-semibold text-slate-500">{ledger.date}</td>
                            <td className="py-4 font-bold text-slate-800 text-sm">{ledger.name}</td>
                            <td className="py-4 text-xs font-semibold text-slate-600">{ledger.type}</td>
                            <td className="py-4 font-bold text-slate-800 text-sm">₹{Number(ledger.amount).toLocaleString('en-IN')}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusBadge(ledger.status)}`}>
                                {ledger.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => alert(`Opening ledger audit for ${ledger.name}`)}
                                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                              >
                                View Sweeps
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </section>

              {/* Right Column: Settings and Activity logs */}
              <section className="col-span-12 lg:col-span-3 space-y-8">
                
                {/* Billing Configurations */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover">
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-extrabold">Hostel Room Rates</h3>
                      <Settings className="text-indigo-400 w-5 h-5" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Single Premium</span>
                        <span className="font-extrabold">₹15,000/mo</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Double Sharing</span>
                        <span className="font-extrabold">₹12,000/mo</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Triple Standard</span>
                        <span className="font-extrabold">₹7,500/mo</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Mess Fee Core</span>
                        <span className="font-extrabold">₹3,500/mo</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert('Opening rates configuration...')}
                      className="w-full py-3.5 bg-white text-indigo-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest cursor-pointer"
                    >
                      Update Tariff Plans
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Operations logs */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Audit Sweeps Stream</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4 items-start border-b border-slate-50 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Billing Cycle Swept</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Automated billing swept 482 active records.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start border-b border-slate-50 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Dues Notice Dispatched</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Automated SMS/Email sent to overdue residents.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Auto-Approval Pass</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Auto-cleared 24-hr visitor pass for Manish Sharma.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </section>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
