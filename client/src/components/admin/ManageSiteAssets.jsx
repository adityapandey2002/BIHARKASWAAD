import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSiteAssets } from '../../context/SiteAssetsContext';

const ManageSiteAssets = () => {
  const { refreshAssets } = useSiteAssets();
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [slidePreview, setSlidePreview] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [heroSettings, setHeroSettings] = useState({
    heroImage: '',
    heroVideo1: '',
    heroVideo2: ''
  });
  const [slideData, setSlideData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    order: 0,
    imageUrl: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  const fetchAssets = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/site-assets`);
      setAssets(data.data);
      if (data.data.logoUrl) {
        setLogoPreview(data.data.logoUrl);
      }
      setHeroSettings({
        heroImage: data.data.heroImage || '',
        heroVideo1: data.data.heroVideo1 || '',
        heroVideo2: data.data.heroVideo2 || ''
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Upload logo handler
  const handleUploadLogo = async () => {
    if (!logoUrl || !logoUrl.startsWith('http')) {
      alert('Please enter a valid Logo URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Sending JSON instead of FormData
      await axios.post(`${API_URL}/site-assets/logo`, { logoUrl }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('✅ Logo updated successfully!');
      setLogoUrl('');
      fetchAssets();
      refreshAssets();
    } catch (error) {
      alert('❌ Failed to upload logo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Update Hero Settings handler
  const handleUpdateHeroSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/site-assets/settings`, heroSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Hero section updated successfully!');
      fetchAssets();
      refreshAssets();
    } catch (error) {
      alert('❌ Failed to update hero settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Add slideshow handler
  const handleAddSlideshow = async () => {
    if (!slideData.imageUrl || !slideData.imageUrl.startsWith('http')) {
      alert('Please enter a valid slideshow Image URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        title: slideData.title,
        subtitle: slideData.subtitle,
        buttonText: slideData.buttonText,
        buttonLink: slideData.buttonLink,
        order: slideData.order,
        imagePath: slideData.imageUrl // Sending URL as imagePath
      };

      await axios.post(`${API_URL}/site-assets/slideshow`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('✅ Slideshow added successfully!');
      setSlidePreview(null);
      setSlideData({
        title: '',
        subtitle: '',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        order: 0,
        imageUrl: ''
      });
      fetchAssets();
      refreshAssets();
    } catch (error) {
      alert('❌ Failed to add slideshow');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete slideshow handler
  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Delete this slideshow image?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/site-assets/slideshow/${slideId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Slideshow deleted');
      fetchAssets();
      refreshAssets();
    } catch (error) {
      alert('❌ Failed to delete slideshow');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl border border-red-200">
        <div>
          <h3 className="text-red-800 font-bold">Database Sync Required</h3>
          <p className="text-red-600 text-sm">Click this button if you are seeing 500 errors to update your production database schema.</p>
        </div>
        <button 
          onClick={async () => {
            if (window.confirm('Sync Database Schema? This will alter tables to match models.')) {
              try {
                const token = localStorage.getItem('token');
                await axios.get(`${process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api'}/site-assets/sync-db`, { headers: { Authorization: `Bearer ${token}` }});
                alert('✅ Database Synced Successfully!');
              } catch (e) {
                alert('❌ Sync failed: ' + e.message);
              }
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium text-sm hover:bg-red-700 shadow-sm"
        >
          Sync DB Schema (Fix 500 Errors)
        </button>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Website Logo
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Logo URL (https://...)"
            value={logoUrl}
            onChange={(e) => {
              setLogoUrl(e.target.value);
              setLogoPreview(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {logoPreview && (
            <div className="relative inline-block mt-4">
              <img
                src={logoPreview}
                alt="Logo"
                className="h-32 object-contain border-2 border-gray-200 rounded-lg p-2 bg-gray-50"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
            </div>
          )}

          {logoUrl && (
            <button
              onClick={handleUploadLogo}
              disabled={loading}
              className="block mt-4 w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Logo Link'}
            </button>
          )}
        </div>
      </div>

      {/* Hero Settings Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Homepage Hero Media
        </h2>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Recommended Sizes:</strong><br/>
            Main Image: 1200x800 or 16:9 ratio<br/>
            Side Videos: 600x600 (Square or portrait, fast loading MP4)
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Main Large Image URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={heroSettings.heroImage}
              onChange={(e) => setHeroSettings({ ...heroSettings, heroImage: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Small Side Video 1 URL (Top)</label>
            <input
              type="text"
              placeholder="https://..."
              value={heroSettings.heroVideo1}
              onChange={(e) => setHeroSettings({ ...heroSettings, heroVideo1: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Small Side Video 2 URL (Bottom)</label>
            <input
              type="text"
              placeholder="https://..."
              value={heroSettings.heroVideo2}
              onChange={(e) => setHeroSettings({ ...heroSettings, heroVideo2: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <button
            onClick={handleUpdateHeroSettings}
            disabled={loading}
            className="block mt-4 w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Hero Media'}
          </button>
        </div>
      </div>

      {/* Slideshow Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Homepage Slideshow
        </h2>

        {/* Add New Slide Form */}
        <div className="space-y-4 mb-8 border-b pb-6">
          <h3 className="font-semibold text-lg">Add New Slide</h3>

          <input
            type="text"
            placeholder="Slide Title *"
            value={slideData.title}
            onChange={(e) => setSlideData({ ...slideData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="text"
            placeholder="Subtitle (optional)"
            value={slideData.subtitle}
            onChange={(e) => setSlideData({ ...slideData, subtitle: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Button Text"
              value={slideData.buttonText}
              onChange={(e) => setSlideData({ ...slideData, buttonText: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Button Link"
              value={slideData.buttonLink}
              onChange={(e) => setSlideData({ ...slideData, buttonLink: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
          </div>

          <input
            type="text"
            placeholder="Image URL (https://...)"
            value={slideData.imageUrl}
            onChange={(e) => {
              setSlideData({ ...slideData, imageUrl: e.target.value });
              setSlidePreview(e.target.value);
            }}
            className="w-full px-4 py-2 border rounded-lg"
          />

          {slidePreview && (
            <div className="relative">
              <img
                src={slidePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg mt-4 border-2 border-green-500"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+URL';
                }}
              />
            </div>
          )}

          <button
            onClick={handleAddSlideshow}
            disabled={loading || !slideData.imageUrl || !slideData.title}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Slideshow'}
          </button>
        </div>

        {/* Existing Slides */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Current Slideshow Images ({assets?.slideshow?.length || 0})</h3>

          {assets?.slideshow && assets.slideshow.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {assets.slideshow.map((slide) => (
                <div key={slide._id} className="border rounded-lg overflow-hidden">
                  {slide.imageUrl && (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold">{slide.title}</h4>
                    {slide.subtitle && <p className="text-sm text-gray-600">{slide.subtitle}</p>}
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Order: {slide.order}</span>
                      <button
                        onClick={() => handleDeleteSlide(slide._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No slideshow images yet. Add your first slide above!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSiteAssets;
