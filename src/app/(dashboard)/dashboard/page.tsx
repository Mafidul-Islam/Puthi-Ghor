import { Users, BookOpen, Files, FileText, Download } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { name: 'Total Users', stat: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Classes', stat: '12', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Total Subjects', stat: '64', icon: Files, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Total PDFs', stat: '342', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Total Downloads', stat: '12,450', icon: Download, color: 'text-green-600', bg: 'bg-green-100' },
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
