import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/contacts`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid var(--border)',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '14.5px',
    background: 'var(--paper)',
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const contacts = [
    { icon: 'fa-location-dot', label: 'Address', text: '101 Maurya Apartment, Kumharar, Patna – 800026, Bihar' },
    { icon: 'fa-phone', label: 'WhatsApp / Call', text: '+91 6201066464' },
    { icon: 'fa-envelope', label: 'Email', text: 'support@biharkaswaad.in' },
    { icon: 'fa-clock', label: 'Business Hours', text: 'Mon–Sat: 9 AM – 7 PM\nSunday: 10 AM – 4 PM' },
  ];

  return (
    <>
      {/* Header Banner */}
      <div style={{ background: 'var(--indigo)', color: '#fff', padding: '48px 24px', textAlign: 'center' }}>
        <div className="eyebrow" style={{ color: 'var(--haldi)', marginBottom: '8px' }}>हम यहाँ हैं</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '600', margin: '0 0 10px' }}>
          Contact Us
        </h1>
        <p style={{ color: '#C7CEDC', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
          Have a question, or want to place a bulk order? We'd love to hear from you.
        </p>
      </div>

      <div className="stitch"></div>

      {/* Main Content */}
      <section className="section">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          
          {/* Left: Contact Info */}
          <div>
            <div className="eyebrow" style={{ marginBottom: '8px' }}>Reach us at</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--indigo)', marginBottom: '28px', fontWeight: '600' }}>
              Get in Touch
            </h2>

            {contacts.map(({ icon, label, text }) => (
              <div key={label} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(178,58,46,.1)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: '0',
                }}>
                  <i className={`fa-solid ${icon}`} style={{ color: 'var(--sindoor)', fontSize: '18px' }}></i>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--indigo)', marginBottom: '4px' }}>{label}</strong>
                  <span style={{ fontSize: '14px', color: 'var(--muted)', whiteSpace: 'pre-line' }}>{text}</span>
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/916201066464"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#25D366', color: '#fff', marginTop: '8px', display: 'inline-flex' }}
            >
              <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>

          {/* Right: Form */}
          <div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 20px rgba(31,46,74,.06)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--indigo)', marginBottom: '24px', fontWeight: '600' }}>
                Send a Message
              </h2>

              {success ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '52px', color: 'var(--neem)', marginBottom: '16px', display: 'block' }}></i>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--indigo)', marginBottom: '10px' }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                    We'll get back to you within 24 hours.
                  </p>
                  <button onClick={() => setSuccess(false)} className="btn btn-primary">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                      {error}
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13.5px', color: 'var(--indigo)', marginBottom: '6px' }}>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Aditya Kumar" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13.5px', color: 'var(--indigo)', marginBottom: '6px' }}>Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@email.com" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13.5px', color: 'var(--indigo)', marginBottom: '6px' }}>Phone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit number" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13.5px', color: 'var(--indigo)', marginBottom: '6px' }}>Subject *</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                      <option>General Inquiry</option>
                      <option>Bulk Order</option>
                      <option>Order Issue</option>
                      <option>Shipping Query</option>
                      <option>Feedback</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13.5px', color: 'var(--indigo)', marginBottom: '6px' }}>Message *</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
                      placeholder="Tell us about your inquiry..."
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane"></i> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <div style={{ background: 'var(--indigo)', padding: '4px', textAlign: 'center', color: '#AEB6C7', fontSize: '13px', padding: '14px 24px' }}>
        <i className="fa-solid fa-location-dot" style={{ color: 'var(--haldi)', marginRight: '6px' }}></i>
        101 Maurya Apartment, Kumharar, Patna, Bihar 800026
      </div>
    </>
  );
};

export default Contact;
