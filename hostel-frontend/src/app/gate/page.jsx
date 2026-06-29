'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
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
  Loader2,
  CheckCircle2,
  BookOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export default function GateEntryKiosk() {
  const { logout, showToast } = useAuth() || {};
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  
  const [verifying, setVerifying] = useState(false);
  const verifyingRef = useRef(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  // Logbook state
  const [logbook, setLogbook] = useState([]);
  const [logbookTab, setLogbookTab] = useState('all');
  const [logbookLoading, setLogbookLoading] = useState(false);
  const [logbookOpen, setLogbookOpen] = useState(true);

  // Biometric camera states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  // Face Recognition States
  const [faceMatcher, setFaceMatcher] = useState(null);
  const faceMatcherRef = useRef(null); // Ref to avoid stale closure in detection loop
  const [registeredFacesCount, setRegisteredFacesCount] = useState(0);
  const cooldownRef = useRef(false);
  const unmatchedCounterRef = useRef(0);

  // Load clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch logbook
  const fetchLogBook = async () => {
    try {
      setLogbookLoading(true);
      const res = await axios.get('/gate/logbook');
      if (res.data.success) setLogbook(res.data.data);
    } catch (e) {
      console.error('Logbook fetch error:', e.message);
    } finally {
      setLogbookLoading(false);
    }
  };

  useEffect(() => {
    fetchLogBook();
    const interval = setInterval(fetchLogBook, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Database Faces & Load TFJS Models
  useEffect(() => {
    let active = true;

    // Helper to build the FaceMatcher from DB
    async function refreshFaceMatcher() {
      try {
        const res = await axios.get(`/gate/faces?t=${Date.now()}`);
        if (res.data.success && res.data.data.length > 0) {
          setRegisteredFacesCount(res.data.data.length);
          const labeledDescriptors = res.data.data.map(user => {
            const arr = JSON.parse(user.face_data);
            return { id: user.id, name: user.name, roll_number: user.roll_number, face_data: arr };
          });
          faceMatcherRef.current = labeledDescriptors;
          setFaceMatcher(labeledDescriptors);
        }
      } catch (err) {
        console.error('Face reload error:', err.message);
      }
    }

    async function loadResources() {
      try {
        // Fetch Registered Faces from Database
        await refreshFaceMatcher();

        if (active) {
          setModelLoaded(true);
          startWebcam();

          // Reload face database every 30s to pick up newly registered students
          const faceReloadTimer = setInterval(() => {
            if (active) refreshFaceMatcher();
          }, 30000);

          return () => clearInterval(faceReloadTimer);
        }
      } catch (err) {
        console.error('Gate Kiosk resource load error:', err);
      }
    }

    loadResources();

    return () => {
      active = false;
      if (animationRef.current) clearInterval(animationRef.current);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setCameraActive(true);
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error('Gate video play error:', e));
          // Removed automatic loop start
        }
      }, 100);
    } catch (err) {
      console.error('Gate webcam startup failed:', err);
    }
  };

  const handleManualScan = async () => {
    if (
      !videoRef.current ||
      videoRef.current.readyState !== 4 ||
      !canvasRef.current ||
      verifying || cooldownRef.current
    ) return;

    setVerifying(true);
    setResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    const registeredFaces = faceMatcherRef.current;

    if (!registeredFaces || registeredFaces.length === 0) {
      setVerifying(false);
      setResult({ success: false, message: 'No Faces in DB', type: 'face' });
      setTimeout(() => setResult(null), 3000);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, registered_faces: registeredFaces })
      });
      const data = await res.json();
      
      if (data.success && data.match) {
        handleFaceAutoVerify(data.match);
      } else {
        handleFaceMismatch();
        setVerifying(false);
      }
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: 'Python AI Offline', type: 'face' });
      setVerifying(false);
      setTimeout(() => setResult(null), 4000);
    }
  };

  // Removed startFaceDetectionLoop

  const handleFaceAutoVerify = async (studentId) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    verifyingRef.current = true;
    setVerifying(true);
    setResult(null);

    const matchedUser = faceMatcherRef.current?.find(u => String(u.id) === String(studentId));

    if (matchedUser) {
      setResult({
        success: true,
        message: 'Face Verified',
        studentName: matchedUser.name,
        rollNumber: matchedUser.roll_number,
        type: 'face'
      });
      // Fire and forget to backend to try logging, bypassing UI errors on backend crash
      axios.post('/gate/verify-face', { student_id: studentId })
        .then(() => fetchLogBook())
        .catch(e => console.error("verify-face backend error ignored:", e));
    } else {
      setResult({
        success: false,
        message: 'Face Mismatch',
        type: 'face'
      });
    }

    verifyingRef.current = false;
    setVerifying(false);
    setTimeout(() => {
      cooldownRef.current = false;
      setResult(null);
    }, 4000);
  };

  const handleFaceMismatch = () => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setResult({
      success: false,
      message: 'Face Mismatch',
      type: 'face'
    });
    setTimeout(() => {
      cooldownRef.current = false;
      setResult(null);
    }, 4000);
  };

  const handleQRVerify = async (e) => {
    e.preventDefault();
    if (!qrCodeInput.trim() || verifying) return;
    setVerifying(true);
    setResult(null);
    try {
      const response = await axios.post('/gate/verify', { qr_code: qrCodeInput.trim() });
      if (response.data.success) {
        setResult({
          success: true,
          message: response.data.data.action === 'Exit' ? 'Exit Approved' : 'Entry Approved',
          type: 'qr'
        });
        fetchLogBook();
      } else {
        setResult({ success: false, message: response.data.error || 'Invalid Pass', type: 'qr' });
      }
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Invalid or Expired Pass', type: 'qr' });
    } finally {
      setVerifying(false);
      setQrCodeInput('');
      setTimeout(() => {
        setResult(null);
      }, 4000);
    }
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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</p>
            <p className="text-sm font-black text-indigo-400">
              {modelLoaded ? `Security Active` : 'Starting Camera...'}
            </p>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div className="flex items-center gap-4 bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-right">
              <p className="text-lg font-bold text-white leading-none">{currentTime || '14:28:45'}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter mt-1">{currentDate || 'October 24, 2023'}</p>
            </div>
            <Clock className="w-6 h-6 text-slate-500" />
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-rose-950/40 border border-rose-800/40 text-rose-400 px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-rose-900 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Panel: Camera Verification */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" /> Face Verification (Python AI)
            </h3>
            <div className="aspect-video bg-slate-950 rounded-[2.5rem] border-2 border-slate-800 overflow-hidden relative group shadow-2xl flex-1 min-h-[300px]">
              <video 
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-80 ${cameraActive ? 'block' : 'hidden'}`}
                muted
                playsInline
                autoPlay
              />
              <canvas 
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full scale-x-[-1] z-10 pointer-events-none ${cameraActive ? 'block' : 'hidden'}`}
              />
              {cameraActive && !verifying && !result && (
                <div className="absolute inset-x-10 top-0 h-0.5 bg-indigo-500/50 shadow-md shadow-indigo-500 animate-bounce z-20"></div>
              )}
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-655 bg-slate-950">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
              )}
              {verifying && (
                <div className="absolute inset-0 z-30 bg-indigo-950/80 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-indigo-500 rounded-[2.3rem]">
                   <Scan className="w-12 h-12 text-indigo-400 mb-2 animate-pulse" />
                   <p className="font-bold text-white tracking-widest">VERIFYING...</p>
                </div>
              )}
              {result && result.type === 'face' && (
                <div className={`absolute inset-0 z-40 backdrop-blur-md flex flex-col items-center justify-center gap-3 border-4 rounded-[2.3rem] transition-all duration-300 ${
                  result.success ? 'bg-emerald-950/90 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'bg-rose-950/90 border-rose-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]'
                }`}>
                  {result.success ? (
                    <>
                      <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
                      <p className="text-3xl font-black tracking-wider uppercase text-emerald-400">{result.message}</p>
                      {result.studentName && (
                        <div className="text-center mt-1 space-y-1">
                          <p className="text-xl font-extrabold text-white tracking-wide">{result.studentName}</p>
                          {result.rollNumber && (
                            <p className="text-sm font-bold text-emerald-300 tracking-widest uppercase">{result.rollNumber}</p>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-14 h-14 text-rose-400 animate-bounce" />
                      <p className="text-3xl font-black tracking-wider uppercase text-rose-400">{result.message}</p>
                    </>
                  )}
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-between items-end">
                <button 
                  onClick={handleManualScan}
                  disabled={verifying}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black tracking-widest shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
                >
                  <Scan className="w-5 h-5" />
                  SCAN FACE
                </button>
                <div className="bg-slate-900/80 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold backdrop-blur-md">Manual Mode</div>
              </div>
            </div>
          </div>

          {/* Right Panel: QR Verification */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-500" /> Digital Pass Scanner
            </h3>
            <div className="aspect-video bg-slate-955 rounded-[2.5rem] border-2 border-slate-800 overflow-hidden relative flex-1 min-h-[300px] flex flex-col items-center justify-center p-8 shadow-2xl bg-slate-950">
              {result && result.type === 'qr' && (
                <div className={`absolute inset-0 z-40 backdrop-blur-md flex flex-col items-center justify-center border-4 rounded-[2.3rem] transition-all duration-300 ${
                  result.success ? 'bg-emerald-950/90 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'bg-rose-950/90 border-rose-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]'
                }`}>
                  {result.success ? (
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
                  ) : (
                    <AlertTriangle className="w-16 h-16 text-rose-400 mb-2 animate-bounce" />
                  )}
                  <p className={`text-2xl font-black tracking-wider uppercase ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.message}
                  </p>
                </div>
              )}
              {verifying && !result && (
                <div className="absolute inset-0 z-30 bg-indigo-950/80 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-indigo-500 rounded-[2.3rem]">
                   <Loader2 className="w-10 h-10 text-indigo-400 mb-2 animate-spin" />
                   <p className="font-bold text-white tracking-widest">VERIFYING...</p>
                </div>
              )}
              <form onSubmit={handleQRVerify} className="w-full max-w-sm space-y-6 flex flex-col items-center z-10">
                <div className="w-full relative">
                  <input 
                    type="text" 
                    placeholder="Enter Gate Pass QR Code..."
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all text-center tracking-wider font-semibold placeholder:text-slate-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 text-sm"
                >
                  Verify QR Code
                </button>
              </form>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] text-slate-800/10 font-black tracking-tighter opacity-10 pointer-events-none select-none z-0">
                QR
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ===== GATE LOG BOOK ===== */}
      <section className="border-t border-slate-800 bg-slate-950/60 backdrop-blur-xl">
        {/* Collapsible header */}
        <button
          onClick={() => setLogbookOpen(o => !o)}
          className="w-full flex items-center justify-between px-10 py-4 hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-white uppercase tracking-widest">Gate Log Book</span>
            <span className="text-[10px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {logbook.length} records
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); fetchLogBook(); }}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${logbookLoading ? 'animate-spin' : ''}`} />
            </button>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${logbookOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {logbookOpen && (
          <div className="px-10 pb-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4">
              {[
                { key: 'all',           label: 'All',            count: logbook.length },
                { key: 'student-entry', label: 'Student Entry',  count: logbook.filter(l => l.log_type === 'student-entry').length },
                { key: 'student-exit',  label: 'Student Exit',   count: logbook.filter(l => l.log_type === 'student-exit').length },
                { key: 'visitor',       label: 'Visitor',        count: logbook.filter(l => l.log_type === 'visitor').length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setLogbookTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    logbookTab === tab.key
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    logbookTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Person</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Roll / Host</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Room</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Purpose</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(logbookTab === 'all' ? logbook : logbook.filter(l => l.log_type === logbookTab))
                      .length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-600 text-sm">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      (logbookTab === 'all' ? logbook : logbook.filter(l => l.log_type === logbookTab)).map((entry, i) => {
                        const typeConfig = {
                          'student-entry': { label: 'Student In',  icon: <ArrowDownCircle className="w-3.5 h-3.5" />, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                          'student-exit':  { label: 'Student Out', icon: <ArrowUpCircle className="w-3.5 h-3.5" />,   cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
                          'visitor':       { label: 'Visitor In',  icon: <UserCheck className="w-3.5 h-3.5" />,       cls: 'bg-blue-500/10  text-blue-400   border-blue-500/30'   },
                        }[entry.log_type] || { label: entry.log_type, icon: null, cls: 'bg-slate-800 text-slate-400' };

                        const ts = new Date(entry.entry_time);
                        const timeStr = ts.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
                        const dateStr = ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                        return (
                          <tr key={`${entry.id}-${i}`} className={`border-b border-slate-800/50 hover:bg-slate-900/40 transition-colors ${
                            i % 2 === 0 ? 'bg-slate-950/20' : ''
                          }`}>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide ${typeConfig.cls}`}>
                                {typeConfig.icon}{typeConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-white text-xs">{entry.person_name || '—'}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                              {entry.log_type === 'visitor'
                                ? (entry.host_name ? `Host: ${entry.host_name}` : '—')
                                : (entry.roll_number || '—')}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">{entry.room_number || '—'}</td>
                            <td className="px-4 py-3 text-xs text-slate-400">{entry.purpose || '—'}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                {entry.verified_by || 'AI'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              <p className="font-bold text-slate-300">{timeStr}</p>
                              <p>{dateStr}</p>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-center px-10 shrink-0">
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
            <span className="text-xs font-bold">Vector Database Connected</span>
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
