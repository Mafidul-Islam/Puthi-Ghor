'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ClassData {
  id: string; // UUID from supabase
  class_name: string;
  status: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [classStatus, setClassStatus] = useState('Active');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching classes:', error);
      alert('Error fetching classes');
    } else {
      setClasses(data || []);
    }
    setIsLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setClassName('');
    setClassStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassData) => {
    setEditingId(cls.id);
    setClassName(cls.class_name);
    setClassStatus(cls.status === 'inactive' ? 'Inactive' : 'Active');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class? All associated subjects and PDFs might be affected.')) {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting class:', error);
        alert('Failed to delete class. ' + error.message);
      } else {
        setClasses(classes.filter((c) => c.id !== id));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Update
      const { data, error } = await supabase
        .from('classes')
        .update({ class_name: className, status: classStatus.toLowerCase() })
        .eq('id', editingId)
        .select()
        .single();
        
      if (error) {
        alert('Error updating class: ' + error.message);
      } else if (data) {
        setClasses(classes.map((c) => (c.id === editingId ? data : c)));
        setIsModalOpen(false);
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('classes')
        .insert([{ class_name: className, status: classStatus.toLowerCase() }])
        .select()
        .single();
        
      if (error) {
        alert('Error adding class: ' + error.message);
      } else if (data) {
        setClasses([data, ...classes]);
        setIsModalOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Manage Classes</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-500 text-sm">Loading classes...</td></tr>
            ) : classes.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-500 text-sm">No classes found. Add one!</td></tr>
            ) : (
                classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${cls.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {cls.status || 'active'}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(cls)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Class' : 'Add New Class'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input 
                  type="text" 
                  required 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. Class 10" 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={classStatus}
                  onChange={(e) => setClassStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={!className.trim()} className="disabled:opacity-50 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
