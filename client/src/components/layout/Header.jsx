import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Header = ({ onOpenMobileNav }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

          <Link to="/" className="logo">
            BiharKaSwaad<small>बिहार का स्वाद</small>
          </Link>

          <nav className="main-nav">
            <Link to="/products">Shop</Link>
            <a href="/#story">Our Story</a>
            <a href="/#festival">Festival Specials</a>
            <Link to="/contact">Contact</Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/dashboard" style={{ color: 'var(--sindoor)', fontWeight: '700' }}>
                <i className="fa-solid fa-screwdriver-wrench" style={{ marginRight: '4px' }}></i> Admin
              </Link>
            )}
          </nav>

          <div className="top-actions">
            {/* Search */}
            <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <i className="fa-regular fa-heart"></i>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <i className="fa-solid fa-basket-shopping"></i>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                  title={user?.name || 'Account'}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} style={{ fontSize: '12.5px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <i className="fa-solid fa-right-to-bracket"></i> Sign In
              </Link>
            )}
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
