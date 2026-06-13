'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from '@/lib/axios';
import { 
  ChevronDown, 
  Clock3, 
  UploadCloud, 
  Eye, 
  Send, 
  ShieldCheck, 
  Info,
  Wrench,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function FileComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('low');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responseTime, setResponseTime] = useState('Select a category');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/student/complaints');
      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    if (val === 'ac') setResponseTime('4-6 Hours');
    else if (val === 'plumbing') setResponseTime('2-4 Hours');
    else if (val === 'noise') setResponseTime('1-2 Hours');
    else if (val === 'clean') setResponseTime('12 Hours');
    else if (val === 'internet') setResponseTime('2 Hours');
    else setResponseTime('24 Hours');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description) {
      alert('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Derive a title if not provided explicitly
      const generatedTitle = title || `${category.toUpperCase()} Issue`;
      const response = await axios.post('/student/complaint', {
        title: generatedTitle,
        description,
        category
      });

      if (response.data.success) {
        alert('Complaint submitted successfully!');
        setTitle('');
        setDescription('');
        setCategory('');
        setUrgency('low');
        fetchComplaints();
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      alert('Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Pending</span>;
      case 'in-progress':
      case 'in progress':
        return <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">In Progress</span>;
      case 'resolved':
        return <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Resolved</span>;
      default:
        return <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar activeItem="services" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Navbar />

        {/* Content Area */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumbs & Title */}
            <div className="mb-8">
              <nav className="flex gap-2 text-sm text-slate-400 font-medium mb-2">
                <span className="text-slate-600">Services</span>
                <span>/</span>
                <span className="text-slate-600">File Complaint</span>
              </nav>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Support & Complaints Desk</h2>
              <p className="text-slate-500 mt-1">Please provide details about the issue you're facing or view your existing requests.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <form onSubmit={handleSubmit} className="p-8 lg:p-10">
                    <h3 className="text-xl font-extrabold text-slate-800 mb-6">File a New Complaint</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Category Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Complaint Category</label>
                        <div className="relative">
                          <select 
                            value={category}
                            onChange={handleCategoryChange}
                            required
                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Select category...</option>
                            <option value="ac">AC / Heating</option>
                            <option value="plumbing">Plumbing</option>
                            <option value="noise">Noise Issue</option>
                            <option value="clean">Cleanliness</option>
                            <option value="internet">Internet / Wi-Fi</option>
                            <option value="maint">General Maintenance</option>
                            <option value="other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                        </div>
                        <div id="estimate-box" className="flex items-center gap-2 text-[11px] text-indigo-500 font-bold uppercase tracking-wider mt-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Estimated response: <span>{responseTime}</span></span>
                        </div>
                      </div>

                      {/* Urgency Level */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Urgency Level</label>
                        <div className="flex gap-3 h-14">
                          {['low', 'medium', 'high'].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setUrgency(level)}
                              className={`flex-1 flex items-center justify-center border rounded-2xl cursor-pointer transition-all font-bold text-sm ${
                                urgency === level 
                                  ? level === 'low' ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                    : level === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-600'
                                    : 'bg-rose-50 border-rose-300 text-rose-600'
                                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100/50'
                              }`}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Title input */}
                    <div className="space-y-2 mb-6">
                      <label className="text-sm font-bold text-slate-700 ml-1">Title (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. AC not blowing cold air"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 mb-8">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <span className="text-xs font-medium text-slate-400">{description.length} / 500 characters</span>
                      </div>
                      <textarea 
                        placeholder="Tell us what happened..." 
                        value={description}
                        maxLength={500}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none custom-scrollbar"
                      />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2 mb-10">
                      <label className="text-sm font-bold text-slate-700 ml-1">Attachments (Optional)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-300 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-sm flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-slate-700 font-bold">Drop files here or click to upload</p>
                        <p className="text-slate-400 text-sm mt-1">PNG, JPG or PDF up to 5MB</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                      <button 
                        type="button" 
                        onClick={() => alert(`Preview: ${title || 'Untitled'} - ${description}`)}
                        className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                        Preview Complaint
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="flex-[2] h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                        {submitting ? 'Submitting...' : 'Submit Complaint'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Past Complaints List */}
              <div className="lg:col-span-5 flex flex-col space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex-1">
                  <h3 className="text-xl font-extrabold text-slate-800 mb-6">Past Complaints</h3>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : complaints.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium">
                      No complaints registered yet.
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {complaints.map((item) => (
                        <div key={item.id} className="relative pl-8 before:absolute before:left-0 before:top-1 before:w-1 before:h-[80%] before:bg-indigo-500 before:rounded-full border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          {item.ai_tag && (
                            <div className="mt-2 inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              AI Tag: {item.ai_tag}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 mt-2 font-medium">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex gap-4">
                    <ShieldCheck className="w-10 h-10 bg-white rounded-xl p-2 text-indigo-600 shadow-sm shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Privacy Guaranteed</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">Only authorized wardens and teams can view complaints.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
                    <Info className="w-10 h-10 bg-white rounded-xl p-2 text-amber-600 shadow-sm shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Urgency Policy</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">High urgency is for immediate threats like fire or major faults.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
