'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { 
  QrCode, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  UserCheck, 
  UserPlus,
  Plus
} from 'lucide-react';

export default function VisitorPassQueue() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const response = await axios.get('/warden/passes');
      if (response.data.success) {
        setPasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching visitor passes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const response = await axios.patch(`/warden/pass/${id}`, { status });
      if (response.data.success) {
        setPasses(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        alert(`Pass has been successfully ${status}.`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update visitor pass status.');
    }
  };

  const blacklistVisitor = (name) => {
    alert(`Visitor ${name} has been blacklisted. Future pass requests will be auto-flagged.`);
  };

  const getStatusClass = (status) => {
    if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-rose-50 text-rose-700 border border-rose-100'; // Rejected
  };

  const filteredPasses = passes.filter(pass => {
    const matchesSearch = pass.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pass.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pass.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="passes" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Visitor Pass Queue</h1>
              <p className="text-sm text-slate-500 font-medium">Verify guest credentials, issue digital tokens, and audit gate approvals.</p>
            </div>
            <button 
              onClick={() => alert('New visitor pass wizard opened...')}
              className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              Issue Guest Pass
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Main Table */}
            <div className="col-span-12 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by guest or student name..."
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
                ) : filteredPasses.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium">
                    No visitor passes found in current queue.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="pb-4">Guest Info</th>
                          <th className="pb-4">Host Student</th>
                          <th className="pb-4">Purpose</th>
                          <th className="pb-4">Duration</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredPasses.map((pass) => (
                          <tr key={pass.id}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pass.visitor_name}`} 
                                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0" 
                                  alt="avatar" 
                                />
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{pass.visitor_name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{pass.relationship}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <p className="text-sm font-bold text-slate-800">{pass.student_name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">Room {pass.room_number}</p>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-600">{pass.purpose}</td>
                            <td className="py-4 text-xs font-semibold text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {pass.start_time} - {pass.end_time}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusClass(pass.status)}`}>
                                {pass.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {pass.status === 'Pending' ? (
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => handleAction(pass.id, 'approve')}
                                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleAction(pass.id, 'reject')}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button 
                                    onClick={() => blacklistVisitor(pass.visitor_name)}
                                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all cursor-pointer"
                                    title="Blacklist Guest"
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-xs font-bold ${pass.status === 'Approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {pass.status === 'Approved' ? 'Authorized' : 'Declined'}
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
          </div>
        </div>
      </main>
    </div>
  );
}
