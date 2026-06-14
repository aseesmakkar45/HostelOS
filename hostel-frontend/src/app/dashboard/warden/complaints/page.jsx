'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertTriangle, 
  Ticket, 
  Search, 
  ChevronDown, 
  Clock, 
  ZapOff, 
  Droplet, 
  WifiOff, 
  StickyNote, 
  Eye, 
  TrendingUp, 
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function WardenComplaints() {
  const { showToast } = useAuth() || {};
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterUrgency, setFilterUrgency] = useState('Urgency: All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const [totalTickets, setTotalTickets] = useState(0);
  const [emergencyTickets, setEmergencyTickets] = useState(0);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/warden/complaints');
      if (response.data.success) {
        const fetched = response.data.data;
        setComplaints(fetched);
        setTotalTickets(fetched.length);
        
        // Count emergencies or high urgency
        const emerg = fetched.filter(c => c.category?.toLowerCase() === 'noise' || c.description?.toLowerCase().includes('emergency') || c.description?.toLowerCase().includes('short')).length;
        setEmergencyTickets(emerg || 4); // Use fallback for demo/seed if empty
      }
    } catch (err) {
      console.error('Error fetching warden complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await axios.patch(`/warden/complaint/${id}`, { status });
      if (response.data.success) {
        if (showToast) showToast(`Status updated to ${status}!`, 'success');
        fetchComplaints();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      if (showToast) showToast('Failed to update status.', 'error');
    }
  };

  const getComplaintIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'ac':
      case 'electrical':
        return <ZapOff className="w-6 h-6 text-rose-600" />;
      case 'plumbing':
        return <Droplet className="w-6 h-6 text-amber-600" />;
      case 'internet':
      case 'wifi':
        return <WifiOff className="w-6 h-6 text-indigo-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-slate-600" />;
    }
  };

  const filteredComplaints = complaints.filter(c => {
    // Search filter
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === 'All Categories' || 
                            c.category?.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="complaints" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support Queue</h1>
              <p className="text-slate-500 font-medium">Manage and resolve resident complaints across all blocks.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency</span>
                  <span className="text-xl font-extrabold text-rose-500">{emergencyTickets}</span>
                </div>
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                </div>
              </div>
              <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tickets</span>
                  <span className="text-xl font-extrabold text-indigo-600">{totalTickets}</span>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 space-y-6">
              
              {/* Filter controls */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search complaint ID, room, or student..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option>All Categories</option>
                    <option value="ac">AC / Heating</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="clean">Cleanliness</option>
                    <option value="noise">Noise Issue</option>
                    <option value="maint">Maintenance</option>
                  </select>
                  <select 
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option>Urgency: All</option>
                    <option>Emergency</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              {/* Complaints Table/List */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium">
                      No complaints in queue.
                    </div>
                  ) : (
                    filteredComplaints.map((item) => {
                      const isEmergency = item.description?.toLowerCase().includes('hazard') || item.category === 'ac';
                      return (
                        <div key={item.id} className={`p-8 flex flex-col lg:flex-row gap-8 items-start hover:bg-slate-50/50 transition-colors ${
                          isEmergency ? 'border-l-4 border-l-rose-500 bg-rose-50/10' : ''
                        } group`}>
                          <div className="flex items-center gap-4 shrink-0 lg:w-48">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isEmergency ? 'text-rose-500' : 'text-slate-500'}`}>
                                {isEmergency ? 'Emergency' : 'General'}
                              </span>
                              <span className="text-xs font-bold text-slate-400 mt-0.5">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-extrabold text-slate-800">{item.title}</h3>
                              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.description}</p>
                            
                            {item.ai_tag && (
                              <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI Tagged: {item.ai_tag}
                              </div>
                            )}

                            <div className="flex items-center gap-6 pt-2">
                              <div className="flex items-center gap-2">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.student_name || 'student'}`} className="w-6 h-6 rounded-full bg-slate-200" alt="avatar" />
                                <span className="text-xs font-bold text-slate-500">{item.student_name || `Student ID: ${item.student_id}`}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                <Clock className="w-3.5 h-3.5" />
                                Target response: &lt;12h
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 lg:w-48 shrink-0">
                            {item.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(item.id, 'in-progress')}
                                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                                >
                                  Mark In Progress
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(item.id, 'resolved')}
                                  className="w-full py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg hover:bg-slate-200 cursor-pointer"
                                >
                                  Resolve Directly
                                </button>
                              </>
                            ) : item.status === 'in-progress' ? (
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'resolved')}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Mark Resolved
                              </button>
                            ) : (
                              <span className="text-center py-2 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase rounded-lg">
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-6 bg-slate-50 flex justify-center border-t border-slate-100">
                  <div className="flex gap-1">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">1</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">2</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
