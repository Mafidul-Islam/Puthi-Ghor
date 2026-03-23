'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Tags } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
    setIsLoading(false);
  };

  const handleNameChange = (name: string) => {
    // Auto-generate slug when creating a new category, omit special characters
    if (!editingId) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      status: cat.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Products using this category might lose their grouping.')) {
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) alert('Error: ' + error.message);
      else fetchCategories();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('product_categories').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('product_categories').insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Error saving category: ' + message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-gray-500">Manage categories for the Digital Store</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Category Name</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Slug Key</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No categories found.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <Tags className="w-5 h-5 text-gray-400" />
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {cat.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => !isSaving && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Test Series, Audiobooks"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slug (System ID)</label>
                <input 
                  type="text" required value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-500 bg-gray-50"
                  placeholder="test_series"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
