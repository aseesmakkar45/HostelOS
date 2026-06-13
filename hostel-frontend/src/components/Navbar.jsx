'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({
  userFirstName: propUserFirstName,
  userName: propUserName,
  userRoom: propUserRoom,
  userAvatar: propUserAvatar,
  showNotificationBadge = true,
  onSearch = () => {},
  onNotificationClick = () => {}
}) {
  const { user, logout } = useAuth() || {};

  // Resolve user info from context if authenticated, else fallback to props
  const userFirstName = user ? user.name.split(' ')[0] : (propUserFirstName || 'Aarav');
  const userName = user ? user.name : (propUserName || 'Aarav Sharma');
  const userRoom = user?.room_number ? `Room ${user.room_number}` : (propUserRoom || 'Room 101');
  const userAvatar = user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}` : (propUserAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav');

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      alert('Logging out...');
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
        <button 
          id="btn-notifications" 
          onClick={onNotificationClick}
          className="w-10 h-10 flex items-center justify-center text-slate-500 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors relative cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {showNotificationBadge && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">{userRoom}</p>
          </div>
          <button 
            onClick={handleLogout}
            title="Click to logout"
            className="cursor-pointer"
          >
            <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-xl bg-indigo-100 hover:ring-2 hover:ring-indigo-500 transition-all" />
          </button>
        </div>
      </div>
    </header>
  );
}
