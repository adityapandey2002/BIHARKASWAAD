import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import MobileNav from './layout/MobileNav';
import CartDrawer from './layout/CartDrawer';

const Layout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header 
        onOpenMobileNav={() => setIsMobileNavOpen(true)} 
        onOpenCart={() => setIsCartOpen(true)} 
      />
      
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)} 
      />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      
      <main>
        <Outlet />
      </main>
      
      <Footer />
    </>
  );
};

export default Layout;
