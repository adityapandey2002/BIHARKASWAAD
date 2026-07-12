import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onOpenMobileNav, onOpenCart }) => {
  // TODO: Get cart count from Redux/Context
  const cartCount = 0;

  return (
    <header>
      <div className="topbar wrap">
        <button 
          className="hamburger" 
          aria-label="Open menu"
          onClick={onOpenMobileNav}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        
        <Link to="/" className="logo">
          BiharKaSwaad<small>बिहार का स्वाद</small>
        </Link>
        
        <nav className="main-nav">
          <a href="/#shop">Shop</a>
          <a href="/#story">Our Story</a>
          <a href="/#festival">Festival Specials</a>
          <Link to="/dashboard">Admin</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        
        <div className="top-actions">
          <button className="icon-btn" aria-label="Search">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <i className="fa-regular fa-heart"></i>
          </Link>
          <button 
            className="icon-btn" 
            aria-label="Cart"
            onClick={onOpenCart}
          >
            <i className="fa-solid fa-basket-shopping"></i>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
