'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Files, FileText, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    users: 0,
    classes: 0,
    subjects: 0,
    pdfs: 0,
    downloads: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const getCount = async (table: string) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`Error fetching count for ${table}:`, error);
          return 0;
        }
        return count || 0;
      };

      const [users, classes, subjects, pdfs, downloads] = await Promise.all([
        getCount('users'),
        getCount('classes'),
        getCount('subjects'),
        getCount('pdfs'),
        getCount('downloads')
      ]);

      setCounts({ users, classes, subjects, pdfs, downloads });
      setIsLoading(false);
    };

    fetchCounts();
  }, []);

  const stats = [
    { name: 'Total Users', stat: isLoading ? '...' : counts.users.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Classes', stat: isLoading ? '...' : counts.classes.toLocaleString(), icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Total Subjects', stat: isLoading ? '...' : counts.subjects.toLocaleString(), icon: Files, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Total PDFs', stat: isLoading ? '...' : counts.pdfs.toLocaleString(), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Total Downloads', stat: isLoading ? '...' : counts.downloads.toLocaleString(), icon: Download, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="relative overflow-hidden rounded-lg bg-white p-5 shadow">
              <dt>
                <div className={`absolute rounded-md p-3 ${item.bg}`}>
                  <Icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h2>
          <div className="text-sm text-gray-500 text-center py-10">
            No recent uploads yet. Start by uploading a PDF!
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Downloads</h2>
          <div className="text-sm text-gray-500 text-center py-10">
            Not enough data to display top downloads.
          </div>
        </div>
      </div>
    </div>
  );
}
