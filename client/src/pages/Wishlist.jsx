import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoading, error } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [addedIds, setAddedIds] = useState({});

  const API_BASE = (process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api').replace('/api', '');

  const getImageUrl = (item) => {
    const p = item.product;
    if (!p) return `https://picsum.photos/seed/${item.productId}/300/300`;
    if (p.imageUrl) return p.imageUrl;
    if (p.imagePath) return `${API_BASE}/${p.imagePath}`;
    return `https://picsum.photos/seed/${p.id || p._id}/300/300`;
  };

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productId) => {
    if (window.confirm('Remove from wishlist?')) {
      dispatch(removeFromWishlist(productId));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear entire wishlist?')) {
      dispatch(clearWishlist());
    }
  };

  const handleAddToCart = async (product) => {
    const id = product.id || product._id;
    setAddedIds(prev => ({ ...prev, [id]: true }));
    try {
      await dispatch(addToCart({ productId: id, quantity: 1 })).unwrap();
    } catch (err) {
      alert('Failed to add to cart');
      setAddedIds(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
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
              onClick={() => dispatch(fetchWishlist())}
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {user?.name ? `Hi ${user.name}, ` : ''}
            you have {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {items.length === 0 ? (
          // Empty State
          <div className="bg-[var(--paper)] border border-[var(--border)] rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-[var(--kagzi)] rounded-full flex items-center justify-center border-2 border-dashed border-[var(--sindoor)]">
              <i className="fa-solid fa-heart-crack text-4xl" style={{ color: 'var(--sindoor)' }}></i>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>Your Wishlist is Empty</h2>
            <p className="text-[var(--muted)] mb-8 text-lg">Save your favorite BiharKaSwaad products here for later! Don't let those delicious flavors slip away.</p>
            <Link 
              to="/#shop" 
              className="inline-flex items-center gap-2 bg-[var(--sindoor)] text-white px-8 py-3 rounded-lg hover:opacity-90 transition font-medium"
            >
              <i className="fa-solid fa-basket-shopping"></i> Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Clear All Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>

            {/* Wishlist Items */}
            <div className="prod-grid">
              {items.map((item, i) => {
                const product = item.product;
                if (!product) return null;
                const id = product.id || product._id;
                const imageUrl = getImageUrl(item);
                const isAdded = addedIds[id];
                const stockLeft = product.stock || (3 + ((i * 7) % 12));
                const viewers = 4 + ((i * 5) % 20);
                const mrp = product.mrp || Math.round(product.price * 1.4);
                const off = Math.round((1 - product.price / mrp) * 100);
                const stockPct = Math.max(12, 100 - stockLeft * 4);
                const isWished = true;

                return (
                  <div className="card" key={id}>
                    <div className="card-img">
                      {product.category && <span className="kraft-tag">{product.category}</span>}
                      <button
                        className="fav"
                        aria-label="Remove from wishlist"
                        onClick={(e) => { e.preventDefault(); handleRemove(id); }}
                        style={{ color: 'var(--sindoor)' }}
                      >
                        <i className="fa-solid fa-heart"></i>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
