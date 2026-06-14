'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { Camera, ShieldCheck, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Loader2, Focus } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useAuth } from '@/context/AuthContext';

export default function FaceIDRegistration() {
  const { user } = useAuth() || {};
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  const animationRef = useRef(null);

  useEffect(() => {
    let active = true;

    // Check if student already has face registered
    async function checkFaceStatus() {
      try {
        const res = await axios.get('/student/face-status');
        if (active && res.data.registered) {
          setRegistered(true);
        }
      } catch (err) {
        console.error('Face status check failed:', err.message);
      } finally {
        if (active) setCheckingStatus(false);
      }
    }

    async function loadModels() {
      try {
        setModelLoading(true);
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        if (active) setModelLoaded(true);
      } catch (err) {
        console.error('Failed to load face models:', err);
        setError('Failed to load face recognition. Please reload.');
      } finally {
        if (active) setModelLoading(false);
      }
    }

    checkFaceStatus();
    loadModels();

    return () => {
      active = false;
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setCameraActive(true);
      setCameraStream(stream);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error('Video play error:', e));
          videoRef.current.onloadedmetadata = () => {
            startFaceDetection();
          };
        }
      }, 100);
    } catch (err) {
      console.error('Webcam access error:', err);
      setError('Cannot access webcam. Please verify camera permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };

  const startFaceDetection = () => {
    const detect = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const detection = await faceapi.detectSingleFace(video)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          setError('');
          const resizedDetections = faceapi.resizeResults(detection, displaySize);
          
          // Draw face box and landmarks
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          setFaceDescriptor(Array.from(detection.descriptor));
        } else {
          setFaceDescriptor(null);
        }
      }
    };

    animationRef.current = setInterval(detect, 150);
  };

  const registerFaceID = async () => {
    if (!faceDescriptor || faceDescriptor.length !== 128) {
      setError('Please center your face inside the scan frame.');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const response = await axios.post('/student/register-face', {
        face_data: JSON.stringify(faceDescriptor)
      });

      if (response.data.success) {
        setRegistered(true);
        stopCamera();
      } else {
        setError(response.data.error || 'Failed to save biometric profile.');
      }
    } catch (err) {
      console.error('Face ID save error:', err);
      setError(err.response?.data?.error || 'Server error saving Face ID profile.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar role="student" activeItem="dashboard" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
                Face ID Setup
              </h1>
              <p className="text-slate-500 font-medium">Set up your face for secure, touchless entry at the hostel gate.</p>
            </div>
          </div>

          {checkingStatus ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm font-semibold gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p>Checking status...</p>
            </div>
          ) : registered ? (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm max-w-2xl mx-auto w-full text-center space-y-8 flex flex-col items-center">
              <div className="relative">
                {/* Glowing ring animation */}
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl scale-125 animate-pulse"></div>
                
                {/* Photo container */}
                <div className="relative w-36 h-36 rounded-full border-4 border-emerald-500/30 overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'student'}`}
                    className="w-full h-full object-cover"
                    alt="Registered profile avatar"
                  />
                  
                  {/* Glowing active badge */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Face ID Registered & Active
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Biometric Profile Secured</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                  Hello, <span className="font-bold text-slate-700">{user?.name}</span>. Your face template is securely stored in our gateway database for keyless entry at the gate.
                </p>
              </div>

              <button 
                onClick={() => {
                  setRegistered(false);
                  startCamera();
                }}
                className="w-full max-w-xs py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw className="w-4 h-4" /> Recapture Face ID
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Camera Viewport */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center">
                
                <div className="w-full max-w-[640px] aspect-video bg-slate-950 rounded-[2rem] overflow-hidden relative border border-slate-800">
                  <video 
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${cameraActive ? 'block' : 'hidden'}`}
                    muted
                    playsInline
                    autoPlay
                  />
                  <canvas 
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full scale-x-[-1] z-10 pointer-events-none ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  {/* Scan effect lines — only visible when active */}
                  {cameraActive && (
                    <div className="absolute inset-x-10 top-0 h-0.5 bg-indigo-500/50 shadow-md shadow-indigo-500 animate-bounce z-20"></div>
                  )}

                  {/* Placeholder UI when camera is off */}
                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-4">
                      <Camera className="w-16 h-16 text-indigo-600/40" />
                      <div>
                        <p className="font-bold text-white text-lg">Camera Feed</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">Allow camera access and look at the camera to capture your face.</p>
                      </div>
                      {modelLoaded ? (
                        <button 
                          onClick={startCamera}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                        >
                          Start Camera
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                          <Loader2 className="w-4 h-4 animate-spin" /> Preparing...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {cameraActive && (
                  <div className="mt-6 flex gap-4 w-full max-w-[640px]">
                    <button 
                      onClick={stopCamera}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Turn Off Camera
                    </button>
                    <button 
                      onClick={registerFaceID}
                      disabled={!faceDescriptor || registering}
                      className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      {registering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Save Face ID
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Geometry Info Sidebar */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Registration Status */}
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Status Overview</h3>
                  
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-slate-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Face ID Not Set Up</h4>
                      <p className="text-xs text-slate-500 mt-1">Start the camera and look at it to register your face for gate entry.</p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}
                </div>

                {/* Live Detection Status */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg">
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-extrabold text-indigo-200">Live Detection</h3>
                      <Sparkles className="text-indigo-400 w-5 h-5" />
                    </div>
                    
                    {faceDescriptor ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                          <div>
                            <p className="text-xs text-emerald-300 font-bold">Face Detected</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Ready to save — click "Save Face ID" below.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
                        <Focus className="w-10 h-10 text-slate-700 mb-2" />
                        <p className="font-semibold">No face in frame</p>
                        <p className="text-[10px] text-slate-600 mt-1">Start camera and look straight at it</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
