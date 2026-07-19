import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const BottomNav = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  // Cart count
  const cartCount = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', icon: 'fa-house', path: '/' },
    { name: 'Categories', icon: 'fa-table-cells-large', path: '/products' },
    { name: 'Best Seller', icon: 'fa-star', path: '/products?bestseller=true' },
    { name: 'Cart', icon: 'fa-bag-shopping', path: '/cart', badge: cartCount },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-between items-center px-2 py-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname + location.search === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex flex-col items-center justify-center w-1/5 pt-1 pb-1 rounded-lg transition-colors ${isActive ? 'text-green-700' : 'text-gray-500'}`}
              onClick={() => setProfileOpen(false)}
            >
              <div className="relative">
                <i className={`fa-solid ${item.icon} text-xl mb-1`}></i>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Profile Button */}
        <button 
          onClick={() => setProfileOpen(!profileOpen)}
          className={`flex flex-col items-center justify-center w-1/5 pt-1 pb-1 rounded-lg transition-colors relative ${profileOpen ? 'text-green-700' : 'text-gray-500'}`}
        >
          <i className="fa-regular fa-user text-xl mb-1"></i>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>

      {/* Profile Menu Popup */}
      {profileOpen && (
        <div className="md:hidden fixed bottom-[60px] right-4 bg-white shadow-2xl border border-gray-100 rounded-xl z-50 w-48 overflow-hidden transform origin-bottom-right transition-all">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">{isAuthenticated ? user?.name : 'Welcome!'}</p>
          </div>
          {isAuthenticated ? (
            <div className="flex flex-col">
              <Link to="/orders" onClick={() => setProfileOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3">
                <i className="fa-solid fa-box text-gray-400"></i> My Orders
              </Link>
              <Link to="/cart" onClick={() => setProfileOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3">
                <i className="fa-solid fa-bag-shopping text-gray-400"></i> Cart
              </Link>
              {user?.role === 'admin' && (
                <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="px-4 py-3 text-sm text-orange-600 font-semibold hover:bg-orange-50 border-b border-gray-50 flex items-center gap-3">
                  <i className="fa-solid fa-screwdriver-wrench"></i> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-3 w-full">
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              <Link to="/login" onClick={() => setProfileOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50">
                <i className="fa-solid fa-right-to-bracket text-gray-400"></i> Login
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Spacer to prevent content from hiding behind fixed bottom nav */}
      <div className="h-16 md:hidden"></div>
    </>
  );
};

export default BottomNav;
