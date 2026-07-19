import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', marginTop: '40px', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">BiharKaSwaad — Return & Refund Policy</h1>
      
      <div className="text-gray-700 leading-relaxed space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Returns</h2>
          <p>
            Because our food products are perishable, we do not accept returns once an order has been successfully delivered. However, if you receive a product that is damaged, defective, or incorrect, please contact us within 24 hours of delivery for immediate assistance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Refunds</h2>
          <p className="mb-3">Refunds are strictly issued under the following specific conditions:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Damaged or Defective Products:</strong> If your product arrives physically damaged or defective, notify us within 24 hours of delivery.</li>
            <li><strong>Incorrect Items:</strong> If the item received is different from what you ordered, inform us within 24 hours of delivery.</li>
          </ul>
          
          <p className="mb-3">To successfully request a refund, you must provide:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Your official order number.</li>
            <li>A clear, unedited photograph of the product clearly showing the damage or issue.</li>
          </ul>
          
          <p>
            Upon review and approval by our quality team, your refund will be automatically credited back to your original payment method within 5–7 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Non-Refundable Cases</h2>
          <p className="mb-3">Refunds or replacements will not be provided under the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Any claims or complaints made after 24 hours of delivery.</li>
            <li>Products that have been consumed, opened, partially used, or are not in their original delivered packaging.</li>
            <li>Delivery failures or issues resulting from incorrect or incomplete shipping information provided by the customer.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Cancellations</h2>
          <ul className="list-disc pl-6">
            <li>Orders that have already been processed, packed, or dispatched from our facility cannot be canceled under any circumstances.</li>
          </ul>
        </section>

        <section className="bg-orange-50 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Contact Us</h2>
          <p>
            For any questions, order cancellations, or refund requests, please reach out to us immediately at: <a href="mailto:biharkaswaadfood@gmail.com" className="text-orange-600 font-bold hover:underline">biharkaswaadfood@gmail.com</a> or via our official website channel.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
