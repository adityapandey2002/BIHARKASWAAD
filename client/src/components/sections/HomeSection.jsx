import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../store/slices/productSlice';
import { addToCart, getCart } from '../../store/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { useSiteAssets } from '../../context/SiteAssetsContext';

const HomeSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: products, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [addedIds, setAddedIds] = useState({});
  const [categories, setCategories] = useState([]);
  const { heroImage, heroVideo1, heroVideo2 } = useSiteAssets();

  // Dynamic Festival Timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const API_BASE = (process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api').replace('/api', '');

  useEffect(() => {
    dispatch(fetchProducts());
    if (isAuthenticated) {
      dispatch(getCart());
      dispatch(fetchWishlist());
    }
    
    // Fetch dynamic categories
    import('axios').then(axios => {
      axios.default.get(`${API_BASE}/api/categories`).then(res => {
        if(res.data && res.data.data) setCategories(res.data.data);
      }).catch(err => console.error("Failed to fetch categories", err));
    });
  }, [dispatch, isAuthenticated, API_BASE]);

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => n.toString().padStart(2, '0');

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
    const productId = product.id || product._id;
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      setAddedIds((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => setAddedIds((prev) => { const n = { ...prev }; delete n[productId]; return n; }), 1500);
    } catch (err) {
      console.error('Could not add to cart:', err);
    }
  };

  const handleToggleWishlist = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const productId = product.id || product._id;
    const isWished = wishlistItems.some(item => item.productId === productId || item.product?._id === productId || item.product?.id === productId);

    try {
      if (isWished) {
        await dispatch(removeFromWishlist(productId)).unwrap();
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
      }
    } catch (err) {
      alert('Could not update wishlist: ' + err);
    }
  };

  return (
    <>
      {/* ── Hero (New Layout) ─────────────────────────────────────────────────── */}
      <section className="py-4 md:py-8 bg-gray-50">
        <div className="wrap flex flex-col md:flex-row gap-4">
          {/* Large Panel (Left) */}
          <div className="w-full md:w-2/3 rounded-xl md:rounded-2xl overflow-hidden relative group shadow-sm md:shadow-md bg-white">
            <Link to="/products" className="block w-full h-full">
              <img
                src="https://res.cloudinary.com/kvteudbg/image/upload/v1784389764/Sattu_p5k4yh.png"
                alt="Sattu"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>
          {/* Small Panels (Right) */}
          <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-4">
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden relative group shadow-sm md:shadow-md bg-white border border-gray-100 flex items-center justify-center">
              <Link to="/products" className="block w-full h-full">
                <img src="https://res.cloudinary.com/kvteudbg/image/upload/v1784389764/CHura_dcjdl3.png" alt="Chura" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </Link>
            </div>
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden relative group shadow-sm md:shadow-md bg-white border border-gray-100 flex items-center justify-center">
              <Link to="/products" className="block w-full h-full">
                <img src="https://res.cloudinary.com/kvteudbg/image/upload/v1784389763/Bhuja_exibzo.png" alt="Bhuja" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="stitch"></div>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="section" id="categories" style={{ paddingTop: '10px', paddingBottom: '0px' }}>
        <div className="wrap">
          <div className="section-head mb-2 mt-0">
            <h2 className="font-display text-2xl font-bold text-indigo-900 mb-0">Categories</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 pt-1 snap-x justify-between" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.flex.gap-4.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
            {categories.map((cat) => (
              <Link to={`/products?category=${encodeURIComponent(cat.name)}`} key={cat.id} className="block text-center group snap-start flex-shrink-0 w-24 md:w-28">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm transition-transform duration-150 group-hover:scale-110 group-hover:border-orange-500">
                  {cat.imagePath ? (
                    <img src={`https://biharkaswaad.in${cat.imagePath}`} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">{cat.name[0]}</div>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="stitch"></div>
      {/* ── Products Grid ─────────────────────────────────────────────────── */}
      <section className="section" id="shop">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Trending now</div>
            <h2>Best sellers this week</h2>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--sindoor)' }}></i>
              <p style={{ marginTop: '14px', color: 'var(--muted)' }}>Loading products...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'var(--sindoor)', padding: '40px' }}>Error loading products. Please refresh.</div>
          ) : products && products.length > 0 ? (
            <div className="prod-grid">
              {products.map((product, i) => {
                const id = product.id || product._id;
                const imageUrl = getImageUrl(product);
                const isAdded = addedIds[id];
                const stockLeft = 3 + ((i * 7) % 12);
                const viewers = 4 + ((i * 5) % 20);
                const mrp = Math.round(product.price * 1.4);
                const off = Math.round((1 - product.price / mrp) * 100);
                const stockPct = Math.max(12, 100 - stockLeft * 4);

                const isWished = wishlistItems.some(item => (
                  String(item.productId) === String(id) || 
                  String(item.product?._id) === String(id) || 
                  String(item.product?.id) === String(id)
                ));

                return (
                  <div className="card" key={id}>
                    <div className="card-img">
                      <div style={{ position: 'absolute', top: '12px', left: '6px', zIndex: 10, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                          onClick={(e) => { e.preventDefault(); handleToggleWishlist(product); }}
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
                      <div 
                        className="card-title" 
                        style={{ 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          lineHeight: '1.4em',
                          maxHeight: '2.8em',
                          fontWeight: '600'
                        }}
                      >
                        <Link to={`/products/${id}`} style={{ color: '#2A2118' }}>
                          {product.name || 'Unnamed Product'}
                        </Link>
                      </div>
                      <div className="rating">
                        <i className="fa-solid fa-star" style={{ color: 'var(--haldi)' }}></i> {product.ratingsAverage ? parseFloat(product.ratingsAverage).toFixed(1) : '0.0'}
                        <span>({product.ratingsCount ? `${product.ratingsCount} reviews` : '0 reviews'})</span>
                      </div>
                      <div className="price-row">
                        <span className="price" style={{ color: '#000', fontWeight: '700' }}>₹{product.price}</span>
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
    ) : (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
        <i className="fa-solid fa-box-open" style={{ fontSize: '48px', display: 'block', marginBottom: '16px', color: 'var(--border)' }}></i>
        <p style={{ fontSize: '16px' }}>No products yet. Products added from the admin panel will appear here.</p>
      </div>
    )}
  </div>
</section>

{/* ── Festival Banner ───────────────────────────────────────────────── */ }
<section className="festival" id="festival" style={{ padding: '20px 0' }}>
  <h3 style={{ marginBottom: '4px' }}>Chhath Puja Special is Live</h3>
  <p style={{ marginBottom: '10px' }}>Fresh Thekua, made in small batches, packed with prasad-grade purity — order before stock runs out.</p>
  <div style={{
    fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,.2)',
    display: 'inline-block', padding: '6px 12px', borderRadius: '6px',
    marginBottom: '12px', fontSize: '16px', fontWeight: '700', letterSpacing: '2px',
  }}>
    {pad(timeLeft.days)}d : {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
  </div>
  <div>
    <Link to="/products" className="btn btn-primary" style={{ padding: '8px 16px' }}>
      <i className="fa-solid fa-bolt"></i> Shop festival specials
    </Link>
  </div>
</section>

{/* ── Our Story ─────────────────────────────────────────────────────── */ }
<section className="story" id="story">
  <div className="wrap">
    <img src="https://res.cloudinary.com/kvteudbg/image/upload/v1784476045/BiharKaSwaad_grhnlp.png" alt="BiharKaSwaad Products" />
    <div>
      <h2 style={{ color: 'var(--haldi)' }}>BiharKaSwaad</h2>
      <p>Craving the taste of home while living away shouldn't mean losing touch with the food that defines your roots. Whether you want a glass of pure Chana Sattu, the sweetness of handmade Thekua, or the perfect crunch of evening Bhuja, etc. BiharKaSwaad brings all these pure flavors straight from the village to your doorstep anywhere in India.</p>
      <p>We cut down the distance between you and your home, ensuring you never miss a single bite of the food you grew up with. Welcome to BiharKaSwaad—your ultimate destination for परंपरा, स्वाद, भरोसा!</p>
      <div className="story-sig">— Team BiharKaSwaad</div>
    </div>
  </div>
</section>

{/* ── Trust Strip ───────────────────────────────────────────────────── */ }
<section className="trust-strip">
  <div className="wrap">
    <div className="trust-tag">
      <i className="fa-solid fa-truck-fast"></i>
      <div><strong>Free shipping</strong><span>India-wide delivery</span></div>
    </div>
    <div className="trust-tag">
      <i className="fa-solid fa-hands-holding-circle"></i>
      <div><strong>Handmade with love</strong><span>By farmers of Bihar</span></div>
    </div>
    <div className="trust-tag">
      <i className="fa-solid fa-award"></i>
      <div><strong>Quality assured</strong><span>Pure ingredients, no preservatives</span></div>
    </div>
  </div>
</section>


{/* ── FAQ ───────────────────────────────────────────────────────────── */ }
<section className="section" id="faq">
  <div className="wrap">
    <div className="section-head">
      <div className="eyebrow">FAQs</div>
      <h2>Common questions</h2>
    </div>
    <div className="faq-list">
      {[
        { q: "What makes BiharKaSwaad products unique?", a: "We bring you the authentic taste of Bihar through traditional recipes rooted in rural villages. Our specialty is our traditional, homemade Thekua, crafted with love. Along with it, our Bhuja, Makhana, Pure Mustard Oil, Tilkut, Sattu, pure honey, multigrain flour and traditional pickles are all proudly made by our empowered group of local farmers." },
        { q: "Are your products freshly made?", a: "Yes! We prepare and pack our items in small batches to ensure maximum freshness, hygiene, and authentic flavor before they are shipped out to you." },
        { q: "How long does it take to process and ship my food order?", a: "Standard orders are carefully packaged and processed within 1–2 business days. Once shipped, standard delivery takes 3–7 business days depending on your location across India." },
        { q: "Do you offer faster delivery options if I need the products urgently?", a: "Yes, we offer a fast-tracked Air Shipping option at checkout for quicker delivery. Opting for this premium service adds an additional charge of 70 INR per Kg to your order total." },
        { q: "What should I do if my food packet arrives damaged or tampered with?", a: "Since our products are food items, safety is our priority. If the package appears visibly damaged or opened at delivery, please refuse to accept it from the courier and immediately contact our support team with photographic proof within 24 hours." },
        { q: "How can I reach out for bulk orders or customer support?", a: "For any questions, order updates, or grievance resolution, you can easily reach our team by emailing us directly at biharkaswaadfood@gmail.com or through our website's official contact page." }
      ].map(({ q, a }) => (
        <details key={q} className="faq-item" style={{ cursor: 'pointer' }}>
          <summary className="faq-q" style={{ listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
            {q}
            <i className="fa-solid fa-chevron-down"></i>
          </summary>
          <div className="faq-a"><p>{a}</p></div>
        </details>
      ))}
    </div>
  </div>
</section>

{/* ── WhatsApp Float ────────────────────────────────────────────────── */ }
<a href="https://wa.me/916201066464" target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Chat on WhatsApp">
  <i className="fa-brands fa-whatsapp"></i>
</a>
    </>
  );
};

export default HomeSection;
