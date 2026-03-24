'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    users: 0,
    classes: 0,
    subjects: 0,
    pdfs: 0,
    downloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const getCount = async (table: string) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (error) { console.error(`Error fetching count for ${table}:`, error); return 0; }
        return count || 0;
      };
      const [users, classes, subjects, pdfs, downloads] = await Promise.all([
        getCount('users'), getCount('classes'), getCount('subjects'),
        getCount('pdfs'), getCount('downloads'),
      ]);
      setCounts({ users, classes, subjects, pdfs, downloads });
      setIsLoading(false);
    };
    fetchCounts();
  }, []);

  const fmt = (n: number) => isLoading ? '...' : n.toLocaleString();

  const stats = [
    {
      label: 'Total Users',
      value: fmt(counts.users),
      icon: 'group',
      iconBg: 'bg-[#dde1ff]',
      iconColor: 'text-[#001453]',
      badge: '+2%',
    },
    { label: 'Total Classes',  value: fmt(counts.classes),  icon: 'school',        iconBg: 'bg-[#acedff]', iconColor: 'text-[#001f26]' },
    { label: 'Total Subjects', value: fmt(counts.subjects), icon: 'menu_book',     iconBg: 'bg-[#eaddff]', iconColor: 'text-[#25005a]' },
    { label: 'Total PDFs',     value: fmt(counts.pdfs),     icon: 'picture_as_pdf',iconBg: 'bg-[#d3e4fe]', iconColor: 'text-[#0b1c30]' },
    { label: 'Total Downloads',value: fmt(counts.downloads),icon: 'download',      iconBg: 'bg-[#ffdad6]', iconColor: 'text-[#93000a]' },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="mb-12">
        <h2 className="text-4xl font-extrabold text-[#0b1c30] tracking-tight mb-2 font-headline">
          Dashboard Overview
        </h2>
        <p className="text-[#45464d] text-lg font-body">
          Welcome back. Here&apos;s what&apos;s happening in Puthi Ghor today.
        </p>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-8 rounded-2xl shadow-[0_20px_40px_-10px_rgba(11,28,48,0.06)] flex flex-col justify-between group transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${s.iconBg} ${s.iconColor}`}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
              </div>
              {s.badge && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {s.badge}
                </span>
              )}
            </div>
            <div>
              <p className="text-4xl font-extrabold text-[#0b1c30] mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-[#45464d] tracking-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Bento Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Recent Uploads */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(11,28,48,0.06)] p-10 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold text-[#0b1c30] font-headline">Recent Uploads</h3>
            <Link
              href="/pdfs"
              className="text-[#001453] font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity text-sm"
            >
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="w-40 h-40 mb-8 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[8rem] text-[#3755c3] opacity-10"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}
              >
                cloud_upload
              </span>
            </div>
            <h4 className="text-xl font-bold text-[#0b1c30] mb-2 font-headline">No recent uploads yet.</h4>
            <p className="text-[#45464d] max-w-xs mb-8 text-sm">
              Start by uploading a PDF to your library to see them listed here.
            </p>
            <Link
              href="/pdfs"
              className="bg-[#0b1c30] text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3 shadow-lg"
            >
              <span className="material-symbols-outlined">add</span>
              Upload New PDF
            </Link>
          </div>
        </div>

        {/* Top Downloads */}
        <div className="lg:col-span-5 bg-[#eff4ff] rounded-2xl p-10 flex flex-col border border-[#c6c6cd]/10">
          <h3 className="text-2xl font-bold text-[#0b1c30] mb-8 font-headline">Top Downloads</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-white/60 backdrop-blur rounded-full mb-6">
              <span className="material-symbols-outlined text-4xl text-[#45464d] opacity-40">bar_chart</span>
            </div>
            <p className="text-[#45464d] font-medium italic">Not enough data to display top downloads.</p>
            <p className="text-xs text-[#45464d] mt-2 opacity-60">Analytics will appear here once downloads begin.</p>
          </div>
          <div className="mt-8 p-6 bg-white/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[#3755c3]">lightbulb</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0b1c30]">Pro Tip</p>
                <p className="text-xs text-[#45464d]">Promote your new PDFs on the store to boost downloads.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Banner */}
      <section className="mt-12">
        <div className="bg-[#001453] rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#001453] via-[#001453]/80 to-transparent" />
          <div className="relative p-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
              <h3 className="text-3xl font-bold text-white mb-4 font-headline">
                Ready to expand the library?
              </h3>
              <p className="text-[#dde1ff] opacity-80 text-lg font-body">
                Manage your subjects, categorize new content, and reach more students today through the editorial dashboard.
              </p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <Link
                href="/store"
                className="bg-white text-[#001453] px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
              >
                Manage Store
              </Link>
              <Link
                href="/analytics"
                className="border-2 border-[#dde1ff]/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                Review Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
