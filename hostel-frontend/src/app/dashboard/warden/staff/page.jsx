'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  Award, 
  CheckCircle,
  Plus
} from 'lucide-react';

export default function StaffManagement() {
  const { showToast } = useAuth() || {};
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');

  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await axios.get('/warden/staff');
        if (response.data.success) {
          setStaffList(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching staff logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  const getShiftBadgeClass = (shift) => {
    if (shift === 'Morning Shift') return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (shift === 'Evening Shift') return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-purple-50 text-purple-700 border border-purple-100'; // Night Shift
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          staff.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = shiftFilter === 'All' || staff.shift === shiftFilter;
    return matchesSearch && matchesShift;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="staff" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Operations & Rosters</h1>
              <p className="text-sm text-slate-500 font-medium">Coordinate shift scheduling, monitor performance indices, and manage duty logs.</p>
            </div>
            <button 
              onClick={() => showToast && showToast('New shift schedule form opened...', 'info')}
              className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              Schedule Shift
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Table Area */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by staff name or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={shiftFilter}
                    onChange={(e) => setShiftFilter(e.target.value)}
                    className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer text-slate-600"
                  >
                    <option value="All">All Shift Types</option>
                    <option>Morning Shift</option>
                    <option>Evening Shift</option>
                    <option>Night Shift</option>
                  </select>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium">
                    No staff records found matching current query.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="pb-4">Staff Member</th>
                          <th className="pb-4">Operating Role</th>
                          <th className="pb-4">Assigned Shift</th>
                          <th className="pb-4">Contact Number</th>
                          <th className="pb-4">Performance Status</th>
                          <th className="pb-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredStaff.map((staff) => (
                          <tr key={staff.id}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} 
                                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0" 
                                  alt="avatar" 
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">{staff.name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">Active Status: {staff.status}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 font-bold text-slate-600 text-sm">{staff.role}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${getShiftBadgeClass(staff.shift)}`}>
                                {staff.shift}
                              </span>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-500">{staff.contact}</td>
                            <td className="py-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                <Award className="w-4 h-4 text-indigo-500" />
                                {staff.performance}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => showToast && showToast(`Editing shift duty checklist for ${staff.name}...`, 'info')}
                                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase rounded-lg transition-all ml-auto cursor-pointer"
                              >
                                Edit Duty
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Attendance Widget */}
            <aside className="col-span-12 lg:col-span-3 space-y-8">
              
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-200">Daily Attendance</h3>
                    <CheckCircle className="text-emerald-400 w-5 h-5" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-black text-white">14 / 16</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Staff Present Today</p>
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white border-4 border-white/5">
                      <span className="text-sm font-extrabold">91%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Late Arrivals</p>
                      <p className="text-base font-bold text-amber-400">02</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">On Leaves</p>
                      <p className="text-base font-bold text-rose-400">01</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => showToast && showToast('Exporting daily timesheet logs...', 'info')}
                    className="w-full py-3.5 bg-indigo-600 text-white text-[10px] font-extrabold uppercase rounded-xl hover:bg-indigo-500 transition-all tracking-widest cursor-pointer"
                  >
                    Export Timesheet
                  </button>
                </div>
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/25 rounded-full blur-xl"></div>
              </div>

              {/* Roster rules */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Duty Supervisors</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anna" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100" alt="avatar" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Anna Taylor</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tight">Security Officer</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
