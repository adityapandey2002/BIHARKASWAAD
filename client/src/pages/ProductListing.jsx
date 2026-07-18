import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ProductListing = () => {
  const dispatch = useDispatch();
  const { list, isLoading, error } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';
  const initialSearch = queryParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [addedIds, setAddedIds] = useState({});
  const navigate = useNavigate();

  const API_BASE = (process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api').replace('/api', '');

  const getImageUrl = (product) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.imagePath) return `${API_BASE}/${product.imagePath}`;
    return `https://picsum.photos/seed/${product.id || product._id}/300/300`;
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const id = product.id || product._id;
    setAddedIds(prev => ({ ...prev, [id]: true }));
    try {
      await dispatch(addToCart({ productId: id, quantity: 1 })).unwrap();
    } catch (err) {
      alert('Failed to add to cart: ' + err);
      setAddedIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const categories = ['All', 'Snacks', 'Sweets', 'Spices', 'Beverages', 'Meals', 'Pickles'];
  const specialties = ['Thekua', 'Sattu', 'Tilkut', 'Achaar', 'Bhuja Mix', 'Gift Hampers'];

  useEffect(() => {
    const params = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    
    dispatch(fetchProducts(params));
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, selectedCategory, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchProducts({ search: searchQuery }));
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      dispatch(fetchProducts({ search: searchQuery }));
    } else {
      dispatch(fetchProducts({ category, search: searchQuery }));
    }
  };

  const handleSpecialtyFilter = (specialty) => {
    if (searchQuery === specialty) {
      // Toggle off
      setSearchQuery('');
      dispatch(fetchProducts({ category: selectedCategory !== 'All' ? selectedCategory : undefined }));
    } else {
      setSearchQuery(specialty);
      dispatch(fetchProducts({ category: selectedCategory !== 'All' ? selectedCategory : undefined, search: specialty }));
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item.productId === productId || item.product?.id === productId || item.product?._id === productId));
  };

  const handleWishlistToggle = (productId, e) => {
    e.preventDefault(); // Prevent navigation to product details
    
    if (!isAuthenticated) {
      alert('Please login to add to wishlist');
      return;
    }

    if (isInWishlist(productId)) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist(productId));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={() => dispatch(fetchProducts())}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover authentic flavors from Bihar</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 md:px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex justify-center items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </form>

        {/* Category Filter */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Main Categories</p>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Specialty Filter */}
        <div className="mb-8 pb-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Popular Items</p>
          <div className="flex flex-wrap gap-3">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyFilter(specialty)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  searchQuery === specialty
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-600">{list.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {list.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h2>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Check back soon for new products'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  dispatch(fetchProducts());
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="prod-grid">
            {list.map((product, i) => {
              const id = product.id || product._id;
              const imageUrl = getImageUrl(product);
              const isAdded = addedIds[id];
              const stockLeft = 3 + ((i * 7) % 12);
              const viewers = 4 + ((i * 5) % 20);
              const mrp = Math.round(product.price * 1.4);
              const off = Math.round((1 - product.price / mrp) * 100);
              const stockPct = Math.max(12, 100 - stockLeft * 4);
              const isWished = isInWishlist(id);

              return (
                <div className="card" key={id}>
                  <div className="card-img">
                    {product.category && <span className="kraft-tag">{product.category}</span>}
                    <button
                      className="fav"
                      aria-label="Add to wishlist"
                      onClick={(e) => handleWishlistToggle(id, e)}
                      style={{ color: isWished ? 'var(--sindoor)' : '' }}
                    >
                      {isWished ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
                    </button>
                    <Link to={`/products/${id}`} style={{ display: 'block', height: '100%' }}>
                      <img src={imageUrl} alt={product.name} loading="lazy" style={{ objectFit: 'contain', backgroundColor: '#fff' }} />
                    </Link>
                  </div>
                  <div className="card-body">
                    <div className="card-title line-clamp-2">
                      <Link to={`/products/${id}`} style={{ color: '#2A2118', display: 'block' }}>
                        {product.name || 'Unnamed Product'}
                      </Link>
                    </div>
                    <div className="rating">
                      <i className="fa-solid fa-star" style={{ color: 'var(--haldi)' }}></i> 4.8
                      <span>(200+ reviews)</span>
                    </div>
                    <div className="price-row">
                      <span className="price">₹{product.price}</span>
                      <span className="mrp">₹{mrp}</span>
                      <span style={{ fontSize: '11px', color: 'var(--neem)', fontWeight: '600' }}>{off}% off</span>
                    </div>
                    <div className="stock-bar">
                      <div className="stock-bar-fill" style={{ width: `${stockPct}%` }}></div>
                    </div>
                    <div className="urgency"><i className="fa-solid fa-fire"></i> Only {stockLeft} left in stock</div>
                    <div className="viewers"><i className="fa-solid fa-eye"></i> {viewers} people viewing this</div>

                    <button
                      className={`add-btn ${isAdded ? 'added' : ''}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {isAdded ? (
                        <><i className="fa-solid fa-check"></i> Added!</>
                      ) : (
                        <><i className="fa-solid fa-basket-shopping"></i> Add to cart</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;
