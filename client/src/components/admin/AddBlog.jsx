import React, { useState } from 'react';
import axios from 'axios';

const AddBlog = ({ onBlogAdded }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: 'Traditional Recipes',
    image: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  const categories = [
    'Traditional Recipes',
    'Food Culture',
    'Health & Wellness',
    'Festivals',
    'Sustainability',
    'Heritage'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Removed handleImageChange as we are using image links now

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image || !formData.image.startsWith('http')) {
      alert('❌ Please enter a valid Image URL (starting with http:// or https://)');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const submitData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        imagePath: formData.image // The backend should save this string as imagePath
      };

      console.log('📤 Uploading blog...');

      const response = await axios.post(`${API_URL}/blogs`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Upload successful:', response.data);

      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        category: 'Traditional Recipes',
        image: ''
      });
      setImagePreview(null);

      alert('✅ Blog published successfully!');
      setShowForm(false);

      if (onBlogAdded) onBlogAdded();
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('❌ ' + (error.response?.data?.message || 'Failed to publish blog'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Admin Panel
          </h2>
          <p className="text-sm text-gray-600 mt-1">Upload and manage blog posts via Image Links</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 shadow-md"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Blog
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6 border-t border-blue-200 pt-6 bg-white p-6 rounded-lg">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter blog title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Excerpt *
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows="2"
              maxLength="200"
              placeholder="Brief description (150-200 characters)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/200 characters</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="8"
              placeholder="Write the full blog content..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Author & Category */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author Name *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Author name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* IMAGE LINK */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Image Link (URL) *
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={(e) => {
                handleChange(e);
                setImagePreview(e.target.value);
              }}
              required
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />

            {imagePreview && imagePreview.startsWith('http') && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full md:w-1/2 h-64 object-cover rounded-lg border-2 border-green-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.image}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Publish Blog
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setImagePreview(null);
                setFormData({
                  title: '',
                  excerpt: '',
                  content: '',
                  author: '',
                  category: 'Traditional Recipes',
                  image: ''
                });
              }}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddBlog;
