import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MobileNav = ({ isOpen, onClose }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <>
      <div 
        className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      ></div>
      <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-head">
          <Link to="/" className="logo" onClick={onClose}>
            BiharKaSwaad<small>बिहार का स्वाद</small>
          </Link>
          <button 
            className="close-mobile-nav" 
            aria-label="Close menu"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <a href="/#shop" onClick={onClose}>Shop</a>
        <a href="/#story" onClick={onClose}>Our Story</a>
        <a href="/#festival" onClick={onClose}>Festival Specials</a>
        {isAuthenticated && user?.role === 'admin' && (
          <Link to="/dashboard" onClick={onClose} style={{ color: 'var(--sindoor)', fontWeight: '700' }}>Admin Dashboard</Link>
        )}
        <Link to="/contact" onClick={onClose}>Contact</Link>
        <a href="https://wa.me/916201066464" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '8px' }}></i>
          Chat on WhatsApp
        </a>
      </div>
    </>
  );
};

export default MobileNav;
