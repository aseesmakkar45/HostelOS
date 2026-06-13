'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  LayoutDashboard, 
  Bed, 
  CreditCard, 
  Wrench, 
  Users, 
  QrCode, 
  Phone,
  Calendar,
  Briefcase,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({ role = 'student' }) {
  const pathname = usePathname();

  const studentLinks = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Accommodation', href: '#accommodation', icon: Bed },
    { name: 'Payments', href: '#payments', icon: CreditCard },
    { name: 'Support & Desk', href: '/dashboard/student/complaints', icon: Wrench },
    { name: 'Visitor Management', href: '#visitors', icon: Users },
    { name: 'Digital Gate Pass', href: '/dashboard/student/gatepass', icon: QrCode },
  ];

  const wardenLinks = [
    { name: 'Dashboard', href: '/dashboard/warden', icon: LayoutDashboard },
    { name: 'Rooms', href: '/dashboard/warden/rooms', icon: Bed },
    { name: 'Residents', href: '/dashboard/warden/residents', icon: Users },
    { name: 'Complaints', href: '/dashboard/warden/complaints', icon: Wrench },
    { name: 'Fees', href: '/dashboard/warden/fees', icon: CreditCard },
    { name: 'Visitor Passes', href: '/dashboard/warden/passes', icon: QrCode },
    { name: 'Leaves', href: '/dashboard/warden/leaves', icon: Calendar },
    { name: 'Staff', href: '/dashboard/warden/staff', icon: Briefcase },
    { name: 'AI Analytics', href: '/dashboard/warden/analytics', icon: TrendingUp },
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/dashboard/admin/students', icon: Users },
    { name: 'Fees', href: '/dashboard/admin/fees', icon: CreditCard },
    { name: 'Mess', href: '/dashboard/admin/mess', icon: Building2 },
    { name: 'Report', href: '/dashboard/admin/report', icon: QrCode },
  ];

  const links = role === 'admin' ? adminLinks : role === 'warden' ? wardenLinks : studentLinks;

  const handleCallWarden = () => {
    alert('Calling Warden at +91 98765 43210');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">CampusStay</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Need Help?</p>
            <p className="text-sm mb-4 font-light">Contact hostel warden for urgent assistance.</p>
            <button
              onClick={handleCallWarden}
              className="w-full bg-indigo-500 hover:bg-indigo-400 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              Call Warden
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
        </div>
      </div>
    </aside>
  );
}
