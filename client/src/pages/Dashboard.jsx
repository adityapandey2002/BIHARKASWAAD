import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProduct from '../components/admin/AddProduct';
import ManageSiteAssets from '../components/admin/ManageSiteAssets';
import ContactManagement from '../components/admin/ContactManagement';
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
      alert('✅ Product deleted');
      fetchProducts();
    } catch (error) {
      alert('❌ Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/site-assets/sync-db`, { headers: { Authorization: `Bearer ${token}` } });
                alert('✅ ' + res.data.message);
              } catch (err) {
                alert('❌ Failed to sync DB. Ensure the latest backend code is deployed to your live server.');
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-red-700 transition"
          >
            <i className="fa-solid fa-rotate mr-2"></i> Fix DB Errors (Sync)
          </button>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                      {product.image && (
                        <img
                          src={`${API_URL.replace('/api', '')}${product.image}`}
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-green-600 font-bold mb-2">₹{product.price}</p>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-bold mt-2"
                      >
                        Delete Product
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'site-assets' ? (
          <ManageSiteAssets />
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
