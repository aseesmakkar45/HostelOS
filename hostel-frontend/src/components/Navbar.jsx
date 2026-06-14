'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Ticket, 
  LogOut, 
  User, 
  ShieldCheck, 
  Info,
  Phone,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({
  userFirstName: propUserFirstName,
  userName: propUserName,
  userRoom: propUserRoom,
  userAvatar: propUserAvatar,
  showNotificationBadge = true,
  onSearch = () => {},
  onNotificationClick = null
}) {
  const { user, logout } = useAuth() || {};

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasBadge, setHasBadge] = useState(showNotificationBadge);
  const [liveNotifications, setLiveNotifications] = useState([]);

  // Fetch live notifications
  const fetchLiveNotifications = async () => {
    if (!user) return;
    try {
      const response = await axios.get('/notifications');
      if (response.data.success) {
        setLiveNotifications(response.data.data);
        const unreadExists = response.data.data.some(n => !n.is_read);
        setHasBadge(unreadExists);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#btn-notifications') && !event.target.closest('#dropdown-notifications')) {
        setIsNotificationsOpen(false);
      }
      if (!event.target.closest('#btn-profile') && !event.target.closest('#dropdown-profile')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Resolve user info from context if authenticated, else fallback to props
  const userFirstName = user ? user.name.split(' ')[0] : (propUserFirstName || 'Aarav');
  const userName = user ? user.name : (propUserName || 'Aarav Sharma');
  const role = user?.role || 'student';
  
  const userRoom = propUserRoom && propUserRoom !== 'Loading...' && propUserRoom !== 'Room 101'
    ? propUserRoom
    : user?.room_number 
    ? `Room ${user.room_number}` 
    : propUserRoom || (role === 'warden' ? 'Hostel Warden' : role === 'admin' ? 'Central Admin' : 'Room 101');
  
  const userAvatar = user 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}` 
    : (propUserAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav');

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      window.location.href = '/';
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await axios.patch('/notifications/read-all');
      if (response.data.success) {
        setLiveNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setHasBadge(false);
      }
    } catch (err) {
      console.warn('Failed to mark notifications read:', err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      const response = await axios.patch(`/notifications/${id}/read`);
      if (response.data.success) {
        setLiveNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        // Check if any unread remain
        const stillUnread = liveNotifications.some(n => n.id !== id && !n.is_read);
        setHasBadge(stillUnread);
      }
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const handleNotificationButtonClick = (e) => {
    if (onNotificationClick) {
      onNotificationClick(e);
    } else {
      setIsNotificationsOpen(!isNotificationsOpen);
      setIsProfileOpen(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationConfig = (type) => {
    switch (type) {
      case 'leave':
        return { icon: Calendar, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' };
      case 'gatepass':
        return { icon: Ticket, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
      case 'complaint':
        return { icon: Clock, color: 'text-purple-500 bg-purple-50 border-purple-100' };
      case 'fee':
        return { icon: AlertCircle, color: 'text-rose-500 bg-rose-50 border-rose-100' };
      default:
        return { icon: Info, color: 'text-slate-500 bg-slate-50 border-slate-100' };
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hello, {userFirstName}! 👋</h1>
        <p className="text-slate-400 text-sm font-medium">Welcome back to your hostel portal.</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search className="text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-600"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            type="button"
            id="btn-notifications" 
            onClick={handleNotificationButtonClick}
            className="w-10 h-10 flex items-center justify-center text-slate-500 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {hasBadge && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div 
              id="dropdown-notifications"
              className="absolute right-0 mt-3 w-80 bg-white/95 border border-slate-100/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="font-extrabold text-sm text-slate-900">Recent Notifications</span>
                {hasBadge && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-widest cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {liveNotifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 font-medium text-xs">
                    No new notifications.
                  </div>
                ) : (
                  liveNotifications.map((n) => {
                    const config = getNotificationConfig(n.type);
                    const Icon = config.icon;
                    return (
                      <div 
                        key={n.id} 
                        onClick={() => !n.is_read && handleMarkOneRead(n.id)}
                        className={`flex gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer relative ${
                          !n.is_read ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg border shrink-0 flex items-center justify-center ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className={`text-xs truncate ${!n.is_read ? 'font-black text-slate-950' : 'font-bold text-slate-700'}`}>
                              {n.title}
                            </p>
                            <span className="text-[9px] font-medium text-slate-400 shrink-0">{formatTimeAgo(n.created_at)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{n.message}</p>
                        </div>
                        {!n.is_read && (
                          <span className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-100 relative">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{role === 'admin' ? 'Central Admin' : role === 'warden' ? 'Hostel Warden' : userRoom}</p>
          </div>
          
          <button 
            type="button"
            id="btn-profile"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            title="View Profile"
            className="cursor-pointer"
          >
            <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-xl bg-indigo-100 hover:ring-2 hover:ring-indigo-500 transition-all" />
          </button>

          {isProfileOpen && (
            <div 
              id="dropdown-profile"
              className="absolute right-0 mt-3 w-72 bg-white/95 border border-slate-100/80 backdrop-blur-lg rounded-2xl shadow-xl p-5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex flex-col items-center text-center border-b border-slate-100 pb-4">
                <img src={userAvatar} alt="Avatar" className="w-16 h-16 rounded-2xl bg-indigo-100 shadow-inner" />
                <h4 className="font-extrabold text-slate-900 mt-3 text-base leading-tight">{userName}</h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">{user?.email || (role === 'student' ? 'student1@hostel.com' : 'warden@hostel.com')}</p>
                
                <span className="mt-2.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {role === 'admin' ? 'Central Admin' : role === 'warden' ? 'Hostel Warden' : 'Student'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {role === 'student' && (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Room</span>
                      <span className="text-slate-800 font-bold">{userRoom}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Program</span>
                      <span className="text-slate-800 font-bold">{user?.program || 'N/A'} - {user?.graduation_year || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Branch</span>
                      <span className="text-slate-800 font-bold">{user?.branch || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Roll No</span>
                      <span className="text-slate-800 font-bold">{user?.roll_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Gender</span>
                      <span className="text-slate-800 font-bold">{user?.gender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50 flex-col">
                      <span className="text-slate-400 mb-1">Address</span>
                      <span className="text-slate-800 font-bold leading-tight">{user?.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Guardian</span>
                      <span className="text-slate-800 font-bold">{user?.guardian_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Guardian Phone</span>
                      <span className="text-slate-800 font-bold">{user?.guardian_phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50 flex-col">
                      <span className="text-slate-400 mb-0.5">Aadhaar Number</span>
                      <span className="text-slate-800 font-bold mb-1.5">{user?.aadhaar_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50 flex-col">
                      <span className="text-slate-400 mb-0.5">Secondary Proof ({user?.identity_proof_type || 'N/A'})</span>
                      <span className="text-slate-800 font-bold">{user?.identity_proof_number || 'N/A'}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-slate-800 font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    +91 {user?.phone || '98765 43210'}
                  </span>
                </div>
              </div>

              {role === 'student' && (
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="/dashboard/student/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-colors text-xs uppercase tracking-widest cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    View Full Profile
                  </Link>
                  <Link
                    href="/dashboard/student/profile?edit=true"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors text-xs uppercase tracking-widest cursor-pointer border border-slate-100"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </div>
              )}

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 mt-3 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors text-xs uppercase tracking-widest cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
