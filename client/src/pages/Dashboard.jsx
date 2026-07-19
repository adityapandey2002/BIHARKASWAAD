import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProduct from '../components/admin/AddProduct';
import ManageSiteAssets from '../components/admin/ManageSiteAssets';
import ContactManagement from '../components/admin/ContactManagement';
import ManageCategories from '../components/admin/ManageCategories';
import AddBlog from '../components/admin/AddBlog';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'site-assets', 'contacts', 'blogs'

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/products`);
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Failed to delete product: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-6 md:space-x-8 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .flex.space-x-6::-webkit-scrollbar { display: none; }
            `}</style>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-4 px-1 font-semibold whitespace-nowrap transition-all ${activeTab === 'products'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <i className="fa-solid fa-box mr-2"></i> Products
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-4 px-1 font-semibold whitespace-nowrap transition-all ${activeTab === 'categories'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <i className="fa-solid fa-list mr-2"></i> Categories
            </button>

            <button
              onClick={() => setActiveTab('site-assets')}
              className={`pb-4 px-1 font-semibold whitespace-nowrap transition-all ${activeTab === 'site-assets'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <i className="fa-solid fa-image mr-2"></i> Logo & Slideshow
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`pb-4 px-1 font-semibold whitespace-nowrap transition-all ${activeTab === 'contacts'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <i className="fa-solid fa-envelope mr-2"></i> Inquiries
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`pb-4 px-1 font-semibold whitespace-nowrap transition-all ${activeTab === 'blogs'
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <i className="fa-solid fa-newspaper mr-2"></i> Blogs
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <>
            <AddProduct onProductAdded={fetchProducts} />

            <div className="bg-white rounded-xl shadow-md p-6 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Products</h2>
              {loading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500">No products yet. Add your first product above!</p>
              ) : (
                <div className="prod-grid">
                  {products.map((product) => {
                    const imageUrl = product.imagePath && product.imagePath.startsWith('http') 
                      ? product.imagePath 
                      : product.imagePath 
                        ? `${API_URL.replace('/api', '')}${product.imagePath}` 
                        : product.image ? `${API_URL.replace('/api', '')}${product.image}` : 'https://placehold.co/400x400?text=No+Image';
                    
                    const mrp = product.mrp || Math.round(product.price * 1.4);
                    const off = Math.round((1 - product.price / mrp) * 100);

                    return (
                      <div className="card" key={product.id || product._id}>
                        <div className="card-img">
                          <div style={{ position: 'absolute', top: '8px', left: '6px', zIndex: 10, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {product.featured ? (
                              <span className="kraft-tag" style={{ background: '#d32f2f', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <i className="fa-solid fa-star" style={{ fontSize: '10px' }}></i>
                                <span>Bestseller</span>
                              </span>
                            ) : (
                              product.category && <span className="kraft-tag">{product.category}</span>
                            )}
                          </div>
                          {/* Right-side Action Column */}
                          <div style={{ position: 'absolute', top: '10px', bottom: '10px', right: '10px', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                            {product.dietaryPreference === 'Non-Veg' ? (
                              <span title="Non-Vegetarian" style={{ display: 'inline-block', width: '14px', height: '14px', border: '1px solid #DC2626', borderRadius: '2px', padding: '1px', backgroundColor: 'rgba(255,255,255,0.92)' }}>
                                <span style={{ display: 'block', width: '100%', height: '100%', backgroundColor: '#DC2626', borderRadius: '50%' }}></span>
                              </span>
                            ) : (
                              <span title="Vegetarian" style={{ display: 'inline-block', width: '14px', height: '14px', border: '1px solid #16A34A', borderRadius: '2px', padding: '1px', backgroundColor: 'rgba(255,255,255,0.92)' }}>
                                <span style={{ display: 'block', width: '100%', height: '100%', backgroundColor: '#16A34A', borderRadius: '50%' }}></span>
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'block', height: '100%' }}>
                            <img src={imageUrl} alt={product.name} loading="lazy" style={{ objectFit: 'contain', backgroundColor: '#fff' }} />
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="card-title">
                            {product.name || 'Unnamed Product'}
                          </div>
                          
                          {(product.variants && product.variants.length > 0) ? (
                            <div className="text-xs text-gray-500 mt-1 mb-1 font-medium">
                              Available in: {product.variants.map(v => v.weight).join(', ')}
                            </div>
                          ) : product.packet ? (
                            <div className="text-xs text-gray-500 mt-1 mb-1 font-medium">
                              Size: {product.packet}
                            </div>
                          ) : null}

                          <div className="rating">
                            <i className="fa-solid fa-star" style={{ color: 'var(--haldi)' }}></i> {product.ratingsAverage ? parseFloat(product.ratingsAverage).toFixed(1) : '0.0'}
                            <span>({product.ratingsCount ? `${product.ratingsCount} reviews` : '0 reviews'})</span>
                          </div>
                          <div className="price-row">
                            <span className="price">₹{product.price}</span>
                            <span className="mrp">₹{mrp}</span>
                            <span style={{ fontSize: '11px', color: 'var(--neem)', fontWeight: '600' }}>{off}% off</span>
                          </div>

                          <div className="mt-auto pt-3 flex gap-2">
                            <button
                              className="add-btn flex-1"
                              onClick={() => handleDelete(product.id || product._id)}
                              style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C' }}
                            >
                              <i className="fa-solid fa-trash-can mr-2"></i> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'site-assets' ? (
          <ManageSiteAssets />
        ) : activeTab === 'categories' ? (
          <ManageCategories />
        ) : activeTab === 'contacts' ? (
          <ContactManagement />
        ) : (
          <AddBlog />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
