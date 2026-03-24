'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError || !session?.user) {
          router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (!mounted) return;

        if (profileError || !profile || profile.role !== 'admin') {
          console.warn('Unauthorized access attempt:', session.user.email);
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
        
        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        if (mounted) router.push('/login');
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setIsAuthorized(false);
        router.push('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3755c3]"></div>
          <p className="text-sm text-[#45464d] font-semibold font-body">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      <Sidebar />
      <Topbar />
      {/* ml-72 to offset fixed sidebar, pt-24 to offset fixed topbar */}
      <main className="ml-72 pt-32 pb-16 px-12 min-h-screen">
        {children}
      </main>
      {/* Decorative ambient blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-[#3755c3]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[10%] w-[30rem] h-[30rem] bg-[#57dffe]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
    </div>
  );
}
