'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Utensils
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AIAnalytics() {
  const [reportDateRange, setReportDateRange] = useState('Oct 01 - Oct 31');

  const diningForecastData = [
    { name: 'Breakfast (8 AM)', load: 85, capacity: 100 },
    { name: 'Lunch (1 PM)', load: 115, capacity: 100 },
    { name: 'Snacks (5 PM)', load: 60, capacity: 100 },
    { name: 'Dinner (8 PM)', load: 95, capacity: 100 },
  ];

  const complaintDistributionData = [
    { name: 'Electrical', value: 45, color: '#6366f1' },
    { name: 'Plumbing', value: 30, color: '#3b82f6' },
    { name: 'Internet/Wifi', value: 15, color: '#f59e0b' },
    { name: 'Cleanliness', value: 10, color: '#10b981' }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="analytics" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                AI Analytics & Smart Insights
              </h1>
              <p className="text-sm text-slate-500 font-medium">Predictive modeling, automated security sweeps, and operational congestion forecasting.</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Column: Analytics Reports */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Dynamic Heatmaps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Congestion Index</p>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-bold uppercase rounded-full">High</span>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-black text-slate-900">115% Max</h3>
                    <span className="text-xs font-bold text-rose-500">Dining (Lunch)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-rose-500 w-[95%] rounded-full"></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complaint Resolution Rate</p>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-bold uppercase rounded-full">Healthy</span>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-black text-slate-900">4.2 Hrs</h3>
                    <span className="text-xs font-bold text-emerald-500">Avg MTTR</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-emerald-500 w-[84%] rounded-full"></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm card-hover">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gate Security Score</p>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[8px] font-bold uppercase rounded-full">Optimal</span>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-black text-slate-900">99.8%</h3>
                    <span className="text-xs font-bold text-indigo-500">Valid Scans</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-indigo-500 w-[99%] rounded-full"></div>
                  </div>
                </div>

              </div>

              {/* Dining Forecast */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-indigo-600" />
                      Dining Hall Congestion Forecast Model
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">AI-driven predictive occupancy load per meal session.</p>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diningForecastData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="load" name="Predicted Load (%)" fill="#6366f1" radius={[10, 10, 0, 0]} />
                      <Bar dataKey="capacity" name="Safe Cap Limit" fill="#cbd5e1" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Complaint Category distribution */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Complaint Pattern Distribution
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mb-6">Electrical repairs remain the most reported category.</p>
                  
                  <div className="space-y-4">
                    {complaintDistributionData.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>{item.name}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-64 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complaintDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {complaintDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right Column: AI Suggestions and Settings */}
            <aside className="col-span-12 lg:col-span-4 space-y-8">
              
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-extrabold uppercase tracking-wider text-indigo-200">AI Report Builder</h3>
                    <TrendingUp className="text-emerald-400 w-5 h-5" />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/10 accent-white" />
                      Include Congestion Forecast
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/10 accent-white" />
                      Include Resolution Metrics
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/10 accent-white" />
                      Include Staff Performance Logs
                    </label>
                    
                    <div className="pt-4">
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2">Report Window</p>
                      <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between">
                        <span>{reportDateRange}</span>
                        <Calendar className="w-4 h-4 text-indigo-200" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert('Compiling detailed AI Operations audit pdf...')}
                    className="w-full py-4 bg-white text-indigo-900 text-xs font-extrabold rounded-xl uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Generate Report
                  </button>
                </div>
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl"></div>
              </div>

              {/* Safety alerts */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6">Security & Safety Sweeps</h3>
                <div className="space-y-5">
                  
                  <div className="flex gap-4 p-4 border border-rose-50 rounded-2xl bg-rose-50/20">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Dining Tailgating Detected</p>
                      <p className="text-[10px] text-rose-600 font-bold uppercase mt-1">Triggered: 10 mins ago</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 border border-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">CCTV Node Check Complete</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">All 14 cameras stable</p>
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
