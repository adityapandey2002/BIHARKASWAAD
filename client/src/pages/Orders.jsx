import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/orders/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [API_URL]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', minHeight: '60vh' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '42px', color: 'var(--sindoor)' }}></i>
        <p style={{ marginTop: '20px', color: 'var(--muted)', fontSize: '15px' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="section" style={{ minHeight: '70vh', background: 'var(--paper)', padding: '40px 24px' }}>
      <div className="wrap max-w-4xl mx-auto">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--indigo)', marginBottom: '32px' }}>
          My Orders
        </h1>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '48px', color: 'var(--muted)', marginBottom: '16px' }}></i>
            <h3 style={{ fontSize: '20px', color: 'var(--indigo)', marginBottom: '8px' }}>No orders yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Looks like you haven't placed an order yet.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Order ID</span>
                    <strong style={{ color: 'var(--indigo)' }}>#{order.id}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Date</span>
                    <strong style={{ color: 'var(--indigo)' }}>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Total Amount</span>
                    <strong style={{ color: 'var(--neem)' }}>₹{order.totalAmount}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Status</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '13px', 
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background: order.orderStatus === 'delivered' ? '#ECFDF5' : order.orderStatus === 'shipped' ? '#EFF6FF' : '#FFFBEB',
                      color: order.orderStatus === 'delivered' ? '#059669' : order.orderStatus === 'shipped' ? '#2563EB' : '#D97706'
                    }}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {order.items && order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.product?.imagePath && (
                          <img 
                            src={item.product.imagePath.startsWith('http') ? item.product.imagePath : `${API_URL.replace('/api', '')}/api/media/${item.product.imagePath}`} 
                            alt={item.productName} 
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        )}
                        <div>
                          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--indigo)' }}>{item.productName}</strong>
                          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <strong style={{ color: 'var(--indigo)' }}>₹{item.price}</strong>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    {order.trackingKey ? (
                      <div>
                        <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block' }}>Tracking Info</span>
                        <strong style={{ color: 'var(--indigo)', fontSize: '14px' }}>{order.courierName || 'Courier'}: {order.trackingKey}</strong>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Tracking details will be updated once shipped.</span>
                    )}
                  </div>
                  <Link to={`/track-order?id=${order.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13.5px' }}>
                    Track Package
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
