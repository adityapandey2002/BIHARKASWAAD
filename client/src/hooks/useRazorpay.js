import { useEffect, useRef } from 'react';

export const useRazorpay = () => {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // If already loaded globally, skip
    if (window.Razorpay) {
      scriptLoadedRef.current = true;
      return;
    }

    // If script tag already exists, don't add another
    if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
    };
    document.body.appendChild(script);
    // No cleanup — keep script alive for the entire session
  }, []);

  const openRazorpay = (options) => {
    const tryOpen = (attempts = 0) => {
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (attempts < 20) {
        // Retry every 250ms for up to 5 seconds
        setTimeout(() => tryOpen(attempts + 1), 250);
      } else {
        alert('❌ Razorpay payment gateway could not load. Please refresh the page and try again.');
      }
    };
    tryOpen();
  };

  return { openRazorpay };
};
