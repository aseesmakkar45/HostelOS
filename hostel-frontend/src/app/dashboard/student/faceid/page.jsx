'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { Camera, ShieldCheck, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function FaceIDRegistration() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [facePrint, setFacePrint] = useState(null); // [ratio1, ratio2, ratio3]
  const [cameraStream, setCameraStream] = useState(null);

  const modelRef = useRef(null);
  const animationRef = useRef(null);

  // Load TensorFlow.js and BlazeFace dynamically from CDN
  useEffect(() => {
    let active = true;

    async function loadScriptsAndModel() {
      try {
        setModelLoading(true);
        
        // Check if already loaded in window
        if (!window.tf) {
          const tfScript = document.createElement('script');
          tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
          tfScript.async = true;
          document.body.appendChild(tfScript);
          await new Promise((resolve) => {
            tfScript.onload = resolve;
          });
        }

        if (!window.blazeface) {
          const bfScript = document.createElement('script');
          bfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface';
          bfScript.async = true;
          document.body.appendChild(bfScript);
          await new Promise((resolve) => {
            bfScript.onload = resolve;
          });
        }

        if (active && window.blazeface) {
          const loadedModel = await window.blazeface.load();
          modelRef.current = loadedModel;
          setModelLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load TFJS/BlazeFace:', err);
        setError('Failed to load Face Recognition Neural Network. Please reload.');
      } finally {
        setModelLoading(false);
      }
    }

    loadScriptsAndModel();

    return () => {
      active = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      // Set camera active FIRST so video element renders
      setCameraActive(true);
      setCameraStream(stream);
      
      // Use setTimeout to wait for React to commit the video element to DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error('Video play error:', e));
          // Start face detection loop after video is playing
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
      cancelAnimationFrame(animationRef.current);
    }
  };

  const calculateDistance = (p1, p2) => {
    return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
  };

  const startFaceDetection = () => {
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

        // Run face estimator
        const returnTensors = false;
        const predictions = await modelRef.current.estimateFaces(video, returnTensors);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
          setError('');
          const prediction = predictions[0];
          const start = prediction.topLeft;
          const end = prediction.bottomRight;
          const size = [end[0] - start[0], end[1] - start[1]];

          // Draw face box
          ctx.strokeStyle = '#6366f1'; // Indigo color
          ctx.lineWidth = 4;
          ctx.strokeRect(start[0], start[1], size[0], size[1]);

          // Draw corners
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(start[0] - 2, start[1] - 2, 12, 12);
          ctx.fillRect(end[0] - 10, start[1] - 2, 12, 12);
          ctx.fillRect(start[0] - 2, end[1] - 10, 12, 12);
          ctx.fillRect(end[0] - 10, end[1] - 10, 12, 12);

          // Draw landmarks
          const landmarks = prediction.landmarks;
          ctx.fillStyle = '#10b981'; // Green for landmarks
          for (let i = 0; i < landmarks.length; i++) {
            const x = landmarks[i][0];
            const y = landmarks[i][1];
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
          }

          // Calculate Landmark Biometric Geometry
          // 0: right eye, 1: left eye, 2: nose tip, 3: mouth center
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

          setFacePrint([ratio1, ratio2, ratio3]);
        } else {
          setFacePrint(null);
        }
      }
      animationRef.current = requestAnimationFrame(detect);
    };

    animationRef.current = requestAnimationFrame(detect);
  };

  const registerFaceID = async () => {
    if (!facePrint) {
      setError('Please center your face inside the scan frame.');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      // Save ratios matrix to the backend database
      const response = await axios.post('/student/register-face', {
        face_data: JSON.stringify(facePrint)
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
                AI Face ID Security Registration
              </h1>
              <p className="text-slate-500 font-medium">Link your unique biometric signature for rapid, touchless gate pass check-ins.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Camera Viewport */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center">
              
              <div className="w-full max-w-[640px] aspect-video bg-slate-950 rounded-[2rem] overflow-hidden relative border border-slate-800">
                {/* Video element is always in DOM so videoRef is never null */}
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
                      <p className="font-bold text-white text-lg">Biometric Webcam Feed</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">Grant camera permissions to start extracting landmarks.</p>
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
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading AI Engine...
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
                    disabled={!facePrint || registering}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Registering Signature...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Save Face ID Profile
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
                
                {registered ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Face ID Linked!</h4>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">Biometric templates matching ratio stored in cloud repository. Scan ready at gates.</p>
                      <button 
                        onClick={() => setRegistered(false)}
                        className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Re-Register Face
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-slate-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Awaiting Landmarks</h4>
                      <p className="text-xs text-slate-500 mt-1">Activate the webcam and position your face in the box to compute your scale-invariant geometry ratios.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
              </div>

              {/* Dynamic Face Print Matrix */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-extrabold text-indigo-200">Face Landmark Proportions</h3>
                    <Sparkles className="text-indigo-400 w-5 h-5" />
                  </div>
                  
                  {facePrint ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Eye-to-Mouth Ratio</p>
                        <p className="text-xl font-black text-white mt-1">{facePrint[0].toFixed(4)}</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nose-to-Mouth Ratio</p>
                        <p className="text-xl font-black text-white mt-1">{facePrint[1].toFixed(4)}</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Symmetry Quotient</p>
                        <p className="text-xl font-black text-white mt-1">{facePrint[2].toFixed(4)}</p>
                      </div>
                      <p className="text-[10px] text-indigo-300 font-semibold text-center italic mt-2">Scale-invariant Euclidean vectors calculated dynamically</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
                      <Camera className="w-10 h-10 text-slate-700 mb-2" />
                      <p className="font-semibold">No landmark values</p>
                      <p className="text-[10px] text-slate-600 mt-1">Start camera & detect face to calculate ratio matrix</p>
                    </div>
                  )}
                </div>
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
