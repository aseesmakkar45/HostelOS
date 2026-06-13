'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { CreditCard, Search, Plus, X, CheckCircle } from 'lucide-react';

const STATUS_STYLES = {
  paid:    'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
};

export default function AdminFeesPage() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    student_id: '',
    fee_type: 'hostel_rent',
    amount: '',
    due_date: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [fRes, sRes] = await Promise.all([
        axios.get('/admin/fees'),
        axios.get('/admin/students'),
      ]);
      if (fRes.data.success) setFees(fRes.data.data);
      if (sRes.data.success) setStudents(sRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddFee = async () => {
    if (!form.student_id || !form.amount || !form.due_date) return;
    setSubmitting(true);
    try {
      await axios.post('/admin/fee', form);
      showToast('Fee record added successfully!');
      setShowModal(false);
      setForm({ student_id: '', fee_type: 'hostel_rent', amount: '', due_date: '' });
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add fee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/admin/fee/${id}`, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      loadAll();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const filtered = fees.filter(f =>
    (f.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.fee_type || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const totalPending = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar role="admin" activeItem="fees" />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Management</h1>
              <p className="text-sm text-slate-500 font-medium">Track, add, and update student fee records.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Fee Record
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Fees</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">₹{(totalPaid + totalPending).toLocaleString()}</h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-2">₹{totalPaid.toLocaleString()}</h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
              <h3 className="text-2xl font-black text-amber-600 mt-2">₹{totalPending.toLocaleString()}</h3>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student or fee type..."
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
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Fee Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{f.student_name}</td>
                      <td className="px-6 py-4 text-xs text-slate-600 capitalize">{(f.fee_type || '').replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">₹{parseFloat(f.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(f.due_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${STATUS_STYLES[f.status] || STATUS_STYLES.pending}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {f.status !== 'paid' && (
                          <button
                            onClick={() => handleStatusChange(f.id, 'paid')}
                            className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer mr-3"
                          >
                            Mark Paid
                          </button>
                        )}
                        {f.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(f.id, 'overdue')}
                            className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Mark Overdue
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">No fee records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-slate-900">Add Fee Record</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Student</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.student_id}
                  onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                >
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Fee Type</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.fee_type}
                  onChange={e => setForm(f => ({ ...f, fee_type: e.target.value }))}
                >
                  <option value="hostel_rent">Hostel Rent</option>
                  <option value="mess_fee">Mess Fee</option>
                  <option value="laundry">Laundry</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="security_deposit">Security Deposit</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <button
              onClick={handleAddFee}
              disabled={!form.student_id || !form.amount || !form.due_date || submitting}
              className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Adding...' : 'Add Fee Record'}
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
