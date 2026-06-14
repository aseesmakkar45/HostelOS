'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, GraduationCap, User, Phone, MapPin, CheckCircle, ChevronLeft, Upload, FileText, Scan, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from '@/lib/axios';
import * as faceapi from 'face-api.js';

export default function StudentLogin() {
  const router = useRouter();
  const { login, showToast } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI State
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  // Biometric State
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  // Cleanup camera on unmount or mode switch
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setCameraActive(true);
      setCameraStream(stream);
      
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        
        // Load Models
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      }, 100);
    } catch (err) {
      console.error('Camera startup failed:', err);
      setError('Could not access camera for Face ID.');
    }
  };

  const [extracting, setExtracting] = useState(false);

  const captureAndExtractFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setExtracting(true);
    try {
      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        if (showToast) showToast('No face detected. Please ensure you are in a well-lit area and looking at the camera.', 'error');
        else setError('No face detected. Try again.');
        setExtracting(false);
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);
      setFormData(prev => ({
        ...prev,
        face_data: JSON.stringify(descriptorArray)
      }));
      
      if (showToast) showToast('Biometric data captured successfully!', 'success');
      
      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    } catch (err) {
      console.error('Face extraction error:', err);
      if (showToast) showToast('Extraction failed. Try again.', 'error');
    } finally {
      setExtracting(false);
    }
  };

  // Sign Up State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    program: '',
    graduation_year: '',
    branch: '',
    roll_number: '',
    gender: '',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    identity_proof_type: '',
    identity_proof_number: 'Uploaded Document',
    aadhaar_number: '',
    aadhaar_file: '',
    secondary_id_file: '',
    face_data: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast('File size must be under 2MB', 'error');
      else setError('File size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password, 'student');
      if (res.success) {
        router.push('/dashboard/student');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection refused. Demo mode enabled. Log in anyway.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupStep < 5) {
      setSignupStep(prev => prev + 1);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const response = await axios.post('/auth/register', formData);
      if (response.data.success) {
        if (showToast) showToast('Registration successful! Please login.', 'success');
        setIsSignUp(false);
        setSignupStep(1);
        setEmail(formData.email);
        setPassword(formData.password);
      }
    } catch (err) {
      console.warn('Registration error:', err.response?.data?.error || err.message || err);
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setSignupStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setSignupStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-100 rounded-full blur-[100px] opacity-60 z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-100 rounded-full blur-[100px] opacity-60 z-0"></div>

      <div className={`max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative z-10 border border-slate-100 ${isSignUp ? 'md:flex-row-reverse' : ''}`}>
        
        {/* Left Side: Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-800">CampusStay</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isSignUp ? 'Create Account' : 'Student Portal'}
            </h2>
            <p className="text-sm text-slate-400 font-semibold mt-1">
              {isSignUp ? 'Join the smart hostel management OS.' : 'Manage your room keys, passes, complaints, and billing schedules.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {!isSignUp ? (
            /* ------------------ LOGIN FORM ------------------ */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Student Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="student1@hostel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Connecting...' : 'Secure Log In'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center mt-4">
                <p className="text-sm font-medium text-slate-500">
                  New student?{' '}
                  <button type="button" onClick={() => setIsSignUp(true)} className="text-indigo-600 font-bold hover:underline">
                    Create an account
                  </button>
                </p>
              </div>

              {/* Portal Switcher Footer */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Other Portals</p>
                <div className="grid grid-cols-3 gap-3">
                  <Link href="/login" className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group cursor-pointer">
                    <div className="w-9 h-9 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-extrabold text-slate-700 group-hover:text-indigo-700 uppercase tracking-wide">Warden</p>
                    </div>
                  </Link>

                  <Link href="/admin/login" className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all group cursor-pointer">
                    <div className="w-9 h-9 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-extrabold text-slate-700 group-hover:text-purple-700 uppercase tracking-wide">Admin</p>
                    </div>
                  </Link>

                  <Link href="/gate/login" className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group cursor-pointer">
                    <div className="w-9 h-9 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-extrabold text-slate-700 group-hover:text-emerald-700 uppercase tracking-wide">Gate AI</p>
                    </div>
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            /* ------------------ SIGN UP FORM ------------------ */
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              
              {/* Step Indicators */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} className={`h-1.5 flex-1 rounded-full ${signupStep >= step ? 'bg-indigo-500' : 'bg-slate-100'}`}></div>
                ))}
              </div>

              {/* Step 1: Basic Info */}
              {signupStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold text-slate-800">Basic Information</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Arjun Kumar Sharma" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="arjun.sharma@iit.ac.in" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                  </div>
                </div>
              )}

              {/* Step 2: Academic Info */}
              {signupStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold text-slate-800">Academic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Program</label>
                      <input type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="B.Tech" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Grad Year</label>
                      <input type="number" name="graduation_year" value={formData.graduation_year} onChange={handleInputChange} placeholder="2027" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Branch/Major</label>
                    <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} placeholder="e.g. Computer Science & Engineering" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                    <input type="text" name="roll_number" value={formData.roll_number} onChange={handleInputChange} placeholder="e.g. 21CSE1042 / 2023BCS0045" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                  </div>
                </div>
              )}

              {/* Step 3: Personal & Guardian Info */}
              {signupStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold text-slate-800">Personal & Guardian</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Home Address</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="e.g. 15, Rajiv Colony, Sector 4, Jaipur, Rajasthan – 302004" rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 resize-none" required></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Guardian Name</label>
                      <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleInputChange} placeholder="e.g. Ramesh Kumar Sharma" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Guardian Phone</label>
                      <input type="tel" name="guardian_phone" value={formData.guardian_phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" required />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Identity Verification */}
              {signupStep === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold text-slate-800">Identity Verification</h3>
                  
                  {/* Primary ID: Aadhaar Number */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Aadhaar Card Number (Primary & Mandatory)</label>
                    <input 
                      type="text" 
                      name="aadhaar_number" 
                      value={formData.aadhaar_number} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 9876 5432 1012" 
                      pattern="\d{4}\s?\d{4}\s?\d{4}|\d{12}"
                      maxLength="14"
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" 
                      required 
                    />
                  </div>

                  {/* Primary ID: Aadhaar Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Aadhaar Card Copy (PDF/Image)</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50/10 transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-4 px-4">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-650">
                          {formData.aadhaar_file ? '✓ Aadhaar File Uploaded' : 'Upload Aadhaar Card PDF/Image'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">PNG, JPG, PDF up to 2MB</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => handleFileChange(e, 'aadhaar_file')} 
                        className="hidden" 
                        required
                      />
                    </label>
                  </div>

                  {/* Secondary ID Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secondary ID Type</label>
                      <select 
                        name="identity_proof_type" 
                        value={formData.identity_proof_type} 
                        onChange={handleInputChange} 
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100" 
                        required
                      >
                        <option value="">Choose Secondary ID</option>
                        <option value="College ID">College ID</option>
                        <option value="Allotment Letter">Allotment Letter</option>
                      </select>
                    </div>
                    
                    {/* Secondary ID Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        {formData.identity_proof_type ? `${formData.identity_proof_type} Copy` : 'Secondary ID Copy'}
                      </label>
                      <label className="flex flex-col items-center justify-center w-full h-12 border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50/10 transition-all">
                        <div className="flex items-center gap-2 justify-center px-4 h-full">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-650 truncate max-w-[150px]">
                            {formData.secondary_id_file ? '✓ Uploaded' : 'Upload PDF/Image'}
                          </span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf" 
                          onChange={(e) => handleFileChange(e, 'secondary_id_file')} 
                          className="hidden" 
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-4">
                    <p className="text-xs text-indigo-700 font-medium">By completing this step, you agree to the Hostel rules and authorize the collection of your data.</p>
                  </div>
                </div>
              )}

              {/* Step 5: AI Biometric Setup */}
              {signupStep === 5 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold text-slate-800">Face Recognition Setup</h3>
                  <p className="text-xs text-slate-500">For secure, keyless entry into the hostel gates.</p>
                  
                  <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    {!cameraActive ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <Scan className="w-10 h-10 text-slate-500 mb-4 animate-pulse" />
                        <p className="text-sm font-bold text-slate-300">Biometric Sensor Inactive</p>
                        <button 
                          type="button" 
                          onClick={startCamera}
                          className="mt-6 border border-slate-700 bg-slate-800/50 backdrop-blur-md text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 hover:border-slate-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2"
                        >
                          <Scan className="w-4 h-4" /> Initialize Camera
                        </button>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none" />
                        
                        {!modelsLoaded && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                            <p className="text-[10px] font-bold text-indigo-300 tracking-[0.2em] uppercase">Loading Deep Neural Models...</p>
                          </div>
                        )}

                        {modelsLoaded && !formData.face_data && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full px-6">
                            <div className="w-3/4 max-w-xs h-32 border-2 border-indigo-500/30 border-dashed rounded-3xl mb-4 relative">
                              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400 rounded-tl-xl -translate-x-1 -translate-y-1"></div>
                              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400 rounded-tr-xl translate-x-1 -translate-y-1"></div>
                              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400 rounded-bl-xl -translate-x-1 translate-y-1"></div>
                              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400 rounded-br-xl translate-x-1 translate-y-1"></div>
                            </div>
                            <button 
                              type="button"
                              onClick={captureAndExtractFace}
                              disabled={extracting}
                              className="border border-white/20 bg-white/10 backdrop-blur-lg text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                              {extracting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Scan className="w-4 h-4" />
                                  Capture Face
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        
                        {formData.face_data && (
                          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-30">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                              <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-sm font-bold text-white tracking-wide">Face Captured Successfully</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">Ready for Gate Entry</p>
                            <button type="button" onClick={() => setFormData(prev => ({...prev, face_data: null}))} className="mt-6 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 border border-slate-800 bg-slate-900 px-4 py-2 rounded-lg">
                              Recapture Face
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

                <div className="flex gap-4 pt-4">
                {signupStep > 1 && (
                  <button type="button" onClick={prevStep} className="w-14 h-14 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || (signupStep === 5 && !formData.face_data)}
                  className="flex-1 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : (signupStep === 5 ? 'Complete Registration' : 'Next Step')}
                  {signupStep < 5 && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm font-medium text-slate-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsSignUp(false)} className="text-indigo-600 font-bold hover:underline">
                    Log in here
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

        {/* Right Side: Community Banner */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center p-12 relative overflow-hidden text-white">
          <div className="max-w-md space-y-8 relative z-10 text-center flex flex-col items-center">
            <GraduationCap className="w-20 h-20 text-white/95 animate-bounce mb-2" />
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Your Digital Campus Stay</h1>
            <p className="text-indigo-50 text-sm font-medium leading-relaxed">
              Book dining sessions, lodge maintenance complaints directly to wardens, check in at the automated gate kiosk, and view roommate profiles.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-[1.8rem] border border-white/10 mt-6 shadow-xl">
              <div className="flex -space-x-3">
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" alt="avatar" />
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="avatar" />
                <img className="h-8 w-8 rounded-full ring-2 ring-indigo-500 bg-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" alt="avatar" />
              </div>
              <p className="text-xs font-bold tracking-wide">Join 5,000+ students living better.</p>
            </div>
          </div>

          <div className="absolute -right-40 bottom-0 top-0 w-80 pointer-events-none opacity-10 flex items-center justify-center">
            <GraduationCap className="text-[300px] text-white rotate-[30deg]" />
          </div>
        </div>
      </div>
    </div>
  );
}
