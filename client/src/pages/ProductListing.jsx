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
      console.error('Failed to add to cart:', err);
      setAddedIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const [categories, setCategories] = useState(['All']);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  // Fetch dynamic categories on mount
  useEffect(() => {
    import('axios').then(axios => {
      axios.default.get(`${API_BASE}/api/categories`).then(res => {
        if(res.data && res.data.data) {
          const names = res.data.data.map(c => c.name);
          setCategories(['All', ...names]);
        }
      }).catch(err => console.error("Failed to fetch categories", err));
    });
  }, [API_BASE]);

  // Extract dynamic subcategories from currently loaded products
  useEffect(() => {
    if (list && list.length > 0) {
      const subs = new Set();
      list.forEach(p => {
        if (p.subCategory) subs.add(p.subCategory);
      });
      setSubCategories(Array.from(subs));
    } else {
      setSubCategories([]);
    }
    // If selected subcategory no longer exists in current list, reset it
    if (selectedSubCategory !== 'All' && list && !list.find(p => p.subCategory === selectedSubCategory)) {
      setSelectedSubCategory('All');
    }
  }, [list, selectedSubCategory]);

  useEffect(() => {
    const params = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    // We filter subCategory locally since API doesn't support it directly yet, 
    // or we can just send it if backend supports it. Let's rely on local filtering for subCategory.
    
    dispatch(fetchProducts(params));
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, selectedCategory, searchQuery]);

  // Filter list locally for subcategory
  const displayedProducts = list ? list.filter(p => selectedSubCategory === 'All' || p.subCategory === selectedSubCategory) : [];

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

  const handleSubCategoryFilter = (subCat) => {
    if (selectedSubCategory === subCat) {
      setSelectedSubCategory('All');
    } else {
      setSelectedSubCategory(subCat);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (
      String(item.productId) === String(productId) || 
      String(item.product?.id) === String(productId) || 
      String(item.product?._id) === String(productId)
    ));
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
    <div className="min-h-screen py-6 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0">Our Products</h1>
          <p className="text-xs text-gray-600">Discover authentic flavors from Bihar</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition duration-200 flex justify-center items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </form>

        {/* Category Filter */}
        <div className="mb-2">
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.flex.flex-nowrap::-webkit-scrollbar { display: none; }`}</style>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`flex-1 text-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap snap-start flex-shrink-0 transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Category Filter */}
        {subCategories.length > 0 && (
          <div className="mb-2 pb-2 border-b border-gray-200">
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {subCategories.map((subCat) => (
                <button
                  key={subCat}
                  onClick={() => handleSubCategoryFilter(subCat)}
                  className={`flex-1 text-center px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap snap-start flex-shrink-0 transition-all duration-200 ${
                    selectedSubCategory === subCat
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
                  }`}
                >
                  {subCat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Count */}
        <div className="mb-4 text-xs">
          <p className="text-gray-500">
            Showing <span className="font-semibold text-blue-600">{displayedProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {displayedProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h2>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'All' || selectedSubCategory !== 'All'
                ? 'Try adjusting your search or filters' 
                : 'Check back soon for new products'}
            </p>
            {(searchQuery || selectedCategory !== 'All' || selectedSubCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedSubCategory('All');
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
            {displayedProducts.map((product, i) => {
              const id = product.id || product._id;
              const imageUrl = getImageUrl(product);
              const isAdded = addedIds[id];
              const stockLeft = product.stock || 0;
              const viewers = 4 + ((i * 5) % 20);
              const mrp = Math.round(product.price * 1.4);
              const off = Math.round((1 - product.price / mrp) * 100);
              const stockPct = Math.max(12, 100 - stockLeft * 4);
              const isWished = isInWishlist(id);

              return (
                <div className="card" key={id}>
                  <div className="card-img">
                    <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                      <button
                        className="fav"
                        aria-label="Add to wishlist"
                        onClick={(e) => handleWishlistToggle(id, e)}
                        style={{ position: 'static', color: isWished ? 'var(--sindoor)' : '' }}
                      >
                        {isWished ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
                      </button>

                      {/* Veg / Non-Veg Mark on Bottom */}
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

                    <Link to={`/products/${id}`} style={{ display: 'block', height: '100%' }}>
                      <img src={imageUrl} alt={product.name} loading="lazy" style={{ objectFit: 'contain', backgroundColor: '#fff' }} />
                    </Link>
                  </div>
                  <div className="card-body">
                    <div className="card-title">
                      <Link to={`/products/${id}`}>
                        {product.name || 'Unnamed Product'}
                      </Link>
                    </div>
                    
                    {/* Display Variants or Packet info if available */}
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
                    <div className="stock-bar">
                      <div className="stock-bar-fill" style={{ width: `${stockPct}%` }}></div>
                    </div>
                    {stockLeft <= 10 && stockLeft > 0 ? (
                      <div className="urgency"><i className="fa-solid fa-fire"></i> Only {stockLeft} left in stock</div>
                    ) : stockLeft === 0 ? (
                      <div className="urgency" style={{ color: '#DC2626' }}><i className="fa-solid fa-ban"></i> Out of stock</div>
                    ) : null}
                    <div className="viewers"><i className="fa-solid fa-eye"></i> {viewers} people viewing this</div>

                    <div className="mt-auto pt-3">
                      <button
                        className={`add-btn ${isAdded ? 'added' : ''}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={stockLeft === 0}
                        style={stockLeft === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {isAdded ? (
                          <><i className="fa-solid fa-check"></i> Added!</>
                        ) : (
                          <><i className="fa-solid fa-basket-shopping"></i> Add to cart</>
                        )}
                      </button>
                    </div>
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
