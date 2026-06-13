'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { 
  ShieldCheck, 
  Clock, 
  Camera, 
  QrCode, 
  Info, 
  Sparkles, 
  Users, 
  AlertTriangle,
  User,
  LogIn,
  LogOut,
  Scan,
  Database,
  Wifi,
  Loader2
} from 'lucide-react';

export default function GateEntryKiosk() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null); // { success: true/false, message: '', data: {} }
  const [logs, setLogs] = useState([
    { name: 'Alex Johnson', type: 'Student', room: '402-B', event: 'In', time: 'Just Now', icon: 'in' },
    { name: 'Samuel Reed', type: 'Student', room: '402-B', event: 'Out', time: '2m ago', icon: 'out' },
    { name: 'Robert Chen', type: 'Visitor', room: 'ID: #9283-V', event: 'In', time: '5m ago', icon: 'in' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    setVerifying(true);
    setResult(null);

    // 2-second simulation delay for AI Verification
    setTimeout(async () => {
      try {
        const response = await axios.post('/gate/verify', { qr_code: qrCodeInput });
        if (response.data.success) {
          const pass = response.data.data;
          setResult({
            success: true,
            message: `Identity Verified — ${pass.student_name || 'Guest'}, Room ${pass.room_number || 'N/A'}`,
            data: pass
          });
          
          // Add to log
          setLogs(prev => [
            { 
              name: pass.student_name || pass.visitor_name || 'Guest', 
              type: pass.student_name ? 'Student' : 'Visitor', 
              room: pass.room_number ? `Room ${pass.room_number}` : 'Visitor', 
              event: 'In', 
              time: 'Just Now', 
              icon: 'in' 
            },
            ...prev
          ]);
        } else {
          setResult({
            success: false,
            message: response.data.error || 'Verification Failed'
          });
        }
      } catch (err) {
        setResult({
          success: false,
          message: err.response?.data?.error || 'Verification Failed: Pass either expired, already used, or invalid.'
        });
      } finally {
        setVerifying(false);
        setQrCodeInput('');
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-24 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-950/50 backdrop-blur-xl z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">GATEENTRY <span className="text-indigo-500">AI</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Horizon Hostel Security</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Occupancy</p>
            <p className="text-2xl font-black text-indigo-400">482 <span className="text-slate-600 text-sm font-medium">/ 500</span></p>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div className="flex items-center gap-4 bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-right">
              <p className="text-lg font-bold text-white leading-none">{currentTime || '14:28:45'}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter mt-1">{currentDate || 'October 24, 2023'}</p>
            </div>
            <Clock className="w-6 h-6 text-slate-500" />
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs border border-slate-700">EN</button>
            <button className="w-10 h-10 rounded-xl bg-slate-950 text-slate-500 font-bold flex items-center justify-center text-xs border border-slate-800">हि</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Verification Left Panel */}
        <div className="col-span-8 flex flex-col p-10 space-y-8 overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-8">
            {/* Camera Frame */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-500" /> AI Face Verification
              </h3>
              <div className="aspect-video bg-slate-950 rounded-[2.5rem] border-2 border-slate-800 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10"></div>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640&auto=format&fit=crop" alt="Camera Feed" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-10 border-2 border-indigo-500/30 rounded-3xl z-20 flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-indigo-500 border-dashed rounded-full animate-spin opacity-50"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Liveness Active</span>
                    </div>
                    <p className="text-sm font-bold text-white">Scanning Environment...</p>
                  </div>
                  <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/30 text-xs font-bold">30 FPS</div>
                </div>
              </div>
            </div>

            {/* QR Scan Input */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-500" /> Digital Pass Scanner
              </h3>
              <div className="aspect-video bg-slate-950 rounded-[2.5rem] border-2 border-slate-800 overflow-hidden relative flex flex-col items-center justify-center p-6">
                <form onSubmit={handleVerify} className="w-full space-y-4 flex flex-col items-center">
                  <div className="w-full relative">
                    <input 
                      type="text" 
                      placeholder="Paste or type QR Code string..."
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all text-center"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Scan QR Code
                  </button>
                </form>
                <p className="text-slate-500 text-xs font-medium mt-4">Simulate pass scanning by typing code above</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Live Verification Box */}
            <div className="col-span-12 lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Verification Status</h3>
                <Info className="w-4 h-4 text-slate-600" />
              </div>

              {verifying ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm font-semibold text-indigo-400 animate-pulse">AI Verifying Identity...</p>
                </div>
              ) : result ? (
                <div className={`p-6 rounded-2xl border ${
                  result.success ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'
                }`}>
                  <p className={`text-lg font-bold ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.message}
                  </p>
                  {result.success && result.data && (
                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500">Visitor</p>
                        <p className="font-bold text-white">{result.data.visitor_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Purpose</p>
                        <p className="font-bold text-white">{result.data.purpose}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-slate-700">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">No Active Scan</p>
                      <p className="text-lg font-bold text-white">System Idle</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Awaiting Input</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Alerts */}
            <div className="col-span-12 lg:col-span-7 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center shadow-inner">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">AI Smart Alert</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                    <Users className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-bold">High Traffic Warning</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Current entry rate (12/min) exceeds standard capacity. AI predicts mess hall congestion in 10 minutes. Opening secondary gate.</p>
                    </div>
                  </div>
                  <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-bold">Unauthorized Tailgating Detected</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Vision system detected an unrecognized person following Student ID #402202. Warden notified.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Access Logs Side Panel */}
        <div className="col-span-4 bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-slate-900/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Access Logs</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Live</span>
              </div>
            </div>
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button className="flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase bg-slate-800 text-white cursor-pointer">All Logs</button>
              <button className="flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase text-slate-500 cursor-pointer">In</button>
              <button className="flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase text-slate-500 cursor-pointer">Out</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="relative">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.name}`} className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800" alt="avatar" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-950 flex items-center justify-center text-[10px] text-white ${
                    log.event === 'In' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {log.event === 'In' ? <LogIn className="w-2 h-2" /> : <LogOut className="w-2 h-2" />}
                  </div>
                </div>
                <div className="flex-1">
                  <div>
                    <p className="text-xs font-bold text-white">{log.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{log.type} • {log.room}</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.time}</p>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-900/50 border-t border-slate-800 space-y-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Verification Fallback</p>
            <button 
              onClick={() => alert('Warden code entrance opened')}
              className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              Enter Warden Code
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-20 bg-slate-950 border-t border-slate-800 flex items-center justify-center px-10 shrink-0">
        <div className="flex gap-12 text-slate-400">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold">Face Verification Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold">QR Module Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold">Cloud Syncing...</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold">Network: Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
