'use client';

import { useState } from 'react';
import { Search, Ban, Trash2, CheckCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', class: 'Class 10', joinDate: '2023-09-15', status: 'Active' },
    { id: 2, name: 'Priya Singh', email: 'priya@example.com', class: 'Class 12', joinDate: '2023-09-20', status: 'Blocked' },
  ]);

  const handleToggleStatus = (id: number, currentStatus: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: currentStatus === 'Active' ? 'Blocked' : 'Active' } : u
    ));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Manage Students</h1>
        <div className="flex bg-gray-100 rounded-md px-3 py-1.5 w-72">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full"
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">No students registered yet.</td></tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.status === 'Active' ? (
                     <button onClick={() => handleToggleStatus(user.id, user.status)} className="text-orange-600 hover:text-orange-900 mr-4" title="Block User"><Ban className="w-4 h-4" /></button>
                  ) : (
                     <button onClick={() => handleToggleStatus(user.id, user.status)} className="text-green-600 hover:text-green-900 mr-4" title="Unblock User"><CheckCircle className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Delete User"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
