'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, PlaySquare, Youtube, Layout } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CourseData {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url: string;
  display_order: number;
  status: string;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState('Active');

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('courses').select('*').order('display_order', { ascending: true });
    if (!error && data) setCourses(data);
    else if (error) alert('Error fetching courses: ' + error.message);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openAddModal = () => {
    setEditingId(null);
    setTitle(''); setDescription(''); setYoutubeUrl(''); setThumbnailUrl('');
    setDisplayOrder(courses.length); setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (c: CourseData) => {
    setEditingId(c.id);
    setTitle(c.title); setDescription(c.description || ''); setYoutubeUrl(c.youtube_url || '');
    setThumbnailUrl(c.thumbnail_url || ''); setDisplayOrder(c.display_order); setStatus(c.status === 'inactive' ? 'Inactive' : 'Active');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { alert('Title is required'); return; }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      youtube_url: youtubeUrl.trim(),
      thumbnail_url: thumbnailUrl.trim(),
      display_order: displayOrder,
      status: status.toLowerCase()
    };

    if (editingId) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editingId);
      if (error) { alert('Error updating course: ' + error.message); return; }
      setCourses(courses.map(c => c.id === editingId ? { ...c, ...payload } : c));
    } else {
      const { data, error } = await supabase.from('courses').insert([payload]).select().single();
      if (error) { alert('Error adding course: ' + error.message); return; }
      if (data) setCourses([...courses, data]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setCourses(courses.filter(c => c.id !== id));
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} total courses</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No courses yet. Click &quot;Add Course&quot; to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const ytThumb = getYouTubeThumbnail(course.youtube_url || '');
            const thumb = course.thumbnail_url || ytThumb;
            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="relative h-44 bg-gray-100 flex items-center justify-center">
                  {thumb ? (
                    <Image src={thumb} alt={course.title} fill className="object-cover" />
                  ) : (
                    <PlaySquare className="w-16 h-16 text-gray-300" />
                  )}
                  {course.youtube_url && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Youtube className="w-3 h-3" /> YouTube
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {course.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base">{course.title}</h3>
                  {course.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">Order: {course.display_order}</p>
                  <div className="flex gap-2 mt-4">
                    <Link 
                      href={`/courses/${course.id}/folders`}
                      className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-50 text-blue-600 rounded-lg py-2 hover:bg-blue-100 font-medium"
                    >
                      <Layout className="w-3 h-3" /> Manage
                    </Link>
                    <button onClick={() => openEditModal(course)} className="flex-1 flex items-center justify-center gap-1 text-sm border border-gray-200 rounded-lg py-2 hover:bg-gray-50">
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="flex-1 flex items-center justify-center gap-1 text-sm border border-red-200 text-red-600 rounded-lg py-2 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Course' : 'Add New Course'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Course Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Class 10 Physics" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief course description..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Youtube className="w-4 h-4 text-red-500" /> YouTube URL</label>
                <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                {youtubeUrl && getYouTubeThumbnail(youtubeUrl) && (
                  <div className="mt-2 relative h-32 w-full overflow-hidden rounded-lg">
                    <Image src={getYouTubeThumbnail(youtubeUrl)!} alt="YouTube Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Thumbnail URL (optional override)</label>
                <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Display Order</label>
                  <input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                {editingId ? 'Save Changes' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
