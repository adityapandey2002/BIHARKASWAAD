import React, { useEffect } from 'react';

const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      q: "What makes BiharKaSwaad products unique?",
      a: "We bring you the authentic taste of Bihar through traditional recipes rooted in rural villages. Our specialty is our traditional, homemade Thekua, crafted with love. Along with it, our Bhuja, Makhana, Pure Mustard Oil, Tilkut, Sattu, pure honey, multigrain flour and traditional pickles are all proudly made by our empowered group of local farmers."
    },
    {
      q: "Are your products freshly made?",
      a: "Yes! We prepare and pack our items in small batches to ensure maximum freshness, hygiene, and authentic flavor before they are shipped out to you."
    },
    {
      q: "How long does it take to process and ship my food order?",
      a: "Standard orders are carefully packaged and processed within 1–2 business days. Once shipped, standard delivery takes 3–7 business days depending on your location across India."
    },
    {
      q: "Do you offer faster delivery options if I need the products urgently?",
      a: "Yes, we offer a fast-tracked Air Shipping option at checkout for quicker delivery. Opting for this premium service adds an additional charge of 70 INR per Kg to your order total."
    },
    {
      q: "What should I do if my food packet arrives damaged or tampered with?",
      a: "Since our products are food items, safety is our priority. If the package appears visibly damaged or opened at delivery, please refuse to accept it from the courier and immediately contact our support team with photographic proof within 24 hours."
    },
    {
      q: "How can I reach out for bulk orders or customer support?",
      a: "For any questions, order updates, or grievance resolution, you can easily reach our team by emailing us directly at biharkaswaadfood@gmail.com or through our website's official contact page."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about our authentic Bihari delicacies.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, index) => (
              <details key={index} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {faq.q}
                  </h2>
                  <span className="relative size-5 shrink-0">
                    <svg
                      className="absolute inset-0 size-5 opacity-100 group-open:opacity-0 transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg
                      className="absolute inset-0 size-5 opacity-0 group-open:opacity-100 transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-gray-600 text-base">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center bg-orange-50 rounded-xl p-8 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <a
            href="mailto:biharkaswaadfood@gmail.com"
            className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all"
          >
            Get in touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
