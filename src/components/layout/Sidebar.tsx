'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const navItems = [
  { name: 'Dashboard',     href: '/dashboard',     icon: 'dashboard' },
  { name: 'Classes',       href: '/classes',        icon: 'school' },
  { name: 'Subjects',      href: '/subjects',       icon: 'book' },
  { name: 'PDFs',          href: '/pdfs',           icon: 'description' },
  { name: 'Store',         href: '/store',          icon: 'shopping_bag' },
  { name: 'Categories',    href: '/categories',     icon: 'category' },
  { name: 'Users',         href: '/users',          icon: 'group' },
  { name: 'Notifications', href: '/notifications',  icon: 'notifications' },
  { name: 'Analytics',     href: '/analytics',      icon: 'analytics' },
  { name: 'Settings',      href: '/settings',       icon: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="h-screen w-72 flex-col fixed left-0 top-0 flex flex-col py-8 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] z-40 border-r-0">
      {/* Brand */}
      <div className="px-10 mb-12">
        <h1 className="text-2xl font-bold text-[#0b1c30] font-headline tracking-tight">Puthi Ghor</h1>
        <p className="text-xs font-semibold text-[#45464d] tracking-widest mt-1 opacity-70 uppercase">Editorial Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-3 font-semibold tracking-tight transition-all duration-300 font-headline ${
                isActive
                  ? 'bg-white text-[#3755c3] shadow-sm rounded-full mx-0 scale-[1.02]'
                  : 'text-[#45464d] hover:text-[#0b1c30] px-10 hover:translate-x-1'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-10 mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-error font-semibold hover:opacity-70 transition-opacity font-headline tracking-tight"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
