import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-cyber-black">
      <Navbar />
      <main className="flex-grow pt-20 pb-10">
        {children}
      </main>
      <Footer />
      
     
      <div 
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{ 
          background: 'repeating-linear-gradient(transparent 0px, rgba(0, 0, 0, 0.1) 1px, transparent 2px)',
          backgroundSize: '100% 3px',
          animation: 'scanlines 1s linear infinite'
        }}
      ></div>
    </div>
  );
};

export default Layout;
