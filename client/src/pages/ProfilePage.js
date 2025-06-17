import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaUserCircle, FaDollarSign, FaImage, FaGavel, FaHistory } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import MemeGrid from '../components/memes/MemeGrid';
import { useAuth } from '../context/AuthContext';
import { getMemes } from '../services/api';

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('memes');
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is logged in
  if (!authLoading && !user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Load user's memes
  useEffect(() => {
    const loadUserMemes = async () => {
      if (!user.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get all memes and filter for user's memes
        // In a real app, we'd have a dedicated API endpoint for this
        const allMemes = await getMemes();
        const userMemes = allMemes.filter(meme => meme.owner_id === user.id);
        setMemes(userMemes);
      } catch (err) {
        console.error('Failed to load user memes:', err);
        setError('Failed to load your memes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user.isLoggedIn) {
      loadUserMemes();
    }
  }, [user.id, user.isLoggedIn]);
  
  // Render loading state while auth is being checked
  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin h-8 w-8 border-t-2 border-b-2 border-neon-blue rounded-full"></div>
          <p className="mt-2 text-neon-blue">Loading profile...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          className="bg-cyber-dark border border-neon-blue/30 rounded-lg shadow-lg overflow-hidden mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-24 bg-cyber-black rounded-full border-2 border-neon-blue flex items-center justify-center text-neon-blue">
                <FaUserCircle className="text-5xl" />
              </div>
            </div>
            
            <div className="flex-grow">
              <h1 className="text-3xl font-display mb-2">
                <span className="text-white">{user.username}</span>
              </h1>
              <div className="flex items-center mb-4">
                <span className="bg-neon-yellow/20 text-neon-yellow px-3 py-1 rounded-full flex items-center">
                  <FaDollarSign className="mr-1" />
                  <span className="font-mono">{user.credits}</span>
                  <span className="ml-1 text-xs">CREDITS</span>
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link to="/create" className="btn-cyber py-1 px-4">
                  NEW MEME
                </Link>
                <button className="btn-cyber btn-outline py-1 px-4">
                  ADD CREDITS
                </button>
              </div>
            </div>
          </div>
          
          {/* Profile Tabs */}
          <div className="border-t border-neon-blue/20 bg-cyber-black/50">
            <div className="flex">
              <button
                className={`flex-1 py-3 px-4 flex justify-center items-center ${
                  activeTab === 'memes' 
                    ? 'text-neon-green border-b-2 border-neon-green' 
                    : 'text-gray-400 hover:text-neon-blue'
                }`}
                onClick={() => setActiveTab('memes')}
              >
                <FaImage className="mr-2" />
                <span>My Memes</span>
              </button>
              <button
                className={`flex-1 py-3 px-4 flex justify-center items-center ${
                  activeTab === 'bids' 
                    ? 'text-neon-pink border-b-2 border-neon-pink' 
                    : 'text-gray-400 hover:text-neon-blue'
                }`}
                onClick={() => setActiveTab('bids')}
              >
                <FaGavel className="mr-2" />
                <span>My Bids</span>
              </button>
              <button
                className={`flex-1 py-3 px-4 flex justify-center items-center ${
                  activeTab === 'activity' 
                    ? 'text-neon-yellow border-b-2 border-neon-yellow' 
                    : 'text-gray-400 hover:text-neon-blue'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                <FaHistory className="mr-2" />
                <span>Activity</span>
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'memes' && (
            <div>
              <h2 className="text-xl font-display mb-6 text-neon-green">Your Created Memes</h2>
              {memes.length === 0 && !loading && !error ? (
                <div className="text-center py-12 bg-cyber-dark border border-neon-blue/30 rounded-lg">
                  <FaImage className="text-5xl mx-auto text-gray-600 mb-4" />
                  <p className="text-xl text-gray-400 mb-4">You haven't created any memes yet</p>
                  <Link to="/create" className="btn-cyber">
                    CREATE YOUR FIRST MEME
                  </Link>
                </div>
              ) : (
                <MemeGrid memes={memes} loading={loading} error={error} />
              )}
            </div>
          )}
          
          {activeTab === 'bids' && (
            <div className="text-center py-12 bg-cyber-dark border border-neon-blue/30 rounded-lg">
              <FaGavel className="text-5xl mx-auto text-gray-600 mb-4" />
              <p className="text-xl text-gray-400">Bid history coming soon</p>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="text-center py-12 bg-cyber-dark border border-neon-blue/30 rounded-lg">
              <FaHistory className="text-5xl mx-auto text-gray-600 mb-4" />
              <p className="text-xl text-gray-400">Activity history coming soon</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
