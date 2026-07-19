import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`);
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return alert('Category name is required');
    
    setLoading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', newCatName);
    if (newCatImage) formData.append('imageUrl', newCatImage);

    try {
      await axios.post(`${API_URL}/categories`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Category added successfully!');
      setNewCatName('');
      setNewCatImage('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Categories</h2>
      
      <form onSubmit={handleAddCategory} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-4">Add New Category</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input 
              type="text" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g. Snacks"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Image Link (URL)</label>
            <input 
              type="text" 
              value={newCatImage}
              onChange={(e) => setNewCatImage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-semibold text-gray-700 mb-4">Current Categories ({categories.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(c => (
            <div key={c.id} className="border rounded-lg p-3 flex flex-col items-center text-center relative">
              <button 
                onClick={() => handleDelete(c.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
              >
                &times;
              </button>
              {c.imagePath ? (
                <img src={`https://biharkaswaad.in${c.imagePath}`} alt={c.name} className="w-16 h-16 object-cover rounded-full mb-2" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-gray-400">
                  <i className="fa-solid fa-image"></i>
                </div>
              )}
              <span className="font-medium text-sm">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
