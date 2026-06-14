'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
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
  Plus,
  Users,
  LogOut
} from 'lucide-react';

export default function VisitorPassQueue() {
  const { showToast } = useAuth() || {};
  const [activeTab, setActiveTab] = useState('visitor'); // 'visitor' or 'student'
  
  // Visitor Passes state
  const [visitorPasses, setVisitorPasses] = useState([]);
  const [loadingVisitor, setLoadingVisitor] = useState(true);
  
  // Student Gate Passes state
  const [studentPasses, setStudentPasses] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (activeTab === 'visitor') {
      fetchVisitorPasses();
    } else {
      fetchStudentPasses();
    }
  }, [activeTab]);

  const fetchVisitorPasses = async () => {
    setLoadingVisitor(true);
    try {
      const response = await axios.get('/warden/passes');
      if (response.data.success) {
        setVisitorPasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching visitor passes:', err);
    } finally {
      setLoadingVisitor(false);
    }
  };

  const fetchStudentPasses = async () => {
    setLoadingStudent(true);
    try {
      const response = await axios.get('/warden/student-passes');
      if (response.data.success) {
        setStudentPasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching student passes:', err);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleVisitorAction = async (id, action) => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const response = await axios.patch(`/warden/pass/${id}`, { status });
      if (response.data.success) {
        setVisitorPasses(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        if (showToast) showToast(`Visitor pass has been successfully ${status.toLowerCase()}.`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to update visitor pass status.', 'error');
    }
  };

  const handleStudentAction = async (id, action) => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const response = await axios.patch(`/warden/student-pass/${id}`, { status });
      if (response.data.success) {
        setStudentPasses(prev => prev.map(p => p.id === id ? { ...p, permission_status: status } : p));
        if (showToast) showToast(`Student gate pass has been successfully ${status.toLowerCase()}.`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to update student gate pass status.', 'error');
    }
  };

  const blacklistVisitor = (name) => {
    if (showToast) showToast(`Visitor ${name} has been blacklisted. Future pass requests will be auto-flagged.`, 'warning');
  };

  const getStatusClass = (status) => {
    if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-rose-50 text-rose-700 border border-rose-100'; // Rejected
  };

  const filteredVisitorPasses = visitorPasses.filter(pass => {
    const matchesSearch = pass.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pass.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pass.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStudentPasses = studentPasses.filter(pass => {
    const matchesSearch = pass.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pass.permission_status === statusFilter;
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Passes Management</h1>
              <p className="text-sm text-slate-500 font-medium">Verify credentials, issue digital tokens, and audit gate approvals.</p>
            </div>
            {activeTab === 'visitor' && (
              <button 
                onClick={() => showToast && showToast('New visitor pass wizard opened...', 'info')}
                className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" />
                Issue Guest Pass
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button
              className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'visitor' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => { setActiveTab('visitor'); setSearchQuery(''); setStatusFilter('All'); }}
            >
              <Users className="w-4 h-4" />
              Visitor Passes
            </button>
            <button
              className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'student' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => { setActiveTab('student'); setSearchQuery(''); setStatusFilter('All'); }}
            >
              <LogOut className="w-4 h-4" />
              Student Exit Passes
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
                    placeholder={`Search by ${activeTab === 'visitor' ? 'guest or student' : 'student'} name...`}
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
                
                {/* VISITOR PASSES TABLE */}
                {activeTab === 'visitor' && (
                  loadingVisitor ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : filteredVisitorPasses.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium">
                      No visitor passes found.
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
                          {filteredVisitorPasses.map((pass) => (
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
                                      onClick={() => handleVisitorAction(pass.id, 'approve')}
                                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleVisitorAction(pass.id, 'reject')}
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
                  )
                )}

                {/* STUDENT PASSES TABLE */}
                {activeTab === 'student' && (
                  loadingStudent ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : filteredStudentPasses.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium">
                      No student exit passes found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <tr>
                            <th className="pb-4">Student</th>
                            <th className="pb-4">Reason</th>
                            <th className="pb-4">Schedule</th>
                            <th className="pb-4">Night Stay</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredStudentPasses.map((pass) => (
                            <tr key={pass.id}>
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pass.student_name}`} 
                                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0" 
                                    alt="avatar" 
                                  />
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{pass.student_name} <span className="text-slate-400">({pass.gender})</span></p>
                                    <p className="text-[10px] text-slate-400 font-semibold">Room {pass.room_number}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-xs font-semibold text-slate-600">{pass.reason}</td>
                              <td className="py-4 text-xs font-semibold text-slate-500">
                                <div className="flex flex-col gap-1">
                                  <span className="flex items-center gap-1">
                                    <span className="text-indigo-500 font-bold w-10">OUT</span>
                                    {new Date(pass.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="text-emerald-500 font-bold w-10">IN</span>
                                    {new Date(pass.expected_return).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${pass.is_night_stay ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                  {pass.is_night_stay ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusClass(pass.permission_status)}`}>
                                  {pass.permission_status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                {pass.permission_status === 'Pending' ? (
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      onClick={() => handleStudentAction(pass.id, 'approve')}
                                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleStudentAction(pass.id, 'reject')}
                                      className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`text-xs font-bold ${pass.permission_status === 'Approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {pass.permission_status === 'Approved' ? 'Authorized' : 'Declined'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
