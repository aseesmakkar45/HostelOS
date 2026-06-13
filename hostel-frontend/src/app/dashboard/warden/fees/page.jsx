'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { 
  CreditCard, 
  Search, 
  Filter, 
  DollarSign, 
  Mail, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Send,
  Download
} from 'lucide-react';

export default function FinancialLogs() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    paidPercentage: 0
  });

  useEffect(() => {
    async function fetchFees() {
      try {
        const response = await axios.get('/warden/fees');
        if (response.data.success) {
          setFees(response.data.data);
          calculateStats(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching financial logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, []);

  const calculateStats = (data) => {
    let billed = 0;
    let paid = 0;
    let pending = 0;
    
    data.forEach(item => {
      billed += item.amount;
      if (item.status === 'Paid') {
        paid += item.amount;
      } else {
        pending += item.amount;
      }
    });

    setStats({
      totalBilled: billed,
      totalPaid: paid,
      totalPending: pending,
      paidPercentage: billed > 0 ? Math.round((paid / billed) * 100) : 0
    });
  };

  const getStatusClass = (status) => {
    if (status === 'Paid') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-rose-50 text-rose-700 border border-rose-100'; // Overdue
  };

  const filteredFees = fees.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.student_id.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sendFeeReminder = (name, amount) => {
    alert(`Reminder for payment of $${amount} sent to student ${name} and their registered parent.`);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="fees" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial & Fee Logs</h1>
              <p className="text-sm text-slate-500 font-medium">Monitor resident fee collection status and dispatch invoice alerts.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => alert('Exporting billing sheets to CSV...')}
                className="bg-white text-slate-700 font-bold px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                Export ledger
              </button>
            </div>
          </div>

          {/* Stats Summary Panel */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Target</p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-900">${stats.totalBilled?.toLocaleString()}</h3>
                <span className="text-xs font-bold text-indigo-500">100% Total</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                <div className="h-full bg-indigo-500 w-full rounded-full"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collections Received</p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-900">${stats.totalPaid?.toLocaleString()}</h3>
                <span className="text-xs font-bold text-emerald-500">{stats.paidPercentage}% Paid</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.paidPercentage}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding Dues</p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-2xl font-black text-slate-900">${stats.totalPending?.toLocaleString()}</h3>
                <span className="text-xs font-bold text-amber-500">{100 - stats.paidPercentage}% Dues</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${100 - stats.paidPercentage}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] text-white card-hover relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Cycle</p>
                <h3 className="text-xl font-bold mt-2">Active Quarter</h3>
                <p className="text-[10px] text-indigo-300 font-medium mt-1">Next Automated Sweep in 18 days</p>
              </div>
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Table Area */}
            <div className="col-span-12 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by student name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer text-slate-600"
                  >
                    <option value="All">All Payment Statuses</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : filteredFees.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium">
                    No financial logs found matching current search.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="pb-4">Student</th>
                          <th className="pb-4">Dues Amount</th>
                          <th className="pb-4">Payment Status</th>
                          <th className="pb-4">Deadline Date</th>
                          <th className="pb-4">Clearing Transaction</th>
                          <th className="pb-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredFees.map((fee) => (
                          <tr key={fee.id}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fee.name}`} 
                                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0" 
                                  alt="avatar" 
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">{fee.name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">ID: {fee.student_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 font-bold text-slate-800 text-sm">${fee.amount?.toLocaleString()}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusClass(fee.status)}`}>
                                {fee.status}
                              </span>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-500">{fee.due_date}</td>
                            <td className="py-4 text-xs font-mono font-bold text-slate-600">{fee.transaction_id}</td>
                            <td className="py-4 text-right">
                              {fee.status !== 'Paid' ? (
                                <button 
                                  onClick={() => sendFeeReminder(fee.name, fee.amount)}
                                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1 ml-auto cursor-pointer"
                                >
                                  <Send className="w-3 h-3" />
                                  Remind Parent
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-500 font-bold">Cleared</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
