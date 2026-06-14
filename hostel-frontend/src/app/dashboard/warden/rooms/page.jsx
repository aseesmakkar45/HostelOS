'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { 
  Building, 
  UserPlus, 
  Info,
  ShieldCheck,
  Plus,
  PenTool,
  Paintbrush,
  Clock
} from 'lucide-react';

export default function WardenRooms() {
  const { showToast } = useAuth() || {};
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState('Block A');
  const [selectedFloor, setSelectedFloor] = useState('Floor 1');
  const [focusedRoom, setFocusedRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/warden/rooms');
      if (response.data.success) {
        setRooms(response.data.data);
        if (response.data.data.length > 0) {
          setFocusedRoom(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching warden rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColorClass = (status, occupied, capacity) => {
    if (status?.toLowerCase() === 'maintenance') return 'bg-amber-500 shadow-amber-50';
    if (occupied >= capacity) return 'bg-indigo-600 shadow-indigo-100';
    if (occupied === 0) return 'bg-emerald-500 shadow-emerald-50';
    return 'bg-slate-300 text-slate-600'; // Reserved/Partial
  };

  // Calculations based on the fetched rooms array
  let blockAOccupied = 0, blockACapacity = 0;
  let blockBOccupied = 0, blockBCapacity = 0;
  let blockCOccupied = 0, blockCCapacity = 0;
  let maintenanceRoomsCount = 0;

  rooms.forEach(room => {
    if (room.status?.toLowerCase() === 'maintenance') {
      maintenanceRoomsCount++;
    }
    const blockChar = room.room_number.charAt(0).toUpperCase();
    if (blockChar === 'A') {
      blockAOccupied += room.occupied || 0;
      blockACapacity += room.capacity || 0;
    } else if (blockChar === 'B') {
      blockBOccupied += room.occupied || 0;
      blockBCapacity += room.capacity || 0;
    } else if (blockChar === 'C') {
      blockCOccupied += room.occupied || 0;
      blockCCapacity += room.capacity || 0;
    }
  });

  const blockAVacant = Math.max(0, blockACapacity - blockAOccupied);
  const blockBVacant = Math.max(0, blockBCapacity - blockBOccupied);
  const blockCVacant = Math.max(0, blockCCapacity - blockCOccupied);

  const blockAPct = blockACapacity > 0 ? Math.round((blockAOccupied / blockACapacity) * 100) : 0;
  const blockBPct = blockBCapacity > 0 ? Math.round((blockBOccupied / blockBCapacity) * 100) : 0;
  const blockCPct = blockCCapacity > 0 ? Math.round((blockCOccupied / blockCCapacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar role="warden" activeItem="rooms" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room & Occupancy Management</h1>
              <p className="text-sm text-slate-500 font-medium">Monitor live bed status and manage room allocations.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => showToast && showToast('Cleaning schedule opened', 'info')}
                className="bg-white text-slate-700 font-bold px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Paintbrush className="w-4 h-4 text-slate-500" />
                Schedule Cleaning
              </button>
              <button 
                onClick={() => showToast && showToast('Quick allocate opened', 'info')}
                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Quick Assign
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <section className="col-span-12 lg:col-span-9 space-y-8">
              
              {/* Blocks availability Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Block A Availability</p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-black text-slate-900">{blockAOccupied} / {blockACapacity}</h3>
                    <span className="text-xs font-bold text-emerald-500">{blockAVacant} Vacant</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${blockAPct}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Block B Availability</p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-black text-slate-900">{blockBOccupied} / {blockBCapacity}</h3>
                    <span className="text-xs font-bold text-rose-500">{blockBVacant} Vacant</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${blockBPct}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Block C Availability</p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-black text-slate-900">{blockCOccupied} / {blockCCapacity}</h3>
                    <span className="text-xs font-bold text-indigo-500">{blockCVacant} Vacant</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${blockCPct}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-hover">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Under Maintenance</p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-black text-slate-900">{maintenanceRoomsCount}</h3>
                    <span className="text-xs font-bold text-amber-500">Rooms</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.round((maintenanceRoomsCount / (rooms.length || 1)) * 100))}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <h3 className="text-xl font-extrabold text-slate-800">Floor Status Grid</h3>
                  <div className="flex flex-wrap gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 px-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Vacant</span>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Maint.</span>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Reserved</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option>Block A</option>
                      <option>Block B</option>
                      <option>Block C</option>
                    </select>
                    <select 
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option>Floor 1</option>
                      <option>Floor 2</option>
                      <option>Floor 3</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-10 gap-4">
                    {(() => {
                      const filtered = rooms.filter(room => {
                        const blockLetter = selectedBlock.replace('Block ', '').trim();
                        const floorNum = parseInt(selectedFloor.replace('Floor ', '').trim(), 10);
                        return room.room_number.startsWith(blockLetter) && room.floor === floorNum;
                      });
                      if (filtered.length === 0) {
                        return <div className="col-span-10 text-center py-10 text-slate-400 text-xs font-bold">No rooms found for this block and floor.</div>;
                      }
                      return filtered.map((room) => (
                        <div 
                          key={room.id}
                          onClick={() => setFocusedRoom(room)}
                          className={`room-node aspect-square text-white rounded-2xl flex items-center justify-center font-bold text-sm cursor-pointer shadow-lg transition-transform ${
                            getStatusColorClass(room.status, room.occupied, room.capacity)
                          }`}
                          title={`Room ${room.room_number} - ${room.status}`}
                        >
                          {room.room_number}
                        </div>
                      ));
                    })()}
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-500" /> Click any room for detailed audit and occupant management.
                    </div>
                  </div>
                  <button className="text-indigo-600 font-bold text-xs uppercase tracking-widest hover:underline cursor-pointer">
                    View Full Matrix
                  </button>
                </div>
              </div>

              {/* Occupancy Chart Placeholder */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-extrabold text-slate-800">Occupancy Trends</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-widest">Monthly</button>
                    <button className="px-4 py-1.5 text-[10px] font-bold rounded-lg text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Weekly</button>
                  </div>
                </div>
                <div className="h-48 flex items-end justify-between px-4 gap-4">
                  {['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV'].map((month, idx) => {
                    const h = [70, 75, 85, 98, 85, 90][idx];
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-t-xl h-[100px] relative">
                          <div 
                            style={{ height: `${h}%` }}
                            className={`absolute bottom-0 w-full rounded-t-xl transition-all ${
                              month === 'SEP' ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-indigo-500'
                            }`}
                          />
                        </div>
                        <span className={`text-[9px] font-bold ${month === 'SEP' ? 'text-slate-800' : 'text-slate-400'}`}>{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Right Column details */}
            <section className="col-span-12 lg:col-span-3 space-y-8">
              {focusedRoom ? (
                <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover shadow-xl">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h3 className="text-xl font-extrabold mb-1">Room Focus: {focusedRoom.room_number}</h3>
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold uppercase rounded-full">
                        Capacity: {focusedRoom.occupied}/{focusedRoom.capacity}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {focusedRoom.occupied > 0 ? (
                        Array.from({ length: focusedRoom.occupied }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Resident-${i}`} className="w-10 h-10 rounded-xl bg-white/10" alt="avatar" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">Resident {i + 1}</p>
                              <p className="text-[10px] text-white/60">Check-in: Aug 24</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-indigo-200">Room is currently empty.</p>
                      )}

                      {focusedRoom.occupied < focusedRoom.capacity && (
                        <div className="flex items-center gap-3 border-2 border-dashed border-white/20 rounded-xl p-2 cursor-pointer hover:bg-white/5 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                            <Plus className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-bold text-white/40">Empty Bed Available</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Status</span>
                        <span className="font-bold uppercase">{focusedRoom.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60">Room Type</span>
                        <span className="font-bold uppercase">{focusedRoom.room_type}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => showToast && showToast(`Editing Room ${focusedRoom.room_number}`, 'info')}
                        className="py-2 bg-white text-indigo-900 text-[10px] font-extrabold rounded-lg uppercase tracking-widest hover:bg-slate-50 cursor-pointer"
                      >
                        Edit Room
                      </button>
                      <button 
                        onClick={() => showToast && showToast(`Viewing history of Room ${focusedRoom.room_number}`, 'info')}
                        className="py-2 bg-white/10 border border-white/20 text-white text-[10px] font-extrabold rounded-lg uppercase tracking-widest cursor-pointer"
                      >
                        History
                      </button>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                </div>
              ) : (
                <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden card-hover shadow-xl text-center">
                  Select a room from grid to audit.
                </div>
              )}

              {/* Maintenance Schedule */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 card-hover shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6">Maintenance Schedule</h3>
                <div className="space-y-5">
                  <div className="flex gap-4 p-4 border border-amber-50 rounded-2xl bg-amber-50/30">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                      <PenTool className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Room 204 - AC Service</p>
                      <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">Scheduled: Today, 2PM</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                      <Paintbrush className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Block B - Painting</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Oct 26 - Oct 28</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">Safety Threshold</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 font-semibold">92% Occupancy is within optimal safety limits. Next capacity review in 14 days.</p>
                  <button className="w-full py-3 bg-white text-emerald-600 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest cursor-pointer">
                    View safety log
                  </button>
                </div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl"></div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
