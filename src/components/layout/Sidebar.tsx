'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  BookOpen, 
  Files, 
  FileText, 
  Users, 
  Bell, 
  BarChart, 
  Settings, 
  LogOut,
  ShoppingBag
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Classes', href: '/classes', icon: BookOpen },
  { name: 'Subjects', href: '/subjects', icon: Files },
  { name: 'PDFs', href: '/pdfs', icon: FileText },
  { name: 'Digital Store', href: '/store', icon: ShoppingBag },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r min-h-screen">
      <div className="flex items-center justify-center h-16 border-b">
        <span className="text-xl font-bold text-blue-600">Puthi Ghor Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
