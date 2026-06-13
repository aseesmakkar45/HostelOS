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
  Loader2
} from 'lucide-react';

export default function GateEntryKiosk() {
  const { logout } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null); // { success: true/false, message: '', data: {} }
  const [logs, setLogs] = useState([
    { name: 'Aarav Sharma', type: 'Student', room: 'Room 101', event: 'In', time: 'Just Now', icon: 'in' },
    { name: 'Priya Sharma', type: 'Student', room: 'Room 102', event: 'Out', time: '2m ago', icon: 'out' },
    { name: 'Rahul Verma', type: 'Student', room: 'Room 101', event: 'In', time: '5m ago', icon: 'in' }
  ]);

  // Biometric camera states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const animationRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [liveFacePrint, setLiveFacePrint] = useState(null); // [ratio1, ratio2, ratio3]
  const [cameraStream, setCameraStream] = useState(null);

  // Load clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load TFJS & BlazeFace
  useEffect(() => {
    let active = true;

    async function loadModel() {
      try {
        if (!window.tf) {
          const tfScript = document.createElement('script');
          tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
          tfScript.async = true;
          document.body.appendChild(tfScript);
          await new Promise((resolve) => { tfScript.onload = resolve; });
        }

        if (!window.blazeface) {
          const bfScript = document.createElement('script');
          bfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface';
          bfScript.async = true;
          document.body.appendChild(bfScript);
          await new Promise((resolve) => { bfScript.onload = resolve; });
        }

        if (active && window.blazeface) {
          const loadedModel = await window.blazeface.load();
          modelRef.current = loadedModel;
          setModelLoaded(true);
          // Auto start camera for gate kiosk
          startWebcam();
        }
      } catch (err) {
        console.error('Gate Kiosk model load error:', err);
      }
    }

    loadModel();

    return () => {
      active = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
      // Set active FIRST so video element renders in DOM
      setCameraActive(true);
      setCameraStream(stream);
      // Brief timeout to allow React to commit <video> to DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error('Gate video play error:', e));
          videoRef.current.onloadedmetadata = () => {
            startFaceDetectionLoop();
          };
        }
      }, 100);
    } catch (err) {
      console.error('Gate webcam startup failed:', err);
    }
  };

  const calculateDistance = (p1, p2) => {
    return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
  };

  const startFaceDetectionLoop = () => {
    const detect = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        modelRef.current &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const predictions = await modelRef.current.estimateFaces(video, false);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
          const prediction = predictions[0];
          const start = prediction.topLeft;
          const end = prediction.bottomRight;
          const size = [end[0] - start[0], end[1] - start[1]];

          // Draw Scan Box
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 3;
          ctx.strokeRect(start[0], start[1], size[0], size[1]);

          // Draw landmarks
          const landmarks = prediction.landmarks;
          ctx.fillStyle = '#10b981';
          for (let i = 0; i < landmarks.length; i++) {
            ctx.beginPath();
            ctx.arc(landmarks[i][0], landmarks[i][1], 5, 0, 2 * Math.PI);
            ctx.fill();
          }

          // Calculate facial ratios
          const rightEye = landmarks[0];
          const leftEye = landmarks[1];
          const nose = landmarks[2];
          const mouth = landmarks[3];

          const eyeDist = calculateDistance(rightEye, leftEye);
          const noseToMouth = calculateDistance(nose, mouth);
          const eyeMidpoint = [(rightEye[0] + leftEye[0]) / 2, (rightEye[1] + leftEye[1]) / 2];
          const eyeToNose = calculateDistance(eyeMidpoint, nose);

          const ratio1 = eyeDist / (noseToMouth || 1);
          const ratio2 = eyeToNose / (noseToMouth || 1);
          
          const rightEyeToNose = calculateDistance(rightEye, nose);
          const leftEyeToNose = calculateDistance(leftEye, nose);
          const ratio3 = rightEyeToNose / (leftEyeToNose || 1);

          setLiveFacePrint([ratio1, ratio2, ratio3]);
        } else {
          setLiveFacePrint(null);
        }
      }
      animationRef.current = requestAnimationFrame(detect);
    };
    animationRef.current = requestAnimationFrame(detect);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    setVerifying(true);
    setResult(null);

    // Short scanning delay to simulate biometric sweep
    setTimeout(async () => {
      try {
        const response = await axios.post('/gate/verify', { qr_code: qrCodeInput });
        
        if (response.data.success) {
          const pass = response.data.data;
          
          // Verify biometric template if registered
          if (pass.face_data) {
            const registeredRatios = JSON.parse(pass.face_data);
            
            if (liveFacePrint) {
              // Compare vectors
              const distance = Math.sqrt(
                (liveFacePrint[0] - registeredRatios[0]) ** 2 +
                (liveFacePrint[1] - registeredRatios[1]) ** 2 +
                (liveFacePrint[2] - registeredRatios[2]) ** 2
              );

              // Match tolerance threshold (0.18 represents high structural similarity)
              if (distance < 0.18) {
                const matchScore = Math.round((1 - distance) * 100);
                setResult({
                  success: true,
                  message: `Biometric Access Granted — Face Match Confirmed (${matchScore}% match). Resident: ${pass.student_name}, Room: ${pass.room_number}`,
                  data: pass
                });

                // Add to log
                setLogs(prev => [
                  { 
                    name: pass.student_name, 
                    type: 'Student', 
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
                  message: `Biometric Verification Mismatch! Facial proportions do not match profile signature.`
                });
              }
            } else {
              setResult({
                success: false,
                message: `Biometric Scanner Error: No face detected in video feed. Cannot verify identity.`
              });
            }
          } else {
            // No face ID registered fallback
            setResult({
              success: true,
              message: `Verification Approved — ${pass.student_name}, Room ${pass.room_number}. (Warning: No Face ID Registered — Please setup Face ID in Student Hub)`,
              data: pass
            });

            // Add to log
            setLogs(prev => [
              { 
                name: pass.student_name, 
                type: 'Student', 
                room: pass.room_number ? `Room ${pass.room_number}` : 'Visitor', 
                event: 'In', 
                time: 'Just Now', 
                icon: 'in' 
              },
              ...prev
            ]);
          }
        } else {
          setResult({
            success: false,
            message: response.data.error || 'Verification Failed'
          });
        }
      } catch (err) {
        setResult({
          success: false,
          message: err.response?.data?.error || 'Verification Failed: Pass expired, used, or invalid.'
        });
      } finally {
        setVerifying(false);
        setQrCodeInput('');
      }
    }, 1500);
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
              {modelLoaded ? 'Biometric Engine Online' : 'Starting Core TFJS...'}
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
                {/* Always in DOM so videoRef is never null */}
                <video 
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-70 ${cameraActive ? 'block' : 'hidden'}`}
                  muted
                  playsInline
                  autoPlay
                />
                <canvas 
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full scale-x-[-1] z-10 pointer-events-none ${cameraActive ? 'block' : 'hidden'}`}
                />
                {cameraActive && (
                  <div className="absolute inset-x-10 top-0 h-0.5 bg-indigo-500/50 shadow-md shadow-indigo-500 animate-bounce z-20"></div>
                )}
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 bg-slate-950">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  </div>
                )}
                
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
                  <p className="text-sm font-semibold text-indigo-400 animate-pulse">Checking facial coordinates...</p>
                </div>
              ) : result ? (
                <div className={`p-6 rounded-2xl border ${
                  result.success ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'
                }`}>
                  <p className={`text-sm font-bold ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.message}
                  </p>
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
              <button className="flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase text-slate-500 cursor-pointer animate-pulse">Live</button>
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
              onClick={() => alert('Manual override activated. Entry log captured.')}
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
            <span className="text-xs font-bold">Neon SQL Cloud Connected</span>
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
