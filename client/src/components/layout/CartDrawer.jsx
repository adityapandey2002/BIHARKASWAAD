import React from 'react';
import { Link } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  // TODO: Use Redux or Context to manage cart items
  const cartItems = [];
  const total = 0;

  return (
    <>
      <div 
        className={`overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      ></div>
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>Your cart</h3>
          <button 
            className="close-drawer" 
            aria-label="Close cart"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="drawer-items">
          {cartItems.length === 0 ? (
            <div className="drawer-empty">
              <i className="fa-solid fa-basket-shopping"></i>
              Your cart is empty.<br/>Add some authentic Bihari flavours.
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div className="drawer-item" key={index}>
                <img src={item.image} alt={item.name} />
                <div className="di-info">
                  <p>{item.name}</p>
                  <div className="di-price">₹{item.price} x {item.quantity}</div>
                  <div className="qty-ctrl">
                    <button>−</button>
                    <span>{item.quantity}</span>
                    <button>+</button>
                  </div>
                  <div className="remove-btn">Remove</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <Link to="/checkout" className="checkout-btn" onClick={onClose}>
              Proceed to checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
