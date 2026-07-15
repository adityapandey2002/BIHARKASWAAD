import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = ({ onProductAdded }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Images are now just an array of URL strings
  const [imageUrls, setImageUrls] = useState(['']);
  
  const [variants, setVariants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: 'Snacks',
    subCategory: '',
    sku: '',
    packet: '',
    flipkartLink: '',
    stock: '',
    featured: false,
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  const categories = ['Snacks', 'Sweets', 'Spices', 'Beverages', 'Meals', 'Pickles', 'Thekua', 'Sattu', 'Tilkut', 'Achaar', 'Honey', 'Bhuja Mix', 'Gift Hampers', 'Murabba', 'Chura', 'Khaja', 'Balushahi', 'Laai'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrl = () => {
    if (imageUrls.length >= 6) return alert('Maximum 6 images allowed');
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const moveImageUp = (index) => {
    if (index === 0) return;
    const newUrls = [...imageUrls];
    [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
    setImageUrls(newUrls);
  };

  const moveImageDown = (index) => {
    if (index === imageUrls.length - 1) return;
    const newUrls = [...imageUrls];
    [newUrls[index + 1], newUrls[index]] = [newUrls[index], newUrls[index + 1]];
    setImageUrls(newUrls);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm(`Are you sure you want to bulk upload products from ${file.name}?`)) {
      e.target.value = '';
      return;
    }

    setBulkLoading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/products/bulk-upload`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(`✅ Bulk upload successful! Created: ${res.data.created}, Updated: ${res.data.updated}`);
      if (res.data.errors && res.data.errors.length > 0) {
        console.warn('Bulk Upload Errors:', res.data.errors);
        alert(`Some rows had errors. Check console for details. Example: ${res.data.errors[0]}`);
      }
      if (onProductAdded) onProductAdded();
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('❌ ' + (error.response?.data?.message || 'Failed to process bulk upload.'));
    } finally {
      setBulkLoading(false);
      e.target.value = '';
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      alert('❌ Maximum 5 images allowed!');
      return;
    }

    const validFiles = files.filter(f => {
      const validTypes = ['image/jpeg', 'image/jpg'];
      if (!validTypes.includes(f.type)) {
        alert(`❌ ${f.name} is not a JPG/JPEG!`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        alert(`❌ ${f.name} exceeds 5MB!`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    // reset input
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { weight: '', price: '' }]);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validUrls = imageUrls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      alert('❌ Please provide at least one product image URL!');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      if (formData.mrp) submitData.append('mrp', formData.mrp);
      submitData.append('category', formData.category);
      if (formData.subCategory) submitData.append('subCategory', formData.subCategory);
      if (formData.sku) submitData.append('sku', formData.sku);
      if (formData.packet) submitData.append('packet', formData.packet);
      if (formData.flipkartLink) submitData.append('flipkartLink', formData.flipkartLink);
      submitData.append('stock', formData.stock);
      submitData.append('featured', formData.featured);
      
      submitData.append('images', JSON.stringify(validUrls));

      if (variants.length > 0) {
        submitData.append('variants', JSON.stringify(variants));
      }

      console.log('📤 Uploading product...');

      await axios.post(`${API_URL}/products`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: 'Snacks',
        subCategory: '',
        sku: '',
        packet: '',
        flipkartLink: '',
        stock: '',
        featured: false,
      });
      setImageUrls(['']);
      setVariants([]);

      alert('✅ Product added successfully!');
      setShowForm(false);

      if (onProductAdded) onProductAdded();
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('❌ ' + (error.response?.data?.message || 'Failed to add product'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border border-green-100 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Product Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Add new products to your store (JPG images only)</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleBulkUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={bulkLoading}
            />
            <button
              type="button"
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 shadow-md ${bulkLoading ? 'opacity-50' : ''}`}
            >
              {bulkLoading ? 'Uploading...' : 'Bulk Upload Excel'}
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2 shadow-md"
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
                Add New Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6 border-t border-green-200 pt-6 bg-white p-6 rounded-lg">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Litti Chokha Mix"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe your product..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Additional Details */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Selling Price (₹) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">MRP (₹)</label>
              <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} step="0.01" placeholder="Original price" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Category</label>
              <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="e.g. Traditional" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Item code" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Packet Size/Weight</label>
              <input type="text" name="packet" value={formData.packet} onChange={handleChange} placeholder="e.g. 500g" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Flipkart Link</label>
              <input type="url" name="flipkartLink" value={formData.flipkartLink} onChange={handleChange} placeholder="https://flipkart.com/..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          {/* VARIANTS */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Product Variants (Weights / Sizes)
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md font-medium hover:bg-green-200"
              >
                + Add Variant
              </button>
            </div>
            
            {variants.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No variants added. Product will use the default price.</p>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <input
                      type="text"
                      placeholder="e.g. 250g, 500g, 1Kg"
                      value={variant.weight}
                      onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                      required
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-semibold">₹</span>
                      <input
                        type="number"
                        placeholder="Variant Price"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        required
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Product */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
              Mark as Featured Product (will appear on homepage)
            </label>
          </div>

          {/* IMAGE URLS UPLOAD (Editable & Reorderable) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Product Image URLs (Cloudinary, Imgur, etc.) *
              </label>
              <button type="button" onClick={addImageUrl} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium hover:bg-blue-200">
                + Add Another URL
              </button>
            </div>

            <div className="space-y-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => moveImageUp(index)} disabled={index === 0} className="p-1 bg-gray-200 rounded disabled:opacity-30 hover:bg-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                    <button type="button" onClick={() => moveImageDown(index)} disabled={index === imageUrls.length - 1} className="p-1 bg-gray-200 rounded disabled:opacity-30 hover:bg-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                  
                  <span className="font-bold text-gray-500 w-6">#{index + 1}</span>
                  
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required={index === 0}
                  />

                  {url && url.startsWith('http') && (
                    <img src={url} alt={`Preview ${index}`} className="w-12 h-12 object-cover rounded shadow" />
                  )}

                  <button type="button" onClick={() => removeImageUrl(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">The first image (#1) will be the primary main image. You can use the up/down arrows to reshuffle the display order.</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || imageUrls.filter(u=>u.trim()!=='').length === 0}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Product...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  mrp: '',
                  category: 'Snacks',
                  subCategory: '',
                  sku: '',
                  packet: '',
                  flipkartLink: '',
                  stock: '',
                  featured: false,
                });
                setImageUrls(['']);
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

export default AddProduct;
