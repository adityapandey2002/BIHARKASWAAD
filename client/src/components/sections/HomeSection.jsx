import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';

const HomeSection = () => {
  const dispatch = useDispatch();
  const { list: products, isLoading, error } = useSelector((state) => state.products);

  // Dynamic Festival Timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    // Set a target date 3 days from now for the festival special
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeObj) => {
    return `${timeObj.days.toString().padStart(2, '0')}:${timeObj.hours.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}:${timeObj.seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
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

      <section className="section" id="categories">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Categories</div>
            <h2>Explore our heritage</h2>
          </div>
          <div className="cat-grid">
            <a href="#shop" className="cat-tile">
              <div className="cat-circle"><i className="fa-solid fa-cookie-bite"></i></div>
              <span>Thekua</span>
            </a>
            <a href="#shop" className="cat-tile">
              <div className="cat-circle"><i className="fa-solid fa-wheat-awn"></i></div>
              <span>Sattu</span>
            </a>
            <a href="#shop" className="cat-tile">
              <div className="cat-circle"><i className="fa-solid fa-candy-cane"></i></div>
              <span>Tilkut</span>
            </a>
            <a href="#shop" className="cat-tile">
              <div className="cat-circle"><i className="fa-solid fa-jar"></i></div>
              <span>Achaar &amp; Honey</span>
            </a>
            <a href="#shop" className="cat-tile">
              <div className="cat-circle"><i className="fa-solid fa-bowl-rice"></i></div>
              <span>Bhuja Mix</span>
            </a>
            <a href="#shop" className="cat-tile">
              <div className="cat-circle"><i className="fa-solid fa-gift"></i></div>
              <span>Gift Hampers</span>
            </a>
          </div>
        </div>
      </section>

      <div className="stitch"></div>

      <section className="section" id="shop">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Trending now</div>
            <h2>Best sellers this week</h2>
          </div>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'red' }}>Error loading products.</div>
          ) : (
            <div className="prod-grid">
              {products && products.map((product, i) => {
                const imageUrl = product.image ? 
                  `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}` : 
                  `https://picsum.photos/seed/${product._id}/300/300`;
                
                const mrp = product.price + 100; // Simulated MRP for mockup parity
                const off = Math.round((1 - product.price / mrp) * 100);
                const stockLeft = 3 + ((i * 7) % 12);
                const viewers = 4 + ((i * 5) % 20);
                const stockPct = Math.max(12, 100 - stockLeft * 4);

                return (
                  <div className="card" key={product._id}>
                    <div className="card-img">
                      <span className="kraft-tag">{product.category || 'Bestseller'}</span>
                      <button className="fav" aria-label="Add to wishlist"><i className="fa-regular fa-heart"></i></button>
                      <img src={imageUrl} alt={product.name} loading="lazy" />
                    </div>
                    <div className="card-body">
                      <div className="card-title">{product.name}</div>
                      <div className="rating">
                        <i className="fa-solid fa-star" style={{color: 'var(--haldi)'}}></i> 4.8 
                        <span>({(40 + i * 15)} reviews)</span>
                      </div>
                      <div className="price-row">
                        <span className="price">₹{product.price}</span>
                        <span className="mrp">₹{mrp}</span>
                        <span style={{fontSize: '11px', color: 'var(--neem)', fontWeight: '600'}}>{off}% off</span>
                      </div>
                      <div className="stock-bar"><div className="stock-bar-fill" style={{width: `${stockPct}%`}}></div></div>
                      <div className="urgency"><i className="fa-solid fa-fire"></i> Only {stockLeft} left in stock</div>
                      <div className="viewers"><i className="fa-solid fa-eye"></i> {viewers} people viewing this</div>
                      
                      <button className="add-btn">
                        <i className="fa-solid fa-basket-shopping"></i> Add to cart
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="festival" id="festival">
        <h3>Chhath Puja Special is Live</h3>
        <p>Fresh Thekua, made in small batches, packed with prasad-grade purity — order before stock runs out.</p>
        <div style={{
          fontFamily: 'var(--font-mono)', 
          background: 'rgba(0,0,0,.15)', 
          display: 'inline-block', 
          padding: '8px 16px', 
          borderRadius: '6px', 
          marginBottom: '18px', 
          fontSize: '15px', 
          fontWeight: '600'
        }}>
          {formatTime(timeLeft)}
        </div>
        <div>
          <a href="#shop" className="btn btn-primary"><i className="fa-solid fa-bolt"></i> Shop festival specials</a>
        </div>
      </section>

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

      <section className="story" id="story">
        <div className="wrap">
          <img src="https://picsum.photos/seed/artisan-kitchen/600/500" alt="Women artisans preparing Thekua in a Bihar kitchen" />
          <div>
            <div className="eyebrow" style={{color: 'var(--haldi)'}}>Our story</div>
            <h2>From <em>Bihar's kitchens</em><br/>to your doorstep.</h2>
            <p>BiharKaSwaad began in a small kitchen in Kumharar, Patna — where recipes passed down through generations are still followed by hand, one batch at a time.</p>
            <p>Every jar of Sattu, every piece of Thekua, is prepared by women artisans from across Bihar, using pure ghee, freshly milled atta, and zero preservatives.</p>
            <div className="story-sig">— Team BiharKaSwaad</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Testimonials</div>
            <h2>Stories from our customers</h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card">
              <i className="fa-solid fa-quote-left"></i>
              <p>Living far from Bihar, this Thekua brought back the smell of ghee from my mother's kitchen. It genuinely felt like home.</p>
              <div className="testi-who">
                <div className="testi-avatar">SR</div>
                <div><strong>Sunita Rao</strong><span>Bengaluru</span></div>
              </div>
            </div>
            <div className="testi-card">
              <i className="fa-solid fa-quote-left"></i>
              <p>I was skeptical about ordering something so traditional online, but the freshness and packaging completely won me over.</p>
              <div className="testi-who">
                <div className="testi-avatar">AJ</div>
                <div><strong>Alok Jha</strong><span>Mumbai</span></div>
              </div>
            </div>
            <div className="testi-card">
              <i className="fa-solid fa-quote-left"></i>
              <p>Being from Mithila, I know what real Sattu should taste like — this one didn't disappoint at all. Ordering a bigger pack next time.</p>
              <div className="testi-who">
                <div className="testi-avatar">RS</div>
                <div><strong>Dr. Ritu Singh</strong><span>Delhi</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">FAQs</div>
            <h2>Common questions</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item open">
              <button className="faq-q">How fresh are the products when they arrive?<i className="fa-solid fa-chevron-down"></i></button>
              <div className="faq-a"><p>Everything is prepared in small batches only after your order is placed, and shipped within 24-48 hours to keep it as fresh as possible.</p></div>
            </div>
            <div className="faq-item">
              <button className="faq-q">Do you deliver across India?<i className="fa-solid fa-chevron-down"></i></button>
              <div className="faq-a"><p>Yes, we deliver pan-India to over 19,000 pincodes, with free shipping on all orders.</p></div>
            </div>
            <div className="faq-item">
              <button className="faq-q">What is the shelf life of Thekua and Tilkut?<i className="fa-solid fa-chevron-down"></i></button>
              <div className="faq-a"><p>Thekua stays fresh for about 45 days and Tilkut for around 60 days when stored in an airtight container in a cool, dry place.</p></div>
            </div>
          </div>
        </div>
      </section>
      
      <a href="https://wa.me/916201066464" target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Chat on WhatsApp">
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </>
  );
};

export default HomeSection;
