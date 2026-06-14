'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { 
  Ticket, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  Utensils, 
  Soup, 
  CheckCircle, 
  Check, 
  X,
  ShieldCheck,
  Info,
  Clock
} from 'lucide-react';

export default function MessManagement() {
  const { showToast } = useAuth() || {};
  const [coupons, setCoupons] = useState(42);
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState('Deluxe');

  // We can load menu dynamically or use fallback seed
  useEffect(() => {
    async function loadMenu() {
      try {
        // Normally GET /api/admin/mess would load the mess menu
        // But since this is student view, let's fetch a list if it exists, or use clean fallbacks.
        const response = await axios.get('/student/mess').catch(() => null);
        if (response && response.data.success) {
          setWeeklyMenu(response.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const handleBuyCoupons = () => {
    if (showToast) showToast('Processing coupon purchase for 10 coupons...', 'info');
    setCoupons(prev => prev + 10);
  };

  const handleMarkAttending = (mealType) => {
    if (showToast) showToast(`Marked attending for ${mealType}! Coupon will be deducted.`, 'success');
    setCoupons(prev => Math.max(0, prev - 1));
  };

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
              <h1 className="text-3xl font-extrabold text-slate-900">Mess Management</h1>
              <p className="text-slate-500 font-medium">Monitor your meal plans, menus, and attendance.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-3 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Remaining Coupons</p>
                  <p className="text-xl font-extrabold text-indigo-600">{coupons}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
              <button 
                onClick={handleBuyCoupons}
                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Buy Coupons
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              {/* Weekly Menu Calendar */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-extrabold text-slate-800">Weekly Menu Calendar</h2>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-slate-600 px-4 py-2">Oct 16 - Oct 22</span>
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-6">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const isToday = day === 'Wed'; // Wed is highlighted in preview
                    return (
                      <div key={day} className="text-center space-y-2">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>{day}</p>
                        {isToday ? (
                          <div className="w-full aspect-square bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <span className="text-sm font-bold">{16 + idx}</span>
                            <div className="w-1 h-1 bg-white rounded-full mt-1"></div>
                          </div>
                        ) : (
                          <div className="w-full aspect-square bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group hover:border-indigo-200 cursor-pointer transition-all">
                            <span className="text-sm font-bold text-slate-700">{16 + idx}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {/* Breakfast */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                        <Coffee className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Breakfast • 07:30 - 09:30</p>
                        <h4 className="text-lg font-bold text-slate-800">Multigrain Pancakes & Seasonal Fruits</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">340 kcal</span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">Vegetarian</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMarkAttending('Breakfast')}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 cursor-pointer"
                    >
                      Mark Attending
                    </button>
                  </div>

                  {/* Lunch */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between border-l-4 border-l-indigo-500">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                        <Utensils className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Lunch • 12:30 - 14:30</p>
                        <h4 className="text-lg font-bold text-slate-800">Grilled Chicken with Quinoa & Steamed Broccoli</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">580 kcal</span>
                          <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">High Protein</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold">Selected</span>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                        <Soup className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dinner • 19:30 - 21:30</p>
                        <h4 className="text-lg font-bold text-slate-800">Mixed Vegetable Curry & Garlic Naan</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">420 kcal</span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">Vegan</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMarkAttending('Dinner')}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 cursor-pointer"
                    >
                      Mark Attending
                    </button>
                  </div>
                </div>
              </section>

              {/* Meal Plan Comparison */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover">
                <h2 className="text-xl font-extrabold text-slate-800 mb-8">Meal Plan Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic */}
                  <div className={`p-6 rounded-3xl border flex flex-col h-full ${activePlan === 'Basic' ? 'border-2 border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Basic Plan</p>
                    <p className="text-2xl font-extrabold text-slate-800 mb-4">₹2,500<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> Breakfast & Dinner
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> Weekday Only
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-400">
                        <X className="w-4 h-4 text-rose-400" /> Weekend Meals
                      </li>
                    </ul>
                    {activePlan === 'Basic' ? (
                      <button disabled className="w-full py-3 bg-slate-200 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed">Active</button>
                    ) : (
                      <button 
                        onClick={() => { setActivePlan('Basic'); alert('Plan modified to Basic.'); }}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        Downgrade
                      </button>
                    )}
                  </div>

                  {/* Deluxe */}
                  <div className={`p-6 rounded-3xl border flex flex-col h-full relative ${activePlan === 'Deluxe' ? 'border-2 border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                    {activePlan === 'Deluxe' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">Current Plan</div>}
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Deluxe Plan</p>
                    <p className="text-2xl font-extrabold text-slate-800 mb-4">₹3,500<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> All 4 Meals (Snacks incl)
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> 7 Days a Week
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> Nutrition Tracking
                      </li>
                    </ul>
                    {activePlan === 'Deluxe' ? (
                      <button disabled className="w-full py-3 bg-slate-200 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed">Active</button>
                    ) : (
                      <button 
                        onClick={() => { setActivePlan('Deluxe'); alert('Plan modified to Deluxe.'); }}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        Select Deluxe
                      </button>
                    )}
                  </div>

                  {/* Premium */}
                  <div className={`p-6 rounded-3xl border flex flex-col h-full ${activePlan === 'Premium' ? 'border-2 border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Premium Plan</p>
                    <p className="text-2xl font-extrabold text-slate-800 mb-4">₹4,500<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> Everything in Deluxe
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> Custom Diet Catering
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" /> Priority Service
                      </li>
                    </ul>
                    {activePlan === 'Premium' ? (
                      <button disabled className="w-full py-3 bg-slate-200 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed">Active</button>
                    ) : (
                      <button 
                        onClick={() => { setActivePlan('Premium'); alert('Plan modified to Premium.'); }}
                        className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                      >
                        Upgrade Plan
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Columns */}
            <div className="space-y-8">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6">Plan Status</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Plan</p>
                    <p className="text-lg font-bold text-indigo-600">{activePlan} Quarterly</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Renewal Date</p>
                      <p className="text-sm font-bold text-slate-700">Nov 24, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Paid</p>
                      <p className="text-sm font-bold text-slate-700">₹3,500.00 (Sept 01)</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-xs font-bold text-slate-400">Attendance (Oct)</p>
                      <p className="text-xs font-bold text-indigo-600">84%</p>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full w-[84%] rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Target: Min 60% for full rebate eligibility</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6">Fee Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500 font-medium">Cost per Meal</span>
                    <span className="text-sm font-bold text-slate-800">₹80.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500 font-medium">Monthly Maintenance</span>
                    <span className="text-sm font-bold text-slate-800">₹500.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500 font-medium">Festival Surplus</span>
                    <span className="text-sm font-bold text-slate-800">₹200.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-800">Total Monthly</span>
                    <span className="text-lg font-extrabold text-indigo-600">₹3,500.00</span>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden card-hover">
                <div className="relative z-10">
                  <h3 className="text-lg font-extrabold mb-6">Dietary Requirements</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <p className="text-sm font-bold">Registered Allergies</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full">Peanuts</span>
                        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full">Shellfish</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Info className="w-5 h-5 text-indigo-400" />
                        <p className="text-sm font-bold">Preferences</p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">Lactose intolerant, prefer soy/almond milk with breakfast.</p>
                    </div>
                    <button 
                      onClick={() => alert('Opening allergies update modal...')}
                      className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 mt-2 cursor-pointer"
                    >
                      Update Preferences
                    </button>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
              </section>

              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Dining Hall Tip</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">Lunch usually has shortest lines between 13:30 - 14:00. Check the live occupancy alert on dashboard!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
