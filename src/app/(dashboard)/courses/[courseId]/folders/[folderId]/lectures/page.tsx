'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, PlaySquare, ArrowLeft, Youtube } from 'lucide-react';

interface LectureData {
  id: string;
  folder_id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_id?: string | null;      // Allow string or null
  thumbnail_url?: string | null;   // Allow string or null
  order_index: number;
  created_at: string;
}

interface FolderData { id: string; title: string; }
interface CourseData { id: string; title: string; }

export default function FolderLecturesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const folderId = params.folderId as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [folder, setFolder] = useState<FolderData | null>(null);
  const [lectures, setLectures] = useState<LectureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => { fetchData(); }, [folderId]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: courseData } = await supabase.from('courses').select('id, title').eq('id', courseId).single();
    if (courseData) setCourse(courseData);
    const { data: folderData } = await supabase.from('course_folders').select('id, title').eq('id', folderId).single();
    if (folderData) setFolder(folderData);
    const { data, error } = await supabase.from('course_lectures').select('*').eq('folder_id', folderId).order('order_index');
    if (!error && data) setLectures(data);
    setIsLoading(false);
  };

  const openAdd = () => {
    setEditingId(null); setTitle(''); setDescription(''); setYoutubeUrl(''); 
    setYoutubeId(''); setThumbnailUrl(''); setOrderIndex(lectures.length);
    setIsModalOpen(true);
  };

  const openEdit = (l: LectureData) => {
    setEditingId(l.id); setTitle(l.title); setDescription(l.description || ''); 
    setYoutubeUrl(l.youtube_url || ''); setYoutubeId(l.youtube_id || ''); 
    setThumbnailUrl(l.thumbnail_url || ''); setOrderIndex(l.order_index);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { alert('Title is required'); return; }
    
    // Final check for ID
    let finalId = youtubeId || getYTId(youtubeUrl);
    if (!finalId && youtubeUrl) {
       alert('Please enter a valid YouTube URL');
       return;
    }

    const payload = { 
      folder_id: folderId, 
      title: title.trim(), 
      description: description.trim(), 
      youtube_url: youtubeUrl.trim(),
      youtube_id: finalId,
      thumbnail_url: finalId ? `https://img.youtube.com/vi/${finalId}/mqdefault.jpg` : '',
      order_index: orderIndex 
    };

    if (editingId) {
      const { error } = await supabase.from('course_lectures').update(payload).eq('id', editingId);
      if (error) { alert('Error: ' + error.message); return; }
      setLectures(lectures.map(l => l.id === editingId ? { ...l, ...payload } : l as LectureData));
    } else {
      const { data, error } = await supabase.from('course_lectures').insert([payload]).select().single();
      if (error) { alert('Error: ' + error.message); return; }
      if (data) setLectures([...lectures, data]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lecture?')) return;
    const { error } = await supabase.from('course_lectures').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setLectures(lectures.filter(l => l.id !== id));
  };

  const getYTId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="p-8">
      <button onClick={() => router.push(`/courses/${courseId}/folders`)} className="flex items-center gap-2 text-blue-600 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to {course?.title || 'Course'} Modules
      </button>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lectures – {folder?.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{lectures.length} lecture(s)</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Lecture
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : lectures.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No lectures yet. Click &quot;Add Lecture&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lectures.map(lec => {
            const ytId = getYTId(lec.youtube_url || '');
            return (
              <div key={lec.id} className="bg-white rounded-xl border p-4 flex items-start gap-4">
                {ytId ? (
                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlaySquare className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{lec.title}</h3>
                  {lec.description && <p className="text-sm text-gray-500 mt-0.5">{lec.description}</p>}
                  {lec.youtube_id && (
                    <div className="flex items-center gap-1 mt-1">
                      <PlaySquare className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-400 font-mono">ID: {lec.youtube_id}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Order: {lec.order_index}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(lec)} className="text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(lec.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Lecture' : 'Add Lecture'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Lecture Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to JavaScript" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief description..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Youtube className="w-4 h-4 text-red-500" /> YouTube URL</label>
                <input 
                  value={youtubeUrl} 
                  onChange={e => {
                    const val = e.target.value;
                    setYoutubeUrl(val);
                    const id = getYTId(val);
                    if (id) {
                      setYoutubeId(id);
                      setThumbnailUrl(`https://img.youtube.com/vi/${id}/mqdefault.jpg`);
                    }
                  }} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                />
                {(youtubeId || thumbnailUrl) && (
                  <div className="mt-2 relative">
                    <img src={thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                      ID: {youtubeId}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Order</label>
                <input type="number" value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700">{editingId ? 'Save' : 'Add Lecture'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
