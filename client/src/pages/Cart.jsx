import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCart, addToCart, removeFromCart, updateQuantity } from '../store/slices/cartSlice';
import { Link } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, isLoading, error } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated]);

  const getImageUrl = (item) => {
    const p = item.product;
    if (!p) return `https://picsum.photos/seed/${item.productId}/120/120`;
    if (p.imageUrl) return p.imageUrl;
    if (p.imagePath) return `${API_BASE}/${p.imagePath}`;
    return `https://picsum.photos/seed/${p.id}/120/120`;
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px 24px', textAlign: 'center' }}>
        <i className="fa-solid fa-basket-shopping" style={{ fontSize: '52px', color: 'var(--border)' }}></i>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--indigo)' }}>Sign in to view your cart</h2>
        <p style={{ color: 'var(--muted)' }}>Please log in to access your shopping cart.</p>
        <Link to="/login" className="btn btn-primary">
          <i className="fa-solid fa-right-to-bracket"></i> Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '36px', color: 'var(--sindoor)' }}></i>
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Loading your cart...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <>
        <div style={{ background: 'var(--indigo)', color: '#fff', padding: '40px 24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '600' }}>Your Cart</h1>
        </div>
        <div className="stitch"></div>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <i className="fa-solid fa-basket-shopping" style={{ fontSize: '64px', color: 'var(--border)', display: 'block', marginBottom: '20px' }}></i>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--indigo)', marginBottom: '12px' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Add some authentic Bihari flavours to get started!</p>
          <Link to="/#shop" className="btn btn-primary">
            <i className="fa-solid fa-bag-shopping"></i> Start Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ background: 'var(--indigo)', color: '#fff', padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '600' }}>
          Your Cart <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', color: 'var(--haldi)' }}>({items.length} items)</span>
        </h1>
      </div>
      <div className="stitch"></div>

      <section className="section">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
          
          {/* Cart Items */}
          <div>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}
            {items.map((item) => {
              const product = item.product || {};
              const price = item.price || product.price || 0;
              const name = item.name || product.name || 'Product';
              const productId = item.productId || product.id;

              return (
                <div key={item.id || productId} style={{
                  display: 'flex', gap: '18px', padding: '20px',
                  background: 'var(--paper)', border: '1px solid var(--border)',
                  borderRadius: '10px', marginBottom: '14px',
                  boxShadow: '0 2px 8px rgba(31,46,74,.04)',
                }}>
                  <img
                    src={getImageUrl(item)}
                    alt={name}
                    style={{ width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover', flexShrink: '0' }}
                  />
                  <div style={{ flex: '1' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '15px', color: 'var(--indigo)', marginBottom: '6px' }}>{name}</h3>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--sindoor)', fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>
                      ₹{price} <span style={{ color: 'var(--muted)', fontWeight: '400', fontSize: '13px' }}>per unit</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId, quantity: item.quantity - 1 }))}
                        disabled={item.quantity <= 1}
                        style={{ width: '30px', height: '30px', border: '1.5px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--paper)', color: 'var(--indigo)', fontSize: '16px' }}
                      >−</button>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '15px', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId, quantity: item.quantity + 1 }))}
                        style={{ width: '30px', height: '30px', border: '1.5px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--paper)', color: 'var(--indigo)', fontSize: '16px' }}
                      >+</button>
                      <button
                        onClick={() => dispatch(removeFromCart({ productId }))}
                        style={{ marginLeft: 'auto', color: 'var(--sindoor)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i>Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: '0' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '17px', color: 'var(--indigo)' }}>
                      ₹{(price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Panel */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'sticky', top: '80px', boxShadow: '0 4px 16px rgba(31,46,74,.06)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--indigo)', marginBottom: '20px', fontWeight: '600' }}>Order Summary</h2>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '20px' }}>
              {items.map((item) => {
                const price = item.price || item.product?.price || 0;
                const name = item.name || item.product?.name || 'Product';
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--ink)' }}>{name} × {item.quantity}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--indigo)', fontWeight: '600' }}>₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: 'var(--muted)' }}>Shipping</span>
                <span style={{ color: 'var(--neem)', fontWeight: '600' }}>FREE</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '16px', marginBottom: '24px' }}>
              <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--indigo)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '20px', color: 'var(--sindoor)' }}>₹{totalAmount?.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              <i className="fa-solid fa-lock"></i> Proceed to Checkout
            </button>

            <Link to="/#shop" style={{ display: 'block', textAlign: 'center', marginTop: '14px', color: 'var(--muted)', fontSize: '13.5px' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '5px' }}></i> Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
