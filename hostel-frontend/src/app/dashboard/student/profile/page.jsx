'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  Hash,
  Shield,
  Users,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle,
  Building2,
  Loader2,
  Upload,
  FileText
} from 'lucide-react';

function StudentProfile() {
  const { user: authUser, showToast, refreshUser } = useAuth() || {};
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    program: '',
    graduation_year: '',
    branch: '',
    identity_proof_type: '',
    identity_proof_number: 'Uploaded Document',
    aadhaar_number: '',
    aadhaar_file: '',
    secondary_id_file: ''
  });

  const fetchProfile = async () => {
    try {
      const [profileRes, roomRes] = await Promise.all([
        axios.get('/auth/me'),
        axios.get('/student/room').catch(() => null)
      ]);
      if (profileRes.data.success) {
        const data = profileRes.data.data;
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          guardian_name: data.guardian_name || '',
          guardian_phone: data.guardian_phone || '',
          program: data.program || '',
          graduation_year: data.graduation_year || '',
          branch: data.branch || '',
          identity_proof_type: data.identity_proof_type || '',
          identity_proof_number: data.identity_proof_number || 'Uploaded Document',
          aadhaar_number: data.aadhaar_number || '',
          aadhaar_file: data.aadhaar_file || '',
          secondary_id_file: data.secondary_id_file || ''
        });
      }
      if (roomRes?.data?.success) {
        setRoom(roomRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (searchParams?.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast('File size must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(prev => ({
        ...prev,
        [fieldName]: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/auth/me', form);
      if (res.data.success) {
        setProfile(res.data.data);
        setIsEditing(false);
        if (showToast) showToast('Profile updated successfully!', 'success');
        // Refresh auth context if available
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      if (showToast) showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      guardian_name: profile.guardian_name || '',
      guardian_phone: profile.guardian_phone || '',
      program: profile.program || '',
      graduation_year: profile.graduation_year || '',
      branch: profile.branch || '',
      identity_proof_type: profile.identity_proof_type || '',
      identity_proof_number: profile.identity_proof_number || 'Uploaded Document',
      aadhaar_number: profile.aadhaar_number || '',
      aadhaar_file: profile.aadhaar_file || '',
      secondary_id_file: profile.secondary_id_file || ''
    });
    setIsEditing(false);
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'student'}`;

  const InfoField = ({ label, value, icon: Icon, editable = false, name, type = 'text', options = null }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {isEditing && editable ? (
        options ? (
          <select
            name={name}
            value={form[name]}
            onChange={handleChange}
            className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            <option value="">Select...</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        )
      ) : (
        <p className="text-sm font-bold text-slate-800 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 min-h-[44px] flex items-center">
          {value || <span className="text-slate-400 font-medium">Not provided</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar role="student" activeItem="dashboard" />

      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium">
            <Link href="/dashboard/student" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">My Profile</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8">

              {/* Hero Card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-3xl bg-indigo-600/30 border-2 border-indigo-400/30 overflow-hidden shadow-xl">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast && showToast('Photo upload coming soon!', 'info')}
                      className="absolute -bottom-2 -right-2 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg transition-colors cursor-pointer border-2 border-slate-900"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Student Profile</p>
                    <h1 className="text-3xl font-black text-white tracking-tight">{profile?.name}</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">{profile?.email}</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                      <span className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {profile?.program || 'Student'}
                      </span>
                      <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {profile?.gender || 'N/A'}
                      </span>
                      {room && (
                        <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Room {room.room_number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 shrink-0">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={saving}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-rose-500/20 border border-white/20 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Changes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Personal Info */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Basic Info Card */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-500" />
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InfoField label="Full Name" value={profile?.name} icon={User} editable name="name" />
                      <InfoField label="Email" value={profile?.email} icon={Mail} />
                      <InfoField label="Phone Number" value={profile?.phone} icon={Phone} editable name="phone" type="tel" />
                      <InfoField label="Gender" value={profile?.gender} icon={Users} />
                      <InfoField label="Roll Number" value={profile?.roll_number} icon={Hash} />
                      <InfoField
                        label="Address"
                        value={profile?.address}
                        icon={MapPin}
                        editable
                        name="address"
                      />
                    </div>
                  </div>

                  {/* Academic Info Card */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-500" />
                      Academic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InfoField
                        label="Program"
                        value={profile?.program}
                        icon={BookOpen}
                        editable
                        name="program"
                        options={['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'B.Com', 'MBA', 'PhD', 'Diploma']}
                      />
                      <InfoField
                        label="Branch / Specialization"
                        value={profile?.branch}
                        icon={BookOpen}
                        editable
                        name="branch"
                        options={['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Information Technology', 'Biotechnology', 'Other']}
                      />
                      <InfoField
                        label="Year of Graduation"
                        value={profile?.graduation_year?.toString()}
                        icon={Calendar}
                        editable
                        name="graduation_year"
                        type="number"
                      />
                    </div>
                  </div>

                  {/* Guardian Info Card */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-500" />
                      Guardian Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InfoField label="Guardian Name" value={profile?.guardian_name} icon={User} editable name="guardian_name" />
                      <InfoField label="Guardian Phone" value={profile?.guardian_phone} icon={Phone} editable name="guardian_phone" type="tel" />
                    </div>
                  </div>

                  {/* Identity Proof Card */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      Verification Documents (2 Required)
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Aadhaar Number */}
                      <InfoField
                        label="Primary: Aadhaar Number"
                        value={profile?.aadhaar_number}
                        icon={Shield}
                        editable
                        name="aadhaar_number"
                      />

                      {/* Aadhaar File Upload / View */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="w-3 h-3" />
                          Aadhaar Card Copy
                        </label>
                        {isEditing ? (
                          <label className="h-11 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-xl px-4 flex items-center gap-2 cursor-pointer transition-all">
                            <Upload className="w-4 h-4 text-slate-400 animate-pulse" />
                            <span className="text-sm font-semibold text-slate-700 truncate">
                              {form.aadhaar_file ? '✓ Uploaded new Aadhaar' : 'Upload PDF/Image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileChange(e, 'aadhaar_file')}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          profile?.aadhaar_file ? (
                            <a
                              href={profile.aadhaar_file}
                              target="_blank"
                              rel="noreferrer"
                              className="h-11 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-xl px-4 text-xs font-bold transition-all flex items-center gap-2 justify-center"
                            >
                              <FileText className="w-4 h-4" />
                              View Aadhaar Document
                            </a>
                          ) : (
                            <p className="text-sm font-bold text-slate-400 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 min-h-[44px] flex items-center">
                              No Aadhaar uploaded
                            </p>
                          )
                        )}
                      </div>

                      {/* Secondary ID Type */}
                      <InfoField
                        label="Secondary: Proof Type"
                        value={profile?.identity_proof_type}
                        icon={Shield}
                        editable
                        name="identity_proof_type"
                        options={['College ID', 'Allotment Letter']}
                      />

                      {/* Secondary ID Upload / View */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="w-3 h-3" />
                          {profile?.identity_proof_type ? `${profile.identity_proof_type} Copy` : 'Secondary ID Copy'}
                        </label>
                        {isEditing ? (
                          <label className="h-11 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-xl px-4 flex items-center gap-2 cursor-pointer transition-all">
                            <Upload className="w-4 h-4 text-slate-400 animate-pulse" />
                            <span className="text-sm font-semibold text-slate-700 truncate">
                              {form.secondary_id_file ? `✓ Uploaded new ${form.identity_proof_type || 'ID'}` : 'Upload PDF/Image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileChange(e, 'secondary_id_file')}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          profile?.secondary_id_file ? (
                            <a
                              href={profile.secondary_id_file}
                              target="_blank"
                              rel="noreferrer"
                              className="h-11 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-xl px-4 text-xs font-bold transition-all flex items-center gap-2 justify-center"
                            >
                              <FileText className="w-4 h-4" />
                              View Secondary Document
                            </a>
                          ) : (
                            <p className="text-sm font-bold text-slate-400 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 min-h-[44px] flex items-center">
                              No document uploaded
                            </p>
                          )
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">

                  {/* Room Card */}
                  <div className="bg-indigo-600 rounded-[2rem] p-7 text-white space-y-4 shadow-lg shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Accommodation</p>
                      <h3 className="text-2xl font-black mt-1">
                        {room ? `Room ${room.room_number}` : 'Unallocated'}
                      </h3>
                      {room && (
                        <>
                          <p className="text-sm text-indigo-200 font-medium mt-1 capitalize">{room.room_type} sharing · Floor {room.floor}</p>
                          <div className="mt-4 pt-4 border-t border-indigo-400/30 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-200" />
                            <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Active Allocation</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm space-y-5">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Account Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-semibold">Member Since</span>
                        <span className="text-xs font-bold text-slate-800">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-semibold">Role</span>
                        <span className="text-xs font-bold text-slate-800 capitalize">{profile?.role}</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-xs text-slate-500 font-semibold">Face ID</span>
                        <span className={`text-xs font-bold ${profile?.face_data ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {profile?.face_data ? 'Registered' : 'Not Registered'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Notice */}
                  {isEditing && (
                    <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 space-y-3">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Editing Mode Active</p>
                      <p className="text-xs text-amber-600 font-medium leading-relaxed">
                        You can update your contact details, guardian information, and identity proof. Roll number, email, and gender cannot be changed.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="flex-1 py-2.5 bg-white border border-amber-200 text-amber-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Quick Links</h3>
                    <Link href="/dashboard/student/gatepass" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">My Gate Passes</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </Link>
                    <Link href="/dashboard/student/leaves" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Leave Requests</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </Link>
                    <Link href="/dashboard/student/complaints" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">My Complaints</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    }>
      <StudentProfile />
    </Suspense>
  );
}
