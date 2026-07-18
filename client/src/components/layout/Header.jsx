import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useSiteAssets } from '../../context/SiteAssetsContext';

const Header = ({ onOpenMobileNav }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { logoUrl } = useSiteAssets();

  // Cart count from Redux
  const cartCount = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header>
        <div className="topbar wrap">
          <button className="hamburger" aria-label="Open menu" onClick={onOpenMobileNav}>
            <i className="fa-solid fa-bars"></i>
          </button>

          <Link to="/" className="logo flex items-center" style={{ flexDirection: 'row', gap: '10px' }}>
            <img src="https://res.cloudinary.com/kvteudbg/image/upload/v1784116245/BIHARKASWAAD_u86lts.png" alt="Bihar Ka Swaad Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
              BiharKaSwaad<small>बिहार का स्वाद</small>
            </div>
          </Link>

          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>
            <Link to="/blogs">Blogs</Link>
            <a href="/#festival">Festival Specials</a>
            <Link to="/contact">Contact</Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/dashboard" style={{ color: 'var(--sindoor)', fontWeight: '700' }}>
                <i className="fa-solid fa-screwdriver-wrench" style={{ marginRight: '4px' }}></i> Admin
              </Link>
            )}
          </nav>

          <div className="top-actions">
            {/* --- DESKTOP ACTIONS --- */}
            <div className="hidden md:flex items-center gap-5">
              {/* Search */}
              <button className="icon-btn" aria-label="Search" title="Search" onClick={() => setSearchOpen(true)}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="icon-btn" aria-label="Wishlist" title="Wishlist" style={{ position: 'relative' }}>
                <i className="fa-regular fa-heart"></i>
                {wishlistItems && wishlistItems.length > 0 && <span className="cart-count">{wishlistItems.length}</span>}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="icon-btn" aria-label="Cart" title="Cart">
                <i className="fa-solid fa-basket-shopping"></i>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Link to="/orders" className="icon-btn" aria-label="My Orders" title="My Orders">
                    <i className="fa-solid fa-box"></i>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                    title={user?.name || 'Account'}>
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <button onClick={handleLogout} style={{ fontSize: '12.5px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    Logout
                  </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <i className="fa-solid fa-right-to-bracket"></i> Sign In
                </Link>
              )}
            </div>

            {/* --- MOBILE ACTIONS (Dropdown) --- */}
            <div className="flex md:hidden relative items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="icon-btn relative"
                style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}
                aria-label="Profile Menu"
              >
                {isAuthenticated ? (
                  <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--indigo)' }}>{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                ) : (
                  <i className="fa-regular fa-user" style={{ fontSize: '16px' }}></i>
                )}
                {/* Red dot if there are items in cart or wishlist */}
                {(cartCount > 0 || (wishlistItems && wishlistItems.length > 0)) && (
                   <span style={{ position: 'absolute', top: -2, right: -2, width: '12px', height: '12px', background: 'var(--sindoor)', borderRadius: '50%', border: '2px solid #fff' }}></span>
                )}
              </button>

              {mobileMenuOpen && (
                <div className="absolute top-[50px] right-0 bg-white shadow-xl rounded-lg py-2 w-56 z-50 border border-gray-100 flex flex-col" style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="font-bold text-gray-800" style={{ fontSize: '15px' }}>{isAuthenticated ? user?.name : 'Welcome!'}</p>
                    {isAuthenticated && <p className="text-xs text-gray-500 mt-1">{user?.email}</p>}
                  </div>
                  
                  <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }} className="px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700" style={{ fontSize: '14px' }}>
                    <i className="fa-solid fa-magnifying-glass w-5 text-center text-gray-400"></i> Search
                  </button>
                  
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between text-gray-700" style={{ fontSize: '14px' }}>
                    <div className="flex items-center gap-3"><i className="fa-regular fa-heart w-5 text-center text-gray-400"></i> Wishlist</div>
                    {wishlistItems && wishlistItems.length > 0 && <span style={{ background: 'var(--sindoor)' }} className="text-white text-xs font-bold rounded-full px-2 py-0.5">{wishlistItems.length}</span>}
                  </Link>
                  
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between text-gray-700" style={{ fontSize: '14px' }}>
                    <div className="flex items-center gap-3"><i className="fa-solid fa-basket-shopping w-5 text-center text-gray-400"></i> Cart</div>
                    {cartCount > 0 && <span style={{ background: 'var(--sindoor)' }} className="text-white text-xs font-bold rounded-full px-2 py-0.5">{cartCount}</span>}
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700" style={{ fontSize: '14px' }}>
                        <i className="fa-solid fa-box w-5 text-center text-gray-400"></i> My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 font-semibold text-orange-600" style={{ fontSize: '14px' }}>
                          <i className="fa-solid fa-screwdriver-wrench w-5 text-center"></i> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="px-4 py-3 text-left hover:bg-gray-50 text-red-600 flex items-center gap-3" style={{ fontSize: '14px' }}>
                        <i className="fa-solid fa-right-from-bracket w-5 text-center"></i> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 font-semibold" style={{ color: 'var(--sindoor)', fontSize: '14px' }}>
                        <i className="fa-solid fa-right-to-bracket w-5 text-center"></i> Sign In
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="search-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div className="search-panel">
            <form onSubmit={handleSearch} className="search-input-row">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Thekua, Sattu, Tilkut, Achaar..."
                autoFocus
              />
              <button type="button" className="close-search" onClick={() => setSearchOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </form>
            <p style={{ padding: '14px 6px 0', fontSize: '13px', color: 'var(--muted)' }}>
              Press Enter to search or <Link to="/products" onClick={() => setSearchOpen(false)} style={{ color: 'var(--sindoor)', fontWeight: '600' }}>Browse all products →</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
