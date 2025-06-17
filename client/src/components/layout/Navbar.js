import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaFire, FaPlus, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Typewriter from 'typewriter-effect';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  
  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-cyber-dark bg-opacity-80 backdrop-blur-md shadow-lg shadow-neon-blue/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-display font-bold">
              <span className="text-neon-pink">Meme</span>
              <span className="text-neon-blue">Hustle</span>
            </div>
            <div className="hidden md:block h-6 text-xs text-neon-green">
              <Typewriter
                options={{
                  strings: ['CYBERPUNK MEME MARKET', 'TRADE DANK MEMES', 'HODL THE VIBES'],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                }}
              />
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-1 md:space-x-4">
            <Link to="/" className="p-2 text-gray-300 hover:text-neon-blue">
              <FaHome className="text-lg md:text-xl" />
            </Link>
            <Link to="/leaderboard" className="p-2 text-gray-300 hover:text-neon-pink">
              <FaFire className="text-lg md:text-xl" />
            </Link>
            <Link to="/create" className="p-2 text-gray-300 hover:text-neon-green">
              <FaPlus className="text-lg md:text-xl" />
            </Link>
            
            {user.isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile" className="p-2 flex items-center space-x-2">
                  <FaUserCircle className="text-lg md:text-xl text-neon-yellow" />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">{user.username}</span>
                    <span className="text-xs text-neon-yellow">{user.credits} ¢</span>
                  </div>
                </Link>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-neon-pink"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="btn-cyber py-1 px-4 text-sm"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
