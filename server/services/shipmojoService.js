// server/services/shipmojoService.js

/**
 * Shipmojo API Integration Service
 * This service handles pushing orders to Shipmojo's API.
 * Requires SHIPMOJO_API_KEY in .env
 */

const pushOrderToShipmojo = async (order, cartItems, userEmail = null) => {
  const API_KEY = process.env.SHIPMOJO_API_KEY;

  if (!API_KEY) {
    console.warn('⚠️ SHIPMOJO_API_KEY is missing. Skipping Shipmojo integration for Order ID:', order.id);
    return null;
  }

  try {
    // Map our order data to Shipmojo's required format
    const orderItems = cartItems.map(item => ({
      name: item.product?.name || item.productName || 'BiharKaSwaad Product',
      sku: item.product?.sku || `BKS-${item.productId}`,
      units: item.quantity,
      selling_price: parseFloat(item.price),
    }));

    const payload = {
      order_id: `BKS-${order.id}`,
      order_date: new Date().toISOString(),
      pickup_location: "Primary", // Configure this to match your pickup location name in Shipmojo
      billing_customer_name: order.shippingName,
      billing_last_name: "",
      billing_address: order.shippingAddress,
      billing_city: order.shippingCity,
      billing_pincode: order.shippingPincode,
      billing_state: order.shippingState,
      billing_country: "India",
      billing_email: userEmail || process.env.SMTP_USER || "support@biharkaswaad.in",
      billing_phone: order.shippingPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentStatus === 'pending' || order.paymentStatus === 'failed' ? "COD" : "Prepaid",
      sub_total: parseFloat(order.totalAmount),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1 // Default 1kg
    };

    console.log(`📦 Pushing Order ${order.id} to Shipmojo...`);

    const response = await fetch('https://api.shipmojo.in/v1/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Shipmojo API Error: ${JSON.stringify(data)}`);
    }

    console.log(`✅ Successfully pushed Order ${order.id} to Shipmojo. Response:`, JSON.stringify(data));

    // Store tracking info in the Order record if returned by Shipmojo
    try {
      const trackingKey = data.awb_code || data.tracking_id || data.shipment_id || null;
      const courierName = data.courier_name || data.courier_company_id || null;

      if (trackingKey || courierName) {
        order.trackingKey = trackingKey || order.trackingKey;
        order.courierName = courierName || order.courierName;
        await order.save();
        console.log(`📋 Tracking info saved: AWB=${trackingKey}, Courier=${courierName}`);
      }
    } catch (saveErr) {
      console.error('⚠️ Could not save tracking info to DB:', saveErr.message);
    }

    return data;

  } catch (error) {
    console.error(`❌ Failed to push Order ${order.id} to Shipmojo:`, error.message);
    // We don't want to throw and crash the order completion, just log it.
    return null;
  }
};

module.exports = {
  pushOrderToShipmojo
};
