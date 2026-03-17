'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Folder, ArrowLeft } from 'lucide-react';

interface CourseFolderData {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
}

interface CourseData {
  id: string;
  title: string;
}

export default function CourseFoldersPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [folders, setFolders] = useState<CourseFolderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: courseData } = await supabase.from('courses').select('id, title').eq('id', courseId).single();
    if (courseData) setCourse(courseData);

    const { data, error } = await supabase.from('course_folders').select('*').eq('course_id', courseId).order('order_index');
    if (!error && data) setFolders(data);
    setIsLoading(false);
  };

  const openAdd = () => {
    setEditingId(null); setTitle(''); setOrderIndex(folders.length);
    setIsModalOpen(true);
  };

  const openEdit = (f: CourseFolderData) => {
    setEditingId(f.id); setTitle(f.title); setOrderIndex(f.order_index);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { alert('Title is required'); return; }
    const payload = { course_id: courseId, title: title.trim(), order_index: orderIndex };
    if (editingId) {
      const { error } = await supabase.from('course_folders').update(payload).eq('id', editingId);
      if (error) { alert('Error: ' + error.message); return; }
      setFolders(folders.map(f => f.id === editingId ? { ...f, ...payload } : f));
    } else {
      const { data, error } = await supabase.from('course_folders').insert([payload]).select().single();
      if (error) { alert('Error: ' + error.message); return; }
      if (data) setFolders([...folders, data]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this folder and all its lectures?')) return;
    const { error } = await supabase.from('course_folders').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setFolders(folders.filter(f => f.id !== id));
  };

  return (
    <div className="p-8">
      <button onClick={() => router.push('/courses')} className="flex items-center gap-2 text-blue-600 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modules – {course?.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{folders.length} module(s)</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Module
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : folders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Folder className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No modules yet. Click &quot;Add Module&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {folders.map(folder => (
            <div key={folder.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <Folder className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{folder.title}</h3>
                <p className="text-xs text-gray-400">Order: {folder.order_index}</p>
              </div>
              <button onClick={() => router.push(`/courses/${courseId}/folders/${folder.id}/lectures`)} className="text-sm text-blue-600 hover:underline mr-4">
                Manage Lectures
              </button>
              <button onClick={() => openEdit(folder)} className="text-gray-400 hover:text-blue-600 mr-2"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(folder.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Module' : 'Add Module'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Module Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lecture 1" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Order</label>
                <input type="number" value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700">{editingId ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
