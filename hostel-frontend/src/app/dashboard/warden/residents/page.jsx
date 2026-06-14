'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  AlertCircle,
  FileText,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function ResidentDirectory() {
  const { showToast } = useAuth() || {};
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [blockFilter, setBlockFilter] = useState('All');
  const [selectedResident, setSelectedResident] = useState(null);

  useEffect(() => {
    async function fetchResidents() {
      try {
        const response = await axios.get('/warden/residents');
        if (response.data.success) {
          setResidents(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedResident(response.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching residents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResidents();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Campus':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Out of Campus':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = resident.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resident.student_id.includes(searchQuery) ||
                          resident.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || resident.status === statusFilter;
    const matchesBlock = blockFilter === 'All' || resident.block === blockFilter;
    
    return matchesSearch && matchesStatus && matchesBlock;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="residents" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resident Directory</h1>
              <p className="text-sm text-slate-500 font-medium">Search, filter, and audit active student profiles and status logs.</p>
            </div>
            <button 
              onClick={() => showToast && showToast('New student allocation wizard opened...', 'info')}
              className="bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              Add New Resident
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Column: Directory Table */}
            <section className="col-span-12 lg:col-span-9 space-y-6">
              
              {/* Search & Filters Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer text-slate-600"
                  >
                    <option value="All">All Statuses</option>
                    <option>In Campus</option>
                    <option>On Leave</option>
                    <option>Out of Campus</option>
                  </select>

                  <select
                    value={blockFilter}
                    onChange={(e) => setBlockFilter(e.target.value)}
                    className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer text-slate-600"
                  >
                    <option value="All">All Blocks</option>
                    <option>Block A</option>
                    <option>Block B</option>
                    <option>Block C</option>
                  </select>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : filteredResidents.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium">
                    No residents match search criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="pb-4">Student</th>
                          <th className="pb-4">Room No</th>
                          <th className="pb-4">Block</th>
                          <th className="pb-4">Current Status</th>
                          <th className="pb-4">Emergency Contact</th>
                          <th className="pb-4 text-right">Profile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredResidents.map((resident) => (
                          <tr 
                            key={resident.id}
                            onClick={() => setSelectedResident(resident)}
                            className={`group cursor-pointer hover:bg-slate-50/50 transition-colors ${
                              selectedResident?.id === resident.id ? 'bg-indigo-50/20' : ''
                            }`}
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${resident.name}`} 
                                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0" 
                                  alt="avatar" 
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">{resident.name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">ID: {resident.student_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 font-bold text-slate-600 text-sm">{resident.room}</td>
                            <td className="py-4 text-xs font-semibold text-slate-600">{resident.block}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(resident.status)}`}>
                                {resident.status}
                              </span>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-500">{resident.phone}</td>
                            <td className="py-4 text-right">
                              <button className="p-2 hover:bg-indigo-50 rounded-lg text-slate-300 hover:text-indigo-600 transition-all cursor-pointer">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </section>

            {/* Right Column: Resident Focus Card */}
            <section className="col-span-12 lg:col-span-3 space-y-8">
              {selectedResident ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm text-center relative overflow-hidden card-hover">
                  <div className="relative z-10 flex flex-col items-center">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedResident.name}`} 
                      className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm mb-4" 
                      alt="focused avatar" 
                    />
                    
                    <h3 className="text-lg font-extrabold text-slate-800">{selectedResident.name}</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase mt-1">Room {selectedResident.room}</p>
                    
                    <span className={`px-3 py-1 text-[9px] font-bold rounded-full uppercase mt-4 ${getStatusBadgeClass(selectedResident.status)}`}>
                      {selectedResident.status}
                    </span>

                    <div className="w-full space-y-4 pt-6 mt-6 border-t border-slate-50 text-left">
                      <div className="flex gap-3 items-center text-xs">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 font-semibold truncate">{selectedResident.email}</span>
                      </div>
                      <div className="flex gap-3 items-center text-xs">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 font-semibold">{selectedResident.phone}</span>
                      </div>
                      <div className="flex gap-3 items-center text-xs">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 font-semibold">{selectedResident.block} • Floor 4</span>
                      </div>
                      <div className="flex gap-3 items-center text-xs">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 font-semibold">Check-in: Aug 24, 2025</span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 mt-8">
                      <button 
                        onClick={() => showToast && showToast(`Messaging parent of ${selectedResident.name}...`, 'info')}
                        className="py-3 bg-indigo-50 text-indigo-600 text-[10px] font-extrabold rounded-xl uppercase tracking-widest hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        Parent SOS
                      </button>
                      <button 
                        onClick={() => showToast && showToast(`Shuffling room configuration for ${selectedResident.name}...`, 'info')}
                        className="py-3 bg-indigo-600 text-white text-[10px] font-extrabold rounded-xl uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all cursor-pointer"
                      >
                        Reallocate
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm text-center text-slate-400 font-medium">
                  Select a student to view focus profiles.
                </div>
              )}

              {/* AI Insights Card */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">Warden AI Shuffler</h3>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-2">
                    Warden AI suggests room reshuffling for <span className="font-bold">Block B</span> to improve study hygiene.
                  </p>
                  <button 
                    onClick={() => showToast && showToast('Launching room reshuffling report...', 'info')}
                    className="w-full py-3 bg-white text-indigo-600 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest cursor-pointer mt-6"
                  >
                    Reshuffle Sweep
                  </button>
                </div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-200/30 rounded-full blur-2xl"></div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
