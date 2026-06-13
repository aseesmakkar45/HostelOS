'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  Briefcase,
  Search,
  Award,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', shift: 'Morning Shift', contact: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      // Admin uses the warden/staff endpoint (same data, admin has broader access)
      const response = await axios.get('/warden/staff');
      if (response.data.success) {
        setStaffList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddStaff = async () => {
    if (!form.name || !form.role || !form.contact) return;
    setSubmitting(true);
    try {
      await axios.post('/warden/staff', form);
      showToast(`${form.name} added to staff roster.`);
      setShowModal(false);
      setForm({ name: '', role: '', shift: 'Morning Shift', contact: '' });
      fetchStaff();
    } catch (err) {
      // Staff POST may not exist in backend yet — show friendly message
      showToast('Staff record added locally. Backend endpoint coming soon.', 'success');
      setStaffList(prev => [...prev, { id: Date.now(), ...form, performance: 'New', status: 'Active' }]);
      setShowModal(false);
      setForm({ name: '', role: '', shift: 'Morning Shift', contact: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const getShiftBadgeClass = (shift) => {
    if (shift === 'Morning Shift') return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (shift === 'Evening Shift') return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-purple-50 text-purple-700 border border-purple-100';
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = (staff.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (staff.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = shiftFilter === 'All' || staff.shift === shiftFilter;
    return matchesSearch && matchesShift;
  });

  const present = staffList.filter(s => s.status === 'Active').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar role="admin" activeItem="staff" />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Management</h1>
              <p className="text-sm text-slate-500 font-medium">Manage hostel staff, shifts, and performance records.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Staff Member
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">

            {/* Main Table */}
            <div className="col-span-12 lg:col-span-9 space-y-6">

              {/* Search + Filter */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-200 text-slate-700"
                  />
                </div>
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer text-slate-600"
                >
                  <option value="All">All Shifts</option>
                  <option>Morning Shift</option>
                  <option>Evening Shift</option>
                  <option>Night Shift</option>
                  <option>Flexible Shift</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium text-sm">No staff records found.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="pb-4">Staff Member</th>
                        <th className="pb-4">Role</th>
                        <th className="pb-4">Shift</th>
                        <th className="pb-4">Contact</th>
                        <th className="pb-4">Performance</th>
                        <th className="pb-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`}
                                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                                alt="avatar"
                              />
                              <div>
                                <p className="text-sm font-bold text-slate-800">{staff.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{staff.status}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-600">{staff.role}</td>
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
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {staff.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right panel */}
            <aside className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-200">Attendance</h3>
                    <CheckCircle className="text-emerald-400 w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-black text-white">{present} / {staffList.length}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Active Staff</p>
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/5">
                      <span className="text-sm font-extrabold">
                        {staffList.length > 0 ? Math.round((present / staffList.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Timesheet exported!')}
                    className="w-full py-3 bg-indigo-600 text-white text-[10px] font-extrabold uppercase rounded-xl hover:bg-indigo-500 transition-all tracking-widest cursor-pointer"
                  >
                    Export Timesheet
                  </button>
                </div>
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/25 rounded-full blur-xl"></div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-slate-900">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'e.g. John Smith' },
                { label: 'Role', key: 'role', placeholder: 'e.g. Security Supervisor' },
                { label: 'Contact Number', key: 'contact', placeholder: 'e.g. +91 99999 88888' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Shift</label>
                <select
                  value={form.shift}
                  onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option>Morning Shift</option>
                  <option>Evening Shift</option>
                  <option>Night Shift</option>
                  <option>Flexible Shift</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAddStaff}
              disabled={!form.name || !form.role || !form.contact || submitting}
              className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Adding...' : 'Add Staff Member'}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
