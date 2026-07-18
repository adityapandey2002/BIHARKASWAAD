import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../store/slices/productSlice';
import { addToCart, getCart } from '../../store/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';

const HomeSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: products, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [addedIds, setAddedIds] = useState({});

  // Dynamic Festival Timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const API_BASE = (process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api').replace('/api', '');

  useEffect(() => {
    dispatch(fetchProducts());
    if (isAuthenticated) {
      dispatch(getCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

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
      alert('Could not add to cart: ' + err);
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="tag-pill">
              <i className="fa-solid fa-leaf"></i> Handmade by women artisans, Bihar
            </div>
            <h1>स्वाद जो सीधा<br/><em>दिल से आता है.</em></h1>
            <p>Ghar jaisa Thekua, khaalis Sattu, aur Bihar ki mitti ki khushboo — ab seedha aapke ghar tak, jahan bhi aap ho.</p>
            <div className="hero-ctas">
              <a href="#shop" className="btn btn-primary">
                <i className="fa-solid fa-basket-shopping"></i> Shop now
              </a>
              <a href="#story" className="btn btn-outline">Our story</a>
            </div>
            <div className="hero-stats">
              <div><strong>12,000+</strong><span>Happy customers</span></div>
              <div><strong>60+</strong><span>Farmer partners</span></div>
              <div><strong>25+</strong><span>Authentic products</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-collage">
              <img src="https://picsum.photos/seed/thekua-hero/600/340" alt="Thekua" />
              <img src="https://picsum.photos/seed/sattu-hero/280/150" alt="Sattu" />
              <img src="https://picsum.photos/seed/tilkut-hero/280/150" alt="Tilkut" />
            </div>
          </div>
        </div>
      </section>

      <div className="stitch"></div>

      {/* ── Trust Strip ───────────────────────────────────────────────────── */}
      <section className="trust-strip">
        <div className="wrap">
          <div className="trust-tag">
            <i className="fa-solid fa-truck-fast"></i>
            <div><strong>Free shipping</strong><span>India-wide delivery</span></div>
          </div>
          <div className="trust-tag">
            <i className="fa-solid fa-hands-holding-circle"></i>
            <div><strong>Handmade with love</strong><span>By women artisans of Bihar</span></div>
          </div>
          <div className="trust-tag">
            <i className="fa-solid fa-award"></i>
            <div><strong>Quality assured</strong><span>Pure ingredients, no preservatives</span></div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="section" id="categories">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Categories</div>
            <h2>Explore our heritage</h2>
          </div>
          <div className="cat-grid">
            {[
              { icon: 'fa-cookie-bite', label: 'Thekua' },
              { icon: 'fa-wheat-awn', label: 'Sattu' },
              { icon: 'fa-candy-cane', label: 'Tilkut' },
              { icon: 'fa-jar', label: 'Achaar & Honey' },
              { icon: 'fa-bowl-rice', label: 'Bhuja Mix' },
              { icon: 'fa-gift', label: 'Gift Hampers' },
            ].map(({ icon, label }) => (
              <a href="#shop" key={label} className="cat-tile">
                <div className="cat-circle"><i className={`fa-solid ${icon}`}></i></div>
                <span>{label}</span>
              </a>
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

                const isWished = wishlistItems.some(item => item.productId === id || item.product?._id === id || item.product?.id === id);

                return (
                  <div className="card" key={id}>
                    <div className="card-img">
                      <span className="kraft-tag">{product.category || 'Bestseller'}</span>
                      <button 
                        className="fav" 
                        aria-label="Add to wishlist"
                        onClick={(e) => { e.preventDefault(); handleToggleWishlist(product); }}
                        style={{ color: isWished ? 'var(--sindoor)' : '' }}
                      >
                        {isWished ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
                      </button>
                      <Link to={`/products/${id}`} style={{ display: 'block', height: '100%' }}>
                        <img src={imageUrl} alt={product.name} loading="lazy" />
                      </Link>
                    </div>
                    <div className="card-body">
                      <div className="card-title">
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
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: '48px', display: 'block', marginBottom: '16px', color: 'var(--border)' }}></i>
              <p style={{ fontSize: '16px' }}>No products yet. Products added from the admin panel will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Festival Banner ───────────────────────────────────────────────── */}
      <section className="festival" id="festival">
        <h3>Chhath Puja Special is Live</h3>
        <p>Fresh Thekua, made in small batches, packed with prasad-grade purity — order before stock runs out.</p>
        <div style={{
          fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,.2)',
          display: 'inline-block', padding: '10px 20px', borderRadius: '6px',
          marginBottom: '18px', fontSize: '18px', fontWeight: '700', letterSpacing: '2px',
        }}>
          {pad(timeLeft.days)}d : {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
        </div>
        <div>
          <a href="#shop" className="btn btn-primary">
            <i className="fa-solid fa-bolt"></i> Shop festival specials
          </a>
        </div>
      </section>

      {/* ── Referral ──────────────────────────────────────────────────────── */}
      <section className="referral">
        <div className="wrap">
          <div>
            <div className="eyebrow">Refer &amp; earn</div>
            <h2>Bihar ka swaad, apno tak pahunchao.</h2>
            <p>Apne dost ko refer karo — unhe milega ₹100 off unke pehle order par, aur aapko milenge ₹100 reward points jab unka order deliver ho jaye.</p>
            <button className="btn btn-primary"><i className="fa-solid fa-share-nodes"></i> Get my referral link</button>
          </div>
          <div className="ref-stats">
            <div className="ref-card"><strong>₹100</strong><span>For you, per referral</span></div>
            <div className="ref-card"><strong>₹100</strong><span>For your friend</span></div>
            <div className="ref-card"><strong>2,400+</strong><span>Referrals sent</span></div>
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────────── */}
      <section className="story" id="story">
        <div className="wrap">
          <img src="https://picsum.photos/seed/artisan-kitchen/600/500" alt="Women artisans preparing Thekua" />
          <div>
            <div className="eyebrow" style={{ color: 'var(--haldi)' }}>Our story</div>
            <h2>From <em>Bihar's kitchens</em><br/>to your doorstep.</h2>
            <p>BiharKaSwaad began in a small kitchen in Kumharar, Patna — where recipes passed down through generations are still followed by hand, one batch at a time.</p>
            <p>Every jar of Sattu, every piece of Thekua, is prepared by women artisans from across Bihar, using pure ghee, freshly milled atta, and zero preservatives.</p>
            <div className="story-sig">— Team BiharKaSwaad</div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Testimonials</div>
            <h2>Stories from our customers</h2>
          </div>
          <div className="testi-grid">
            {[
              { initials: 'SR', name: 'Sunita Rao', city: 'Bengaluru', text: 'Living far from Bihar, this Thekua brought back the smell of ghee from my mother\'s kitchen. It genuinely felt like home.' },
              { initials: 'AJ', name: 'Alok Jha', city: 'Mumbai', text: 'I was skeptical about ordering something so traditional online, but the freshness and packaging completely won me over.' },
              { initials: 'RS', name: 'Dr. Ritu Singh', city: 'Delhi', text: 'Being from Mithila, I know what real Sattu should taste like — this one didn\'t disappoint at all. Ordering a bigger pack next time.' },
            ].map(({ initials, name, city, text }) => (
              <div className="testi-card" key={name}>
                <i className="fa-solid fa-quote-left"></i>
                <p>{text}</p>
                <div className="testi-who">
                  <div className="testi-avatar">{initials}</div>
                  <div><strong>{name}</strong><span>{city}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">FAQs</div>
            <h2>Common questions</h2>
          </div>
          <div className="faq-list">
            {[
              { q: 'How fresh are the products when they arrive?', a: 'Everything is prepared in small batches only after your order is placed, and shipped within 24-48 hours to keep it as fresh as possible.' },
              { q: 'Do you deliver across India?', a: 'Yes, we deliver pan-India to over 19,000 pincodes, with free shipping on all orders.' },
              { q: 'What is the shelf life of Thekua and Tilkut?', a: 'Thekua stays fresh for about 45 days and Tilkut for around 60 days when stored in an airtight container in a cool, dry place.' },
              { q: 'Can I return or exchange a product?', a: 'Since these are perishable food items, we don\'t accept returns, but if a package arrives damaged or incorrect, we\'ll replace it free of cost.' },
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

      {/* ── WhatsApp Float ────────────────────────────────────────────────── */}
      <a href="https://wa.me/916201066464" target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Chat on WhatsApp">
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </>
  );
};

export default HomeSection;
