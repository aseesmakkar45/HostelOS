'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import Link from 'next/link';
import { 
  Building2, 
  Bed, 
  CreditCard, 
  Wrench, 
  QrCode, 
  Calendar,
  Ticket,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiDismissed, setAiDismissed] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const roomRes = await axios.get('/student/room').catch(() => null);
        const feesRes = await axios.get('/student/fees').catch(() => null);
        const complaintsRes = await axios.get('/student/complaints').catch(() => null);
        const passesRes = await axios.get('/student/gatepasses').catch(() => null);

        const room = roomRes?.data?.success ? roomRes.data.data : null;
        const fees = feesRes?.data?.success ? feesRes.data.data : [];
        const complaints = complaintsRes?.data?.success ? complaintsRes.data.data : [];
        const passes = passesRes?.data?.success ? passesRes.data.data : [];

        const pendingFees = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.amount), 0);
        const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
        const activePass = passes.find(p => p.status === 'Approved' && !p.used);

        setStudentData({
          roomNumber: room?.room_number || '101',
          roomType: room?.room_type || 'Double Sharing',
          floor: room?.floor || '1',
          pendingFees,
          pendingComplaints,
          activePass,
          coupons: 42 // Mocked mess coupon amount
        });
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar role="student" activeItem="dashboard" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar userRoom={studentData ? `Room ${studentData.roomNumber}` : 'Loading...'} />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Hub</h1>
            <p className="text-slate-500 font-medium">Manage your room allocation, payments, mess passes, and support desk.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Room card */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Room</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">Room {studentData?.roomNumber}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">{studentData?.roomType} ({studentData?.floor}F)</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Bed className="w-6 h-6" />
                  </div>
                </div>

                {/* Dues card */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Dues</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">₹{studentData?.pendingFees?.toLocaleString()}.00</h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Semester Billing</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${studentData?.pendingFees > 0 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>

                {/* Coupons card */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mess Coupons</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">{studentData?.coupons}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Remaining balance</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Ticket className="w-6 h-6" />
                  </div>
                </div>

                {/* Support tickets card */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Tickets</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">{studentData?.pendingComplaints}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Active unresolved</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${studentData?.pendingComplaints > 0 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                    <Wrench className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Navigation and AI Insights */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Quick Navigation Panel */}
                <div className="xl:col-span-2 space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-800">Quick Navigation</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <Link href="/dashboard/student/accommodation" className="p-6 bg-white border border-slate-100 rounded-3xl card-hover flex items-start gap-4 shadow-sm group">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                          My Accommodation <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Verify roommate details, view room facilities, and request room changes.</p>
                      </div>
                    </Link>

                    <Link href="/dashboard/student/gatepass" className="p-6 bg-white border border-slate-100 rounded-3xl card-hover flex items-start gap-4 shadow-sm group">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                          Digital Gate Pass <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Generate instant entry/exit QR passes for visitors or self-checkout.</p>
                      </div>
                    </Link>

                    <Link href="/dashboard/student/mess" className="p-6 bg-white border border-slate-100 rounded-3xl card-hover flex items-start gap-4 shadow-sm group">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Ticket className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                          Mess Management <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">View the weekly dining menu calendar and purchase meal coupons.</p>
                      </div>
                    </Link>

                    <Link href="/dashboard/student/leaves" className="p-6 bg-white border border-slate-100 rounded-3xl card-hover flex items-start gap-4 shadow-sm group">
                      <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-amber-500 transition-colors">
                          Leave Requests <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Submit leave applications for weekends and monitor warden approval.</p>
                      </div>
                    </Link>

                  </div>
                </div>

                {/* Right Side: Active Pass & AI Congestion Alert */}
                <div className="space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-800">Status & Insights</h3>

                  {/* Active Gate Pass Status */}
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover shadow-lg">
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-extrabold">Digital Gate Pass</h3>
                        <ShieldCheck className="text-emerald-400 w-6 h-6" />
                      </div>

                      {studentData?.activePass ? (
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Approved Pass</p>
                          <h4 className="text-lg font-extrabold text-emerald-400 mt-1">Ready to Scan</h4>
                          <p className="text-xs text-slate-300 mt-2 font-medium">Valid until: {new Date(studentData.activePass.valid_until).toLocaleString()}</p>
                          <Link 
                            href="/dashboard/student/gatepass"
                            className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl text-center block uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            Show QR Code
                          </Link>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Active Pass</p>
                          <h4 className="text-lg font-extrabold text-slate-300 mt-1">In-Campus Status</h4>
                          <p className="text-xs text-slate-400 mt-2 font-medium">You are currently checked in inside the campus limits.</p>
                          <Link 
                            href="/dashboard/student/gatepass"
                            className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl text-center block uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            Request Pass
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  </div>

                  {/* AI Peak Alert */}
                  {!aiDismissed && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">AI Peak Alert</h4>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">Mess dining hall occupancy is predicted to peak in 15 minutes. Head there early to avoid queues!</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setAiDismissed(true)}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Got it
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
