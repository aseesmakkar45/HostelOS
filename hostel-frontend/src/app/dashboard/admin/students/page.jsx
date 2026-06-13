'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Users, Search, Home, Plus, X, CheckCircle } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, rRes] = await Promise.all([
          axios.get('/admin/students'),
          axios.get('/admin/rooms'),
        ]);
        if (sRes.data.success) setStudents(sRes.data.data);
        if (rRes.data.success) setRooms(rRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAllocate = async () => {
    if (!selectedStudent || !selectedRoom) return;
    setAllocating(true);
    try {
      await axios.post('/admin/allocate', {
        student_id: selectedStudent.id,
        room_id: parseInt(selectedRoom),
      });
      showToast(`Room allocated to ${selectedStudent.name} successfully!`);
      // Refresh students list
      const sRes = await axios.get('/admin/students');
      if (sRes.data.success) setStudents(sRes.data.data);
      setShowModal(false);
      setSelectedStudent(null);
      setSelectedRoom('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Allocation failed', 'error');
    } finally {
      setAllocating(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const availableRooms = rooms.filter(r => r.occupied < r.capacity);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar role="admin" activeItem="students" />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
              <p className="text-sm text-slate-500 font-medium">Manage residents and room allocations.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              Allocate Room
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Floor</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {s.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">{s.email}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">{s.phone || '—'}</td>
                      <td className="px-6 py-4">
                        {s.room_number ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <Home className="w-3.5 h-3.5 text-indigo-400" /> Room {s.room_number}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold">Unallocated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{s.floor ? `Floor ${s.floor}` : '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setSelectedStudent(s); setShowModal(true); }}
                          className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          {s.room_number ? 'Reassign' : 'Assign Room'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Allocate Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-slate-900">Allocate Room</h2>
              <button onClick={() => { setShowModal(false); setSelectedStudent(null); setSelectedRoom(''); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Student</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={selectedStudent?.id || ''}
                  onChange={e => setSelectedStudent(students.find(s => s.id === parseInt(e.target.value)))}
                >
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Available Room</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={selectedRoom}
                  onChange={e => setSelectedRoom(e.target.value)}
                >
                  <option value="">Select room...</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} — {r.room_type} ({r.occupied}/{r.capacity} occupied)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAllocate}
              disabled={!selectedStudent || !selectedRoom || allocating}
              className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {allocating ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
