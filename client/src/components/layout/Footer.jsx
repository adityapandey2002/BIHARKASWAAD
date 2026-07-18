import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="footer-logo">BiharKaSwaad</div>
          <p style={{ fontSize: '13px', maxWidth: '240px' }}>
            The authentic taste of Bihar, delivered fresh to your doorstep — handmade by women artisans across the state.
          </p>
          <p style={{ fontSize: '12px', marginTop: '14px' }}>
            <i className="fa-solid fa-location-dot"></i> Kumharar, Near Kushwaha Panchayat Bhawan, Kumharar Patna Bihar - 80026 IN.
          </p>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="/#story">Our Story</a></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li><Link to="/track-order">Track Order</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/refunds">Refund Policy</Link></li>
            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h4>Stay updated</h4>
          <p style={{ fontSize: '12.5px' }}>Festival offers, seedha aapke inbox mein.</p>
          <div className="newsletter">
            <input type="email" placeholder="you@email.com" />
            <button>Join</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 BiharKaSwaad™. All rights reserved.</span>
        <span>Made with love in Bihar</span>
      </div>
    </footer>
  );
};

export default Footer;
