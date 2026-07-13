import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); dispatch(loginUser(formData)); };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--kagzi)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', color: 'var(--indigo)', lineHeight: '1.1' }}>
            BiharKaSwaad
          </div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: '16px', color: 'var(--sindoor)', fontWeight: '600' }}>
            बिहार का स्वाद
          </div>
          <p style={{ marginTop: '10px', color: 'var(--muted)', fontSize: '14px' }}>
            Sign in to access your account
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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--indigo)', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px' }}></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@email.com"
                  style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '15px', background: 'var(--paper)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--indigo)', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '15px' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  style={{ width: '100%', padding: '12px 40px 12px 40px', border: '1.5px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '15px', background: 'var(--paper)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'var(--sindoor)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '15px', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--muted)' }}>
            New here?{' '}
            <Link to="/signup" style={{ color: 'var(--sindoor)', fontWeight: '600' }}>
              Create an account
            </Link>
          </p>
        </div>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          <Link to="/" style={{ color: 'var(--indigo)', fontWeight: '500' }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
