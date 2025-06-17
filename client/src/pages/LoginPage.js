import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import Typewriter from 'typewriter-effect';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, users, loading } = useAuth();
  
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState(null);
  
  // Redirect after login
  const redirectTo = location.state?.redirectTo || '/';
  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    
    try {
      const success = login(selectedUser);
      
      if (success) {
        navigate(redirectTo);
      } else {
        setError('Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              <span className="text-neon-pink">User</span> <span className="text-neon-blue">Login</span>
            </h1>
            <div className="h-8 text-neon-green font-mono">
              <Typewriter
                options={{
                  strings: ['ACCESS GRANTED_', 'ENTER YOUR CREDENTIALS_', 'IDENTIFYING USER_'],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                }}
              />
            </div>
          </div>
          
          {/* Login Form */}
          <div className="bg-cyber-dark border border-neon-blue/30 rounded-lg p-6 shadow-lg">
            <div className="mb-6 border-b border-neon-blue/20 pb-4">
              <div className="flex justify-center">
                <div className="inline-flex items-center bg-cyber-black px-4 py-2 rounded-md">
                  <FaExclamationTriangle className="text-neon-yellow mr-2" />
                  <span className="text-gray-300">DEMO MODE</span>
                </div>
              </div>
              <p className="mt-4 text-center text-gray-400 text-sm">
                This is a demo application. Select any user to login.
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin h-8 w-8 border-t-2 border-b-2 border-neon-blue rounded-full"></div>
                <p className="mt-2 text-neon-blue">Loading users...</p>
              </div>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label htmlFor="user" className="text-neon-blue mb-2 flex items-center">
                    <FaUser className="mr-2" />
                    Select User
                  </label>
                  <select
                    id="user"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-cyber-black border-2 border-neon-blue/50 rounded p-3 font-mono text-white focus:border-neon-blue focus:outline-none"
                    required
                  >
                    <option value="">-- Select a user --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.credits} credits)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="text-neon-blue mb-2 flex items-center">
                    <FaLock className="mr-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Password (any value works)"
                    className="w-full bg-cyber-black border-2 border-neon-blue/50 rounded p-3 font-mono text-white focus:border-neon-blue focus:outline-none"
                  />
                  <p className="mt-1 text-gray-400 text-xs">
                    Any password will work in demo mode
                  </p>
                </div>
                
                {/* Error message */}
                {error && (
                  <div className="mb-6 text-neon-pink">
                    {error}
                  </div>
                )}
                
                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="btn-cyber btn-lg w-full"
                  >
                    LOGIN
                  </button>
                </div>
              </form>
            )}
            
            {/* Fake terminal output for cyberpunk aesthetic */}
            <div className="mt-6 bg-cyber-black p-2 rounded-sm font-mono text-xs text-neon-green overflow-hidden h-24">
              <div className="animate-typing">
                &gt; Connecting to MemeHustle server...
                <br />
                &gt; Establishing secure connection...
                <br />
                &gt; Bypassing Night City firewalls...
                <br />
                &gt; Access point secured. Awaiting credentials...
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LoginPage;
