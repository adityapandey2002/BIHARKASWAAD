import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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
  }, []);

  const openReviewModal = (item) => {
    setReviewProduct(item);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewProduct) return;
    setReviewSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/reviews`, {
        productId: reviewProduct.productId,
        rating: reviewRating,
        comment: reviewComment
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Review submitted successfully!');
      setReviewModalOpen(false);
    } catch (err) {
      alert('Failed to submit review: ' + (err.response?.data?.message || err.message));
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return (
      <div style={{ textAlign: 'center', padding: '120px 24px', minHeight: '60vh' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '42px', color: 'var(--sindoor)' }}></i>
        <p style={{ marginTop: '20px', color: 'var(--muted)', fontSize: '15px' }}>Loading your orders...</p>
      </div>
    );

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <strong style={{ color: 'var(--indigo)' }}>₹{item.price}</strong>
                        {order.orderStatus === 'delivered' && (
                          <button 
                            onClick={() => openReviewModal(item)}
                            className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 rounded text-xs font-semibold transition"
                          >
                            Write Review
                          </button>
                        )}
                      </div>
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

      {reviewModalOpen && reviewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Write a Review</h2>
            <p className="text-sm text-gray-500 mb-6">For {reviewProduct.productName}</p>
            
            <form onSubmit={submitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-2xl focus:outline-none"
                    >
                      <i className={`fa-${star <= reviewRating ? 'solid' : 'regular'} fa-star text-yellow-400 hover:scale-110 transition-transform`}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment (Optional)</label>
                <textarea 
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike about this product?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={reviewSubmitting}
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition duration-200 disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
