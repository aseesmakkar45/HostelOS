'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { 
  PlusCircle, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Info,
  UserCheck
} from 'lucide-react';

export default function LeaveRequestPortal() {
  const [activeTab, setActiveTab] = useState('new');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [leaveType, setLeaveType] = useState('Weekend Vacation');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [durationText, setDurationText] = useState('Auto-calculating...');
  const [isAiEligible, setIsAiEligible] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (!isNaN(diffDays)) {
        setDurationText(`${diffDays} Day${diffDays > 1 ? 's' : ''}`);
        setIsAiEligible(diffDays <= 3);
      } else {
        setDurationText('Auto-calculating...');
        setIsAiEligible(true);
      }
    } else {
      setDurationText('Auto-calculating...');
      setIsAiEligible(true);
    }
  }, [fromDate, toDate]);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/student/leaves');
      if (response.data.success) {
        setLeaves(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/student/leave', {
        from_date: fromDate,
        to_date: toDate,
        reason: `${leaveType}: ${reason}`
      });

      if (response.data.success) {
        alert('Leave application submitted successfully!');
        setFromDate('');
        setToDate('');
        setReason('');
        setEmergencyName('');
        setEmergencyPhone('');
        fetchLeaves();
        setActiveTab('pending');
      }
    } catch (err) {
      console.error('Error applying for leave:', err);
      alert('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="status-badge bg-amber-100 text-amber-600">Pending Warden</span>;
      case 'approved':
        return <span className="status-badge bg-emerald-100 text-emerald-600">Approved</span>;
      case 'rejected':
        return <span className="status-badge bg-rose-100 text-rose-600">Rejected</span>;
      default:
        return <span className="status-badge bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const filteredHistory = leaves.filter(l => {
    if (activeTab === 'pending') return l.status === 'pending';
    if (activeTab === 'approved') return l.status === 'approved';
    if (activeTab === 'rejected') return l.status === 'rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar activeItem="services" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leave Request Center</h1>
              <p className="text-slate-500 font-medium">Manage your travel permits and absences.</p>
            </div>
            <button 
              onClick={() => setActiveTab('new')}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              New Leave Application
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              
              {/* Form & Tab Card */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="border-b border-slate-50 px-8 flex gap-8">
                  {['new', 'pending', 'approved', 'rejected'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-5 font-bold text-sm transition-all cursor-pointer ${
                        activeTab === tab ? 'tab-active' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab === 'new' ? 'New Request' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {activeTab === 'new' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                          <select 
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-slate-700 font-medium outline-none focus:border-indigo-500 transition-all cursor-pointer"
                          >
                            <option>Weekend Vacation</option>
                            <option>Family Emergency</option>
                            <option>Medical Leave</option>
                            <option>Religious Holiday</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 flex items-center justify-between">
                            <span className="text-indigo-600 font-bold">{durationText}</span>
                            <span className="status-badge bg-indigo-600 text-white">Smart Check</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">From Date</label>
                          <input 
                            type="date" 
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-slate-700 outline-none focus:border-indigo-500 transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">To Date</label>
                          <input 
                            type="date" 
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-slate-700 outline-none focus:border-indigo-500 transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for Absence</label>
                        <textarea 
                          rows="3" 
                          placeholder="Briefly describe your reason..." 
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-slate-700 outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Emergency Contact Name</label>
                          <input 
                            type="text" 
                            placeholder="Guardian or Relative Name" 
                            value={emergencyName}
                            onChange={(e) => setEmergencyName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-slate-700 outline-none focus:border-indigo-500 transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Emergency Phone</label>
                          <input 
                            type="tel" 
                            placeholder="+91 98765 43210" 
                            value={emergencyPhone}
                            onChange={(e) => setEmergencyPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-slate-700 outline-none focus:border-indigo-500 transition-all" 
                          />
                        </div>
                      </div>

                      <div className="pt-4 bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-emerald-700">
                          <Sparkles className="w-6 h-6 text-emerald-600" />
                          <div>
                            <p className="font-bold">AI Auto-Approval Eligible</p>
                            <p className="text-xs">Leaves under 3 days are auto-approved by the system.</p>
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          disabled={submitting}
                          className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : filteredHistory.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-medium">
                          No leaves found in this category.
                        </div>
                      ) : (
                        filteredHistory.map((item) => (
                          <div key={item.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                <Clock className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-slate-800">{item.reason?.split(':')[0] || 'Leave'}</h4>
                                <p className="text-sm text-slate-500 font-medium">{item.reason?.split(':')[1] || item.reason}</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                  {new Date(item.from_date).toLocaleDateString()} - {new Date(item.to_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* History list */}
              {activeTab === 'new' && (
                <section className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Recent Leave History</h3>
                    <p className="text-slate-400 text-sm font-medium">Track your past and pending applications.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {leaves.slice(0, 2).map((item) => (
                      <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 card-hover">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        <h4 className="font-bold text-lg text-slate-800">{item.reason?.split(':')[0] || 'Leave Request'}</h4>
                        <p className="text-sm text-slate-500 font-medium mb-4">
                          {new Date(item.from_date).toLocaleDateString()} - {new Date(item.to_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                          {item.status === 'approved' ? (
                            <>
                              <UserCheck className="text-emerald-500 w-4 h-4" />
                              <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Auto-Approved by System</p>
                            </>
                          ) : (
                            <>
                              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=WardenPriya" className="w-6 h-6 rounded-full bg-slate-100" alt="avatar" />
                              <p className="text-xs text-slate-400 font-medium">Assigned to: Priya Sharma</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                  <h3 className="text-xl font-extrabold mb-6">Absence Timeline</h3>
                  <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-500 border-4 border-slate-900 z-10"></div>
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Next Week</p>
                      <p className="text-sm font-bold">Mid-Semester Break</p>
                      <p className="text-[10px] text-slate-400">Starts Oct 22, 2023</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-700 border-4 border-slate-900 z-10"></div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nov 12</p>
                      <p className="text-sm font-bold">Diwali Vacation</p>
                      <p className="text-[10px] text-slate-400">Awaiting approval</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 z-10"></div>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Dec 20</p>
                      <p className="text-sm font-bold">Winter Holiday</p>
                      <p className="text-[10px] text-slate-400">Plan generated</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert('Opening full timeline...')}
                    className="w-full mt-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Expand Year View
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm card-hover">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6">Leave Policy</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Leaves must be submitted at least <span className="text-slate-900 font-bold">24 hours</span> before departure.</p>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed font-bold">Identity verification via <span className="text-slate-900 font-bold">AI Face Recognition</span> is mandatory at gate entry.</p>
                  </li>
                  <li className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Late returns result in a <span className="text-rose-600 font-bold">₹100 fine</span> per hour beyond curfew.</p>
                  </li>
                </ul>
              </section>

                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white text-center relative overflow-hidden">
                  <HelpCircle className="w-10 h-10 opacity-20 absolute -right-4 -top-4 text-white" />
                  <h4 className="font-extrabold text-xl mb-2">Need Extension?</h4>
                  <p className="text-indigo-100 text-sm mb-6">Already out and need more time? Contact the hostel warden immediately.</p>
                  <button 
                    onClick={() => alert('Calling Warden Priya Sharma at +91 98765 43211')}
                    className="w-full py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    Call Priya Sharma
                  </button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
