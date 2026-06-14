'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  Home, 
  Zap, 
  UtensilsCrossed, 
  ExternalLink, 
  MoreVertical,
  Sparkles
} from 'lucide-react';

export default function PaymentHistory() {
  const { showToast } = useAuth() || {};
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [outstanding, setOutstanding] = useState(0);

  useEffect(() => {
    async function fetchFees() {
      try {
        const response = await axios.get('/student/fees');
        if (response.data.success) {
          const fetchedFees = response.data.data;
          setFees(fetchedFees);
          
          // Calculate outstanding (pending) fees
          const unpaidSum = fetchedFees
            .filter(fee => fee.status === 'pending')
            .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
          setOutstanding(unpaidSum);
        }
      } catch (err) {
        console.error('Error fetching fees:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, []);

  const handlePayOutstanding = async () => {
    const pendingFees = fees.filter(fee => fee.status === 'pending');
    if (pendingFees.length === 0) {
      if (showToast) showToast('You have no outstanding dues!', 'info');
      return;
    }

    try {
      setLoading(true);
      await Promise.all(
        pendingFees.map(fee => axios.patch(`/student/fees/${fee.id}/pay`))
      );

      // Re-fetch fees
      const response = await axios.get('/student/fees');
      if (response.data.success) {
        const fetchedFees = response.data.data;
        setFees(fetchedFees);
        const unpaidSum = fetchedFees
          .filter(fee => fee.status === 'pending')
          .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
        setOutstanding(unpaidSum);
      }
      if (showToast) showToast('All outstanding payments processed successfully!', 'success');
    } catch (err) {
      console.error('Error paying outstanding fees:', err);
      if (showToast) showToast('Failed to process payments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFeeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hostel':
        return <Home className="w-5 h-5 text-indigo-600" />;
      case 'electricity':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'mess':
        return <UtensilsCrossed className="w-5 h-5 text-emerald-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">Paid</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">Unpaid</span>;
      case 'overdue':
        return <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">Overdue</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">{status}</span>;
    }
  };

  const filteredFees = fees.filter(fee => {
    if (filter === 'all') return true;
    if (filter === 'paid') return fee.status === 'paid';
    if (filter === 'unpaid') return fee.status === 'pending';
    if (filter === 'overdue') return fee.status === 'overdue';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar activeItem="payments" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          {/* Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center shadow-xl shadow-indigo-200">
              <div className="mb-6 md:mb-0">
                <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
                <h2 className="text-5xl font-extrabold">₹{outstanding.toFixed(2)}</h2>
                <div className="mt-4 flex items-center gap-2">
                  <Calendar className="text-indigo-200 w-5 h-5" />
                  <span className="text-indigo-100 text-sm font-medium">Due by next cycle</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button 
                  onClick={handlePayOutstanding}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" />
                  Pay Outstanding
                </button>
                <button 
                  onClick={() => showToast && showToast('Auto-Pay configuration opened.', 'info')}
                  className="px-8 py-3 bg-indigo-400/30 text-white rounded-2xl font-semibold border border-white/20 hover:bg-indigo-400/40 transition-all text-sm cursor-pointer"
                >
                  Manage Auto-Pay
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col justify-center card-hover">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Yearly Paid</p>
                  <p className="text-2xl font-extrabold text-slate-800">₹13,500.00</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>12% less than last semester</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Billing History Table */}
            <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-xl font-extrabold text-slate-800">Billing Records</h2>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  {['all', 'paid', 'unpaid', 'overdue'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filter === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                        <th className="pb-4 font-bold">Invoice Item</th>
                        <th className="pb-4 font-bold">Due Date</th>
                        <th className="pb-4 font-bold text-right">Amount</th>
                        <th className="pb-4 font-bold text-center">Status</th>
                        <th className="pb-4 font-bold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredFees.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">No records found.</td>
                        </tr>
                      ) : (
                        filteredFees.map((fee) => (
                          <tr key={fee.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                  {getFeeIcon(fee.fee_type)}
                                </div>
                                <p className="font-bold text-slate-800 text-sm">
                                  {fee.fee_type?.charAt(0).toUpperCase() + fee.fee_type?.slice(1)} Fee
                                </p>
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-500 font-medium">
                              {new Date(fee.due_date).toLocaleDateString()}
                            </td>
                            <td className="py-5 text-sm font-bold text-slate-800 text-right">
                              ₹{parseFloat(fee.amount).toFixed(2)}
                            </td>
                            <td className="py-5 text-center text-sm font-medium">
                              {getStatusBadge(fee.status)}
                            </td>
                            <td className="py-5 text-right">
                              <button 
                                onClick={() => showToast && showToast(`Opening invoice details for ${fee.fee_type} fee`, 'info')}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <button 
                onClick={() => showToast && showToast('Loading full history...', 'info')}
                className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 text-slate-400 text-sm font-bold rounded-2xl hover:border-indigo-100 hover:text-indigo-400 transition-all cursor-pointer"
              >
                View / Load Full History
              </button>
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-8">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-extrabold text-slate-800">Saved Methods</h2>
                  <button 
                    onClick={() => showToast && showToast('Add new payment method modal...', 'info')}
                    className="text-indigo-600 text-sm font-bold cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <span className="text-[18px] font-extrabold tracking-widest text-indigo-400">VISA</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">Primary</span>
                      </div>
                      <p className="text-lg font-medium tracking-widest mb-1">•••• •••• •••• 4281</p>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-slate-400 uppercase tracking-tighter">Aarav Sharma</p>
                        <p className="text-xs text-slate-400">05/26</p>
                      </div>
                    </div>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full"></div>
                  </div>

                  <div className="p-5 border border-slate-100 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                        <span className="font-extrabold text-slate-400 text-sm">GPay</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Google Pay</p>
                        <p className="text-xs text-slate-500 font-medium">aarav.pay@upi</p>
                      </div>
                    </div>
                    <MoreVertical className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm card-hover">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800">Quick Tip</h3>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Setting up <span className="text-indigo-600 font-bold">Auto-Pay</span> ensures you never miss a deadline and avoid late fee penalties of ₹50/day.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
