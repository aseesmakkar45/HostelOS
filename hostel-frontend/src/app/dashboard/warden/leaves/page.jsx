'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  ShieldAlert,
  Info
} from 'lucide-react';

export default function LeaveRequestsQueue() {
  const { showToast } = useAuth() || {};
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/warden/leaves');
      if (response.data.success) {
        setLeaves(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const response = await axios.patch(`/warden/leave/${id}`, { status });
      if (response.data.success) {
        setLeaves(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        if (showToast) showToast(`Leave Request has been successfully ${status}.`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to update leave request status.', 'error');
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-rose-50 text-rose-700 border border-rose-100'; // Rejected
  };

  const filteredLeaves = leaves.filter(item => {
    const matchesSearch = item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.student_id.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="leaves" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Leave Requests</h1>
              <p className="text-sm text-slate-500 font-medium">Review pending weekend leaves, check parent approval status, and audit occupancy trends.</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Table Area */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              
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
                    <option value="All">All Requests</option>
                    <option>Approved</option>
                    <option>Pending</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : filteredLeaves.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium">
                    No leaves requests found matching current filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="pb-4">Student</th>
                          <th className="pb-4">Reason for Leave</th>
                          <th className="pb-4">Duration</th>
                          <th className="pb-4">Parent Verified</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredLeaves.map((item) => (
                          <tr key={item.id}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.student_name}`} 
                                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0" 
                                  alt="avatar" 
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">{item.student_name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">Room {item.room_number} • ID: {item.student_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-600 max-w-xs truncate">{item.reason}</td>
                            <td className="py-4 text-xs font-semibold text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {item.start_date} to {item.end_date}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                                item.parent_approved 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {item.parent_approved ? 'Verified' : 'Awaiting Consent'}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusClass(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {item.status === 'Pending' ? (
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => handleAction(item.id, 'approve')}
                                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleAction(item.id, 'reject')}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-xs font-bold ${item.status === 'Approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {item.status === 'Approved' ? 'Authorized' : 'Declined'}
                                </span>
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

            {/* Right Column: Occupancy heatmap & rules */}
            <aside className="col-span-12 lg:col-span-3 space-y-8">
              
              {/* Heatmap summary */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Block Load Heatmap</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <p className="text-lg font-black text-emerald-600">88%</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Block A</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                    <p className="text-lg font-black text-rose-600">97%</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Block B</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                    <p className="text-lg font-black text-indigo-600">60%</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Block C</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 text-left">
                  <div className="flex gap-2 items-start text-xs text-slate-500 font-medium leading-relaxed">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Warden auto-alerts block occupancy safety parameters when load exceeds 95%.</span>
                  </div>
                </div>
              </div>

              {/* Safety Regulations */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-200">System Checklist</h3>
                    <ShieldAlert className="text-amber-400 w-5 h-5" />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/10 accent-white" />
                      Parent Consent Mandatory
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/10 accent-white" />
                      Auto-Notify Security Gates
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/10 accent-white" />
                      Threshold Warnings (95%+)
                    </label>
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
}
