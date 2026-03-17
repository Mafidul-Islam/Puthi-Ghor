'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('All Students');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      alert('Error fetching notifications: ' + error.message);
    } else {
      setNotifications(data || []);
    }
    setIsLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        { title, message, target }
      ])
      .select();

    if (error) {
      alert('Error sending notification: ' + error.message);
    } else {
      setNotifications([data[0], ...notifications]);
      setTitle('');
      setMessage('');
      setTarget('All Students');
      alert('Notification sent!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting: ' + error.message);
    } else {
      setNotifications(notifications.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Manage Notifications</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1 border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Send Announcement</h2>
          <form className="space-y-4" onSubmit={handleSend}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notification Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="e.g. Exam Schedule Updated" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea 
                rows={3} 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="Message details..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Audience</label>
              <select 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="All Students">All Students</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
            <button type="submit" className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading notifications...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / MSG</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Sent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.length === 0 && (
                 <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">No notifications sent yet.</td></tr>
                )}
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                      <div className="text-xs text-gray-500 truncate w-48">{notif.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {notif.target}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(notif.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
