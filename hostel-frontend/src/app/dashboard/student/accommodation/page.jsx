'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { 
  Building, 
  CalendarCheck, 
  CalendarClock, 
  Zap, 
  Mail, 
  Phone, 
  BookOpen, 
  MessageSquareText,
  Bed,
  Monitor,
  Snowflake,
  Wifi,
  Archive,
  Fan,
  Lamp,
  Trash2,
  CheckCircle,
  ShieldAlert,
  Headphones,
  AlertCircle,
  ArrowRightLeft
} from 'lucide-react';

export default function AccommodationDetails() {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRoom() {
      try {
        const response = await axios.get('/student/room');
        if (response.data.success) {
          setRoomData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details.');
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, []);

  const handleReportIssue = () => {
    alert('Redirecting to support to file a complaint...');
  };

  const handleRoomChange = () => {
    alert('Room change request submitted to Warden.');
  };

  const roommates = roomData?.roommates || [
    { name: 'Samuel Reed', email: 'sam.r@university.edu', phone: '+1 234-567-890' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar activeItem="accommodation" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar userRoom={roomData ? `Room ${roomData.room_number}` : 'Loading...'} />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          {/* Page Title Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-3xl font-extrabold text-slate-900">Accommodation Details</h1>
              <p className="text-slate-500 font-medium">Manage your personal space and residential preferences.</p>
            </div>
            <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <button 
                onClick={handleReportIssue}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <AlertCircle className="w-5 h-5 text-slate-500" />
                Report Issue
              </button>
              <button 
                onClick={handleRoomChange}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowRightLeft className="w-5 h-5" />
                Request Room Change
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column: Room & Roommate */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* Room Assignment Card */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Building className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800">
                        {roomData ? `Room ${roomData.room_number}` : 'Room 402-B'}
                      </h2>
                      <p className="text-slate-500 font-medium">Horizon International Hostel • Floor {roomData?.floor || '4'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Floor</p>
                      <p className="text-xl font-bold text-slate-800">{roomData?.floor ? `${roomData.floor}th Floor` : '4th Floor'}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Room Type</p>
                      <p className="text-xl font-bold text-slate-800">{roomData?.room_type || 'Double Sharing'}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Occupancy</p>
                      <p className="text-xl font-bold text-slate-800">{roomData?.occupied || '2'} / {roomData?.capacity || '2'}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-12">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Check-in Date</p>
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="text-indigo-600 w-5 h-5" />
                        <span className="font-bold text-slate-700">
                          {roomData?.allocated_at ? new Date(roomData.allocated_at).toLocaleDateString() : 'Aug 24, 2023'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Renewal Date</p>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="text-slate-400 w-5 h-5" />
                        <span className="font-bold text-slate-700">May 15, 2024</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Electricity Meter</p>
                      <div className="flex items-center gap-2">
                        <Zap className="text-amber-500 w-5 h-5" />
                        <span className="font-bold text-slate-700">MET-402-B-09</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Roommate Profile Card */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-6">Roommate Profile</h3>
                  {roommates.map((roommate, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-50 last:border-b-0 pb-6 last:pb-0">
                      <div className="relative">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${roommate.name}`} 
                          alt={roommate.name} 
                          className="w-32 h-32 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl shadow-slate-100" 
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                          <h4 className="text-2xl font-bold text-slate-800">{roommate.name}</h4>
                          <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase rounded-full self-center md:self-auto">Active Resident</span>
                        </div>
                        <p className="text-slate-500 font-medium mb-4 italic">"Third-year Computer Science major. Quiet during exams, night owl."</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-semibold">{roommate.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-semibold">{roommate.phone || '+1 234-567-890'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <BookOpen className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-semibold">Junior Year</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Messaging ${roommate.name}...`)}
                        className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all cursor-pointer"
                      >
                        <MessageSquareText className="w-6 h-6" />
                      </button>
                    </div>
                  ))}
                </section>

                {/* Amenities Grid */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-8">Room Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { icon: Bed, name: 'Twin Bed' },
                      { icon: Monitor, name: 'Study Desk' },
                      { icon: Snowflake, name: 'Central AC' },
                      { icon: Wifi, name: '1Gbps Wi-Fi' },
                      { icon: Archive, name: 'Locker' },
                      { icon: Fan, name: 'Ceiling Fan' },
                      { icon: Lamp, name: 'Reading Light' },
                      { icon: Trash2, name: 'Bin Service' }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 hover:bg-indigo-50/30 transition-colors group">
                          <Icon className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Right Column: Facilities & Rules */}
              <div className="space-y-8">
                {/* Facilities Card */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-hover animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-6">Facilities & Features</h3>
                  <ul className="space-y-4">
                    {[
                      { title: '24/7 Power Backup', desc: 'Uninterrupted study hours ensured.' },
                      { title: 'Biometric Entry', desc: 'AI-verified identity security.' },
                      { title: 'Hot Water Supply', desc: 'Available in attached washroom.' },
                      { title: 'Housekeeping', desc: 'Daily floor & bathroom cleaning.' }
                    ].map((facility, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{facility.title}</p>
                          <p className="text-xs text-slate-500">{facility.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Hostel Rules Card */}
                <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden card-hover animate-fade-in" style={{ animationDelay: '0.35s' }}>
                  <div className="relative z-10">
                    <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                      <ShieldAlert className="text-amber-400 w-6 h-6" />
                      Resident Guidelines
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Curfew Hours</p>
                        <p className="text-sm font-medium">Residents must enter the hostel by <span className="text-indigo-400">10:00 PM</span>. Use Digital Gate Pass for extensions.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visitor Policy</p>
                        <p className="text-sm font-medium">Guests allowed only in the lounge. Room visits require warden approval via portal.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quiet Hours</p>
                        <p className="text-sm font-medium">Strict silence from <span className="text-indigo-400">11:30 PM - 06:00 AM</span> to respect study time.</p>
                      </div>
                    </div>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert('Downloading Student Handbook...'); }}
                      className="mt-8 inline-flex items-center gap-2 text-indigo-400 text-sm font-bold hover:underline"
                    >
                      View Handbook (PDF)
                    </a>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </section>

                {/* Support Contact */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: '0.45s' }}>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-xl mb-2">Concierge Support</h4>
                  <p className="text-indigo-100 text-sm mb-6">Issues with your room? We are here to help 24/7.</p>
                  <button 
                    onClick={() => alert('Starting live chat with support...')}
                    className="w-full py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    Chat with Us
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
