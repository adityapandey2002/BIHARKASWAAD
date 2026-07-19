import React from 'react';

const TermsConditions = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', marginTop: '40px', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">BiharKaSwaad — Terms, Conditions & Privacy Policy</h1>
      
      <div className="text-gray-700 leading-relaxed space-y-6">
        <p className="text-lg">
          Welcome to BiharKaSwaad! This document outlines our Terms of Service and Privacy Policy. By using our website or purchasing from us, you agree to these terms.
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">General Info & Acceptance</h2>
          <p>
            BiharKaSwaad manufactures and sells high-quality traditional food items. Browsing this site, subscribing, or placing an order implies full acceptance of these terms and guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Products, Pricing & Orders</h2>
          <p>
            Product descriptions, images, or prices may occasionally have typographical errors. All prices are in INR (₹) and subject to change without notice. We reserve the right to modify prices, limit quantities, or cancel suspicious orders at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Payments & Delivery</h2>
          <p>
            We accept secure digital payments (UPI, Cards, Net Banking) at checkout. You must provide accurate billing and shipping details. Delivery timelines are estimates; BiharKaSwaad is not liable for delays caused by couriers, weather, or holidays.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Returns & Defective Items</h2>
          <p>
            Returns or replacements apply strictly to damaged, defective, expired, or incorrect products. Any damage or delivery issue must be reported to our support team within 24 hours of receipt to qualify for a replacement or refund.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Intellectual Property & Conduct</h2>
          <p>
            All website content including logos, graphics, blogs, brand name and product names is the exclusive property of BiharKaSwaad. Users are prohibited from illegal activities, copying content, or transmitting harmful code and viruses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Liability & Governing Law</h2>
          <p>
            Our total liability for any claim will never exceed the price paid for that specific product. These Terms are governed by Indian laws, and any legal disputes shall fall under the exclusive jurisdiction of the courts in Patna, Bihar.
          </p>
        </section>

        <div className="border-t border-gray-200 my-8"></div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Privacy Policy</h2>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Information We Collect</h2>
          <p>
            We collect essential data to fulfill your orders, including your name, email, delivery address, and phone number. Transactions are processed via secure gateways (we do not store raw banking details), and cookies are used to improve your shopping experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Data Usage & Sharing</h2>
          <p>
            Your data is strictly used to process, ship, and track orders, and send status updates via SMS, Email, or WhatsApp. We never sell or rent your personal data. It is shared exclusively with trusted logistics and payment partners under strict security protocols.
          </p>
        </section>

        <section className="bg-orange-50 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Customer Support & Contact</h2>
          <p>
            For queries, returns, or data questions, contact us at: <a href="mailto:biharkaswaadfood@gmail.com" className="text-orange-600 font-bold hover:underline">biharkaswaadfood@gmail.com</a> or via our official website.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
