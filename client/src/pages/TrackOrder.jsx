import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  useEffect(() => {
    if (initialId) {
      handleTrackOrder(null, initialId);
    }
  }, [initialId]);

  const handleTrackOrder = async (e, forcedId = null) => {
    if (e) e.preventDefault();
    const targetId = forcedId || orderId;
    if (!targetId || !targetId.trim()) return;

    setIsLoading(true);
    setTrackingInfo(null);

    try {
      const { data } = await axios.get(`${API_URL}/orders/track/${targetId}`);
      const order = data.data;

      // Transform backend order to tracking info shape
      const info = {
        orderId: order.id,
        status: order.orderStatus,
        estimatedDelivery: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Pending calculation',
        trackingNumber: order.trackingKey || 'Pending tracking update',
        courierName: order.courierName || 'Courier',
        timeline: [
          { status: 'Order Placed', date: new Date(order.createdAt).toLocaleDateString(), description: 'Your order has been placed successfully', completed: true },
          { status: 'Processing', date: '', description: 'Your order is being prepared', completed: ['processing', 'shipped', 'delivered'].includes(order.orderStatus) },
          { status: 'Shipped', date: '', description: 'Your order has been shipped', completed: ['shipped', 'delivered'].includes(order.orderStatus) },
          { status: 'Delivered', date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : '', description: 'Your order has been delivered', completed: order.orderStatus === 'delivered' }
        ],
        items: (order.items || []).map(item => ({ name: item.productName, quantity: item.quantity, price: item.price })),
        shippingAddress: {
          name: order.shippingName,
          address: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          pincode: order.shippingPincode,
          phone: order.shippingPhone
        }
      };
      setTrackingInfo(info);
    } catch (err) {
      setTrackingInfo({ error: err.response?.data?.message || 'Order not found. Please check your order ID.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed':
      case 'Processing':
        return 'bg-blue-500';
      case 'Shipped':
        return 'bg-yellow-500';
      case 'In Transit':
        return 'bg-purple-500';
      case 'Delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-xl text-gray-600">Enter your order ID to track your package</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <form onSubmit={handleTrackOrder} className="max-w-md mx-auto">
          <div className="mb-6">
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID (e.g., BKS123456789)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>
      </div>

      {/* Tracking Results */}
      {trackingInfo && (
        <div className="space-y-8">
          {trackingInfo.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Order Not Found</h3>
              <p className="text-red-600">{trackingInfo.error}</p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order #{trackingInfo.orderId}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(trackingInfo.status)}`}>
                    {trackingInfo.status}
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tracking Info ({trackingInfo.courierName}):</span>
                    <p className="font-medium">{trackingInfo.trackingNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <p className="font-medium">{trackingInfo.estimatedDelivery}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Items:</span>
                    <p className="font-medium">{trackingInfo.items.length}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
                <div className="space-y-4">
                  {trackingInfo.timeline.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`w-4 h-4 rounded-full mt-1 mr-4 ${step.completed ? getStatusColor(step.status) : 'bg-gray-300'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.status}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {step.date}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {trackingInfo.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{trackingInfo.shippingAddress.name}</p>
                  <p>{trackingInfo.shippingAddress.address}</p>
                  <p>{trackingInfo.shippingAddress.city}, {trackingInfo.shippingAddress.state} {trackingInfo.shippingAddress.pincode}</p>
                  <p>Phone: {trackingInfo.shippingAddress.phone}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <p className="text-gray-600 mb-6">
          Can't find your order or having trouble tracking? We're here to help!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200">
            Contact Support
          </button>
          <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200">
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
