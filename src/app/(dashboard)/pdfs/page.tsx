'use client';

import { useState, useEffect } from 'react';
import { Upload, Edit, Trash2, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PdfData {
  id: string; // UUID
  title: string;
  subject_id: string;
  pdf_url: string;
  file_size: number;
  status: string;
  created_at: string;
  subjects?: { subject_name: string, class_id: string, classes?: { class_name: string } };
}

interface SubjectData {
  id: string;
  subject_name: string;
  class_id: string;
}

interface ClassData {
  id: string;
  class_name: string;
}

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState<PdfData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [pdfStatus, setPdfStatus] = useState('Published');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    // Fetch classes and subjects
    const { data: classData } = await supabase.from('classes').select('id, class_name');
    const { data: subjectData } = await supabase.from('subjects').select('id, subject_name, class_id');
    
    if (classData) setClasses(classData as ClassData[]);
    if (subjectData) setSubjects(subjectData as SubjectData[]);

    // Fetch PDFs with nested subject & class info
    const { data: pdfData, error } = await supabase
      .from('pdfs')
      .select('*, subjects(subject_name, class_id, classes(class_name))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching PDFs:', error);
      alert('Error fetching PDFs');
    } else {
      setPdfs(pdfData || []);
    }
    setIsLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setPdfTitle('');
    if (classes.length > 0) setSelectedClassId(classes[0].id);
    setSelectedSubjectId('');
    setPdfStatus('Published');
    setFileToUpload(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pdf: PdfData) => {
    setEditingId(pdf.id);
    setPdfTitle(pdf.title);
    setSelectedClassId(pdf.subjects?.class_id || '');
    setSelectedSubjectId(pdf.subject_id);
    setPdfStatus(pdf.status === 'draft' ? 'Draft' : 'Published');
    setFileToUpload(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, pdfUrl: string) => {
    if (window.confirm('Are you sure you want to delete this PDF? This will also remove the file from storage.')) {
      // 1. Delete record
      const { error } = await supabase.from('pdfs').delete().eq('id', id);
      if (error) {
        alert('Failed to delete PDF record. ' + error.message);
        return;
      }
      
      // 2. Delete file from storage (attempt to extract filename)
      try {
        const urlParts = pdfUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from('pdfs').remove([fileName]);
      } catch(e) { console.error("Could not delete file from storage.", e) }

      setPdfs(pdfs.filter((p) => p.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
        alert("Please select a valid subject.");
        return;
    }

    setUploading(true);

    if (editingId) {
      // Update logic (Not handling file update here for simplicity, just metadata)
      const { data, error } = await supabase
        .from('pdfs')
        .update({ title: pdfTitle, subject_id: selectedSubjectId, status: pdfStatus.toLowerCase() })
        .eq('id', editingId)
        .select('*, subjects(subject_name, class_id, classes(class_name))')
        .single();

      if (error) {
        alert('Error updating PDF: ' + error.message);
      } else if (data) {
        setPdfs(pdfs.map((p) => (p.id === editingId ? data : p)));
        setIsModalOpen(false);
      }
    } else {
      // Insert logic
      if (!fileToUpload) {
          alert("Please select a PDF file to upload.");
          setUploading(false);
          return;
      }

      // 1. Upload file to Storage
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, fileToUpload);

      if (uploadError) {
          alert('Error uploading file: ' + uploadError.message);
          setUploading(false);
          return;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(fileName);

      // 3. Insert record into Database
      const { data, error } = await supabase
        .from('pdfs')
        .insert([{ 
            title: pdfTitle, 
            subject_id: selectedSubjectId,
            class_id: selectedClassId,
            pdf_url: publicUrl,
            file_size: fileToUpload.size,
            status: pdfStatus.toLowerCase() 
        }])
        .select('*, subjects(subject_name, class_id, classes(class_name))')
        .single();

      if (error) {
        alert('Error tracking PDF in database: ' + error.message);
      } else if (data) {
        setPdfs([data, ...pdfs]);
        setIsModalOpen(false);
      }
    }
    setUploading(false);
  };

  // Filter subjects based on selected class in Add/Edit Modal
  const getFilteredSubjects = () => {
      return subjects.filter(s => s.class_id === selectedClassId);
  };

  // Auto-select first subject when class changes in modal
  useEffect(() => {
      const filtered = subjects.filter(s => s.class_id === selectedClassId);
      if (filtered.length > 0 && !filtered.find(s => s.id === selectedSubjectId)) {
          setSelectedSubjectId(filtered[0].id);
      } else if (filtered.length === 0) {
          setSelectedSubjectId('');
      }
  }, [selectedClassId, subjects, selectedSubjectId]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Manage PDFs</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload PDF
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class / Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">Loading PDFs...</td></tr>
            ) : pdfs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">No PDFs found. Upload one!</td></tr>
            ) : (
                pdfs.map((pdf) => (
                <tr key={pdf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pdf.title}</div>
                    <div className="text-xs text-gray-500">{formatBytes(pdf.file_size)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pdf.subjects?.classes?.class_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{pdf.subjects?.subject_name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pdf.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${pdf.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {pdf.status || 'published'}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={pdf.pdf_url} target="_blank" rel="noreferrer" title="View/Download" className="text-blue-600 hover:text-blue-900 mr-3 inline-block align-middle"><Download className="w-4 h-4" /></a>
                    <button onClick={() => openEditModal(pdf)} className="text-indigo-600 hover:text-indigo-900 mr-3 align-middle"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(pdf.id, pdf.pdf_url)} className="text-red-600 hover:text-red-900 align-middle"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-semibold">{editingId ? 'Edit PDF details' : 'Upload New PDF'}</h2>
              <button onClick={() => !uploading && setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF Title</label>
                <input 
                  type="text" 
                  required 
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. Chapter 1 Notes" 
                  disabled={uploading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  {classes.length === 0 ? (
                      <p className="text-xs text-red-500">Create a Class first.</p>
                  ) : (
                    <select 
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={uploading}
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                   {getFilteredSubjects().length === 0 ? (
                       <p className="text-xs text-red-500">Create a Subject first.</p>
                   ) : (
                    <select 
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={uploading}
                    >
                        {getFilteredSubjects().map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                    </select>
                   )}
                </div>
              </div>
              
              {!editingId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    disabled={uploading}
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={pdfStatus}
                  onChange={(e) => setPdfStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={uploading}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => !uploading && setIsModalOpen(false)} disabled={uploading} className="disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={uploading || !pdfTitle.trim() || !selectedSubjectId || (!editingId && !fileToUpload)} className="disabled:opacity-50 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  {uploading ? 'Processing...' : editingId ? 'Update' : 'Upload PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
