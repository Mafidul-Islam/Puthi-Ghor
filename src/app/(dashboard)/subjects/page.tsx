'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SubjectData {
  id: string; // UUID
  subject_name: string;
  class_id: string;
  status: string;
  classes?: { class_name: string }; // joined data
}

interface ClassData {
  id: string;
  class_name: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjectStatus, setSubjectStatus] = useState('Active');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    // Fetch classes for dropdown mapping
    const { data: classData } = await supabase.from('classes').select('id, class_name');
    if (classData) {
      setClasses(classData as ClassData[]);
      if (classData.length > 0) setSelectedClassId(classData[0].id);
    }

    // Fetch Subjects with joined class names
    const { data: subData, error } = await supabase
      .from('subjects')
      .select('*, classes(class_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subjects:', error);
      alert('Error fetching subjects');
    } else {
      setSubjects(subData || []);
    }
    setIsLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setSubjectName('');
    if (classes.length > 0) setSelectedClassId(classes[0].id);
    setSubjectStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: SubjectData) => {
    setEditingId(sub.id);
    setSubjectName(sub.subject_name);
    setSelectedClassId(sub.class_id);
    setSubjectStatus(sub.status === 'inactive' ? 'Inactive' : 'Active');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject? All PDFs inside might be affected.')) {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) {
        alert('Failed to delete subject. ' + error.message);
      } else {
        setSubjects(subjects.filter((s) => s.id !== id));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
        alert("Please select a class first.");
        return;
    }

    if (editingId) {
      // Update
      const { data, error } = await supabase
        .from('subjects')
        .update({ subject_name: subjectName, class_id: selectedClassId, status: subjectStatus.toLowerCase() })
        .eq('id', editingId)
        .select('*, classes(class_name)')
        .single();

      if (error) {
        alert('Error updating subject: ' + error.message);
      } else if (data) {
        setSubjects(subjects.map((s) => (s.id === editingId ? data : s)));
        setIsModalOpen(false);
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ subject_name: subjectName, class_id: selectedClassId, status: subjectStatus.toLowerCase() }])
        .select('*, classes(class_name)')
        .single();

      if (error) {
        alert('Error adding subject: ' + error.message);
      } else if (data) {
        setSubjects([data, ...subjects]);
        setIsModalOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Manage Subjects</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">Loading subjects...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">No subjects found. Add one!</td></tr>
            ) : (
                subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.classes?.class_name || 'Unknown Class'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {sub.status || 'active'}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(sub)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input 
                  type="text" 
                  required 
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. Physics" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Class</label>
                {classes.length === 0 ? (
                    <p className="text-sm text-red-500">Please create a Class first.</p>
                ) : (
                    <select 
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                    </select>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={subjectStatus}
                  onChange={(e) => setSubjectStatus(e.target.value)}
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
                <button type="submit" disabled={!subjectName.trim() || classes.length === 0} className="disabled:opacity-50 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
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
