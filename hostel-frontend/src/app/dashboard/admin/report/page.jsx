'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { FileText, Users, CreditCard, Wrench, Calendar, DoorOpen, Download } from 'lucide-react';

const TABS = [
  { id: 'students',   label: 'Students',   icon: Users },
  { id: 'fees',       label: 'Fees',        icon: CreditCard },
  { id: 'complaints', label: 'Complaints',  icon: Wrench },
  { id: 'leaves',     label: 'Leaves',      icon: Calendar },
  { id: 'gateLogs',   label: 'Gate Logs',   icon: DoorOpen },
];

const STATUS_STYLES = {
  paid:     'bg-emerald-100 text-emerald-700',
  pending:  'bg-amber-100 text-amber-700',
  overdue:  'bg-rose-100 text-rose-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  resolved: 'bg-sky-100 text-sky-700',
};

export default function AdminReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/admin/report');
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = () => {
    if (!data) return;
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar role="admin" activeItem="report" />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Full System Report</h1>
              <p className="text-sm text-slate-500 font-medium">A consolidated view of all hostel data — students, fees, complaints, leaves, and gate logs.</p>
            </div>
            <button
              onClick={handleExport}
              className="bg-slate-900 text-white font-bold px-5 py-3 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {data && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                      {data[tab.id]?.length || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

              {/* Students Tab */}
              {activeTab === 'students' && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.students?.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-800 text-sm">{s.name}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{s.email}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{s.phone || '—'}</td>
                        <td className="px-6 py-3 text-xs font-semibold text-slate-700">{s.room_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Fees Tab */}
              {activeTab === 'fees' && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Fee Type</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.fees?.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-800 text-sm">{f.student_name}</td>
                        <td className="px-6 py-3 text-xs text-slate-500 capitalize">{(f.fee_type || '').replace(/_/g, ' ')}</td>
                        <td className="px-6 py-3 text-xs font-bold text-slate-700">₹{parseFloat(f.amount).toLocaleString()}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{new Date(f.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${STATUS_STYLES[f.status] || ''}`}>{f.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Complaints Tab */}
              {activeTab === 'complaints' && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.complaints?.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-800 text-sm">{c.student_name}</td>
                        <td className="px-6 py-3 text-xs text-slate-700 font-semibold">{c.title}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{c.category}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Leaves Tab */}
              {activeTab === 'leaves' && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">From</th>
                      <th className="px-6 py-4">To</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.leaves?.map((l, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-800 text-sm">{l.student_name}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{new Date(l.from_date).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{new Date(l.to_date).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-xs text-slate-600">{l.reason}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${STATUS_STYLES[l.status] || 'bg-slate-100 text-slate-600'}`}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                    {!data?.leaves?.length && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No leave requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Gate Logs Tab */}
              {activeTab === 'gateLogs' && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Visitor</th>
                      <th className="px-6 py-4">Purpose</th>
                      <th className="px-6 py-4">Entry Time</th>
                      <th className="px-6 py-4">Verified By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.gateLogs?.map((g, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-800 text-sm">{g.student_name}</td>
                        <td className="px-6 py-3 text-xs text-slate-600">{g.visitor_name}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{g.purpose}</td>
                        <td className="px-6 py-3 text-xs text-slate-400">{g.entry_time ? new Date(g.entry_time).toLocaleString() : '—'}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{g.verified_by || '—'}</td>
                      </tr>
                    ))}
                    {!data?.gateLogs?.length && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No gate logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
