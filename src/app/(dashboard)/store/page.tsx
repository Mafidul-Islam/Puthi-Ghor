'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Download, Image as ImageIcon, File as FileIcon, Star, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail_url: string;
  file_url: string;
  file_type: string;
  is_featured: boolean;
  status: string;
  created_at: string;
}

// Removed static CATEGORIES array as it is now fetched dynamically from Supabase

export default function StorePage() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ebook',
    price: 0,
    status: 'active',
    is_featured: false,
    file_type: 'pdf',
    external_url: '' // New field for UI only
  });

  const [downloadSource, setDownloadSource] = useState<'upload' | 'external'>('upload');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('product_categories').select('slug, name').eq('status', 'active');
    if (data) {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('digital_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'ebook',
      price: 0,
      status: 'active',
      is_featured: false,
      file_type: 'pdf',
      external_url: ''
    });
    setDownloadSource('upload');
    setThumbnailFile(null);
    setProductFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: DigitalProduct) => {
    setEditingId(product.id);
    const isExternal = product.file_url?.startsWith('http') && !product.file_url.includes('supabase.co');
    setFormData({
      title: product.title,
      description: product.description || '',
      category: product.category,
      price: product.price,
      status: product.status,
      is_featured: product.is_featured,
      file_type: product.file_type,
      external_url: isExternal ? product.file_url : ''
    });
    setDownloadSource(isExternal ? 'external' : 'upload');
    setThumbnailFile(null);
    setProductFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('digital_products').delete().eq('id', id);
      if (error) alert('Error: ' + error.message);
      else fetchProducts();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let thumbnailUrl = editingId ? products.find(p => p.id === editingId)?.thumbnail_url : '';
      let fileUrl = downloadSource === 'external' ? formData.external_url : (editingId ? products.find(p => p.id === editingId)?.file_url : '');

      // 1. Upload Thumbnail if selected
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${Date.now()}_thumb.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('thumbnails').upload(fileName, thumbnailFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
        thumbnailUrl = data.publicUrl;
      }

      // 2. Upload Product File if selected and source is 'upload'
      if (downloadSource === 'upload' && productFile) {
        const fileExt = productFile.name.split('.').pop();
        const fileName = `${Date.now()}_file.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('pdfs').upload(fileName, productFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('pdfs').getPublicUrl(fileName);
        fileUrl = data.publicUrl;
      }

      if (!fileUrl) throw new Error("Please provide a product file or URL");

      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        status: formData.status,
        is_featured: formData.is_featured,
        file_type: formData.file_type,
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl,
      };

      if (editingId) {
        const { error } = await supabase.from('digital_products').update(productData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('digital_products').insert([productData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Error saving product: ' + message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Puthi Ghor Store</h1>
          <p className="text-gray-500">Manage your ebooks, source code, and other digital assets.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">No products found. Start by adding one!</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition group">
              <div className="relative aspect-video bg-gray-100">
                {product.thumbnail_url ? (
                  <Image src={product.thumbnail_url} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {product.is_featured && (
                    <div className="bg-yellow-400 text-white p-1.5 rounded-lg shadow-sm">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded-md text-xs font-bold uppercase shadow-sm ${product.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {product.status}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{product.category.replace('_', ' ')}</span>
                  <span className="text-lg font-bold text-gray-900">{product.price === 0 ? 'Free' : `₹${product.price}`}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition truncate">{product.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">{product.description}</p>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <a href={product.file_url} target="_blank" rel="noreferrer" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
                    <Download className="w-4 h-4 mr-1" />
                    {product.file_url?.includes('supabase.co') ? 'File' : 'Link'}
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => !isSaving && setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label>
                    <input 
                      type="text" required value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select 
                      value={formData.category} // category stores slug
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      {categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
                      {categories.length === 0 && <option value="ebook">Loading...</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                    <input 
                      type="number" step="0.01" required value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      placeholder="0.00 for free"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input 
                      type="checkbox" id="featured" checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="text-sm font-bold text-gray-700 cursor-pointer">Mark as Featured</label>
                  </div>
                   <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">File Type (e.g. PDF, ZIP)</label>
                    <input 
                      type="text" required value={formData.file_type}
                      onChange={(e) => setFormData({...formData, file_type: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      placeholder="pdf, zip, docx"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={4} value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                  placeholder="Tell buyers about this product..."
                ></textarea>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">Product Download Source</label>
                <div className="flex gap-4 mb-4">
                  <button 
                    type="button"
                    onClick={() => setDownloadSource('upload')}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${downloadSource === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDownloadSource('external')}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${downloadSource === 'external' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FileIcon className="w-4 h-4" />
                    External URL
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border-2 border-dashed rounded-xl border-gray-200 hover:border-blue-400 transition group">
                    <label className="block cursor-pointer text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                      <span className="text-sm font-bold text-gray-700 block mb-1">Thumbnail Image</span>
                      <span className="text-xs text-gray-500">{thumbnailFile ? thumbnailFile.name : 'Upload JPEG/PNG'}</span>
                      <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  </div>

                  {downloadSource === 'upload' ? (
                    <div className="p-4 border-2 border-dashed rounded-xl border-gray-200 hover:border-blue-400 transition group">
                      <label className="block cursor-pointer text-center">
                        <FileIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                        <span className="text-sm font-bold text-gray-700 block mb-1">Product File</span>
                        <span className="text-xs text-gray-500">{productFile ? productFile.name : 'Upload PDF/ZIP/etc'}</span>
                        <input type="file" onChange={(e) => setProductFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 border-2 rounded-xl border-gray-200 flex flex-col justify-center">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Product External URL</label>
                      <input 
                        type="url" required value={formData.external_url}
                        onChange={(e) => setFormData({...formData, external_url: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                        placeholder="https://example.com/file.zip"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button 
                  type="button" 
                  onClick={() => !isSaving && setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-6 py-2.5 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center"
                >
                  {isSaving ? 'Uploading...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
