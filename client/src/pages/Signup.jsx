import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
      setPasswordError('');
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setPasswordError('Passwords do not match!');
      return;
    }
    dispatch(signupUser({ name: form.name, email: form.email, password: form.password }));
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px 12px 40px',
    border: '1.5px solid var(--border)',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    background: 'var(--paper)',
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--kagzi)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', color: 'var(--indigo)', lineHeight: '1.1' }}>
            BiharKaSwaad
          </div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: '16px', color: 'var(--sindoor)', fontWeight: '600' }}>
            बिहार का स्वाद
          </div>
          <p style={{ marginTop: '10px', color: 'var(--muted)', fontSize: '14px' }}>
            Create your free account and order authentic Bihari food
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px', boxShadow: '0 8px 24px rgba(31,46,74,.08)' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          )}
          {passwordError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
              {passwordError}
            </div>
          )}

          <form onSubmit={submit}>
            {/* Full Name */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--indigo)', marginBottom: '8px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-regular fa-user" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px' }}></i>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Aditya Kumar"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--indigo)', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px' }}></i>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@email.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--indigo)', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle, paddingRight: '40px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--indigo)', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '15px', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Creating Account...</>
              ) : (
                <><i className="fa-solid fa-user-plus"></i> Create Account</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--sindoor)', fontWeight: '600' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          <Link to="/" style={{ color: 'var(--indigo)', fontWeight: '500' }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
