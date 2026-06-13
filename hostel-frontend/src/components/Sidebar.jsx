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
  TrendingUp,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({
  activeItem = 'dashboard',
  dashboardHref = '/dashboard/student',
  accommodationHref = '/dashboard/student/accommodation',
  paymentsHref = '/dashboard/student/payments',
  messHref = '/dashboard/student/mess',
  leavesHref = '/dashboard/student/leaves',
  servicesHref = '/dashboard/student/complaints',
  visitorsHref = '/dashboard/student/visitors',
  passHref = '/dashboard/student/gatepass',
  role = 'student',
  onEmergencyCall = null
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const helpConfig = role === 'warden'
    ? { label: 'Call Admin', description: 'Contact the hostel admin for urgent matters.', number: '+91 98765 43200' }
    : role === 'admin'
    ? { label: 'Call Support', description: 'Contact IT support for technical assistance.', number: '+91 98765 43222' }
    : { label: 'Call Warden', description: 'Contact hostel warden for urgent assistance.', number: '+91 98765 43210' };

  const handleCall = onEmergencyCall || (() => alert(`Calling ${helpConfig.label} at ${helpConfig.number}`));

  // Highlight based on either prop or active path
  const checkActive = (item, href) => {
    if (activeItem === item) return true;
    return pathname === href;
  };

  const studentLinks = [
    { name: 'Dashboard', key: 'dashboard', href: dashboardHref, icon: LayoutDashboard },
    { name: 'Accommodation', key: 'accommodation', href: accommodationHref, icon: Bed },
    { name: 'Payments', key: 'payments', href: paymentsHref, icon: CreditCard },
    { name: 'Mess & Menu', key: 'mess', href: messHref, icon: Building2 },
    { name: 'Leave Requests', key: 'leaves', href: leavesHref, icon: Calendar },
    { name: 'Visitor Management', key: 'visitors', href: visitorsHref, icon: Users },
    { name: 'Digital Gate Pass', key: 'pass', href: passHref, icon: QrCode },
    { name: 'Face ID Setup', key: 'faceid', href: '/dashboard/student/faceid', icon: ShieldCheck },
    { name: 'Support & Desk', key: 'services', href: servicesHref, icon: Wrench },
  ];

  const wardenLinks = [
    { name: 'Dashboard', key: 'dashboard', href: '/dashboard/warden', icon: LayoutDashboard },
    { name: 'Rooms', key: 'rooms', href: '/dashboard/warden/rooms', icon: Bed },
    { name: 'Residents', key: 'residents', href: '/dashboard/warden/residents', icon: Users },
    { name: 'Complaints', key: 'complaints', href: '/dashboard/warden/complaints', icon: Wrench },
    { name: 'Visitor Passes', key: 'passes', href: '/dashboard/warden/passes', icon: QrCode },
    { name: 'Leaves', key: 'leaves', href: '/dashboard/warden/leaves', icon: Calendar },
    { name: 'AI Analytics', key: 'analytics', href: '/dashboard/warden/analytics', icon: TrendingUp },
  ];

  const adminLinks = [
    { name: 'Dashboard', key: 'dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Students', key: 'students', href: '/dashboard/admin/students', icon: Users },
    { name: 'Fees', key: 'fees', href: '/dashboard/admin/fees', icon: CreditCard },
    { name: 'Staff', key: 'staff', href: '/dashboard/admin/staff', icon: Briefcase },
    { name: 'Mess', key: 'mess', href: '/dashboard/admin/mess', icon: Building2 },
    { name: 'Report', key: 'report', href: '/dashboard/admin/report', icon: QrCode },
  ];

  const links = role === 'admin' ? adminLinks : role === 'warden' ? wardenLinks : studentLinks;

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
          const isActive = checkActive(link.key, link.href);
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
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer mt-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Need Help?</p>
            <p className="text-sm mb-4 font-light">{helpConfig.description}</p>
            <button
              onClick={handleCall}
              className="w-full bg-indigo-500 hover:bg-indigo-400 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              {helpConfig.label}
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
        </div>
      </div>
    </aside>
  );
}
