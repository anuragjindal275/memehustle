import React, { useState, useEffect } from 'react';
import { FaFire, FaClock, FaSearch, FaRandom } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import MemeGrid from '../components/memes/MemeGrid';
import { getMemes, getTopMemes, searchMemes } from '../services/api';
import { socket, joinLeaderboardRoom } from '../utils/socketClient';
import Typewriter from 'typewriter-effect';

const HomePage = () => {
  const [memes, setMemes] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Connect to WebSocket for real-time updates
  useEffect(() => {
    socket.connect();
    joinLeaderboardRoom();
    
    // Listen for meme updates
    socket.on('leaderboard_update', handleLeaderboardUpdate);
    
    return () => {
      socket.off('leaderboard_update', handleLeaderboardUpdate);
    };
  }, []);
  
  // Load memes based on active tab
  useEffect(() => {
    const loadMemes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let loadedMemes;
        
        switch (activeTab) {
          case 'trending':
            loadedMemes = await getTopMemes(12);
            break;
          case 'newest':
            loadedMemes = await getMemes();
            loadedMemes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
          case 'random':
            loadedMemes = await getMemes();
            // Shuffle array for random selection
            for (let i = loadedMemes.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [loadedMemes[i], loadedMemes[j]] = [loadedMemes[j], loadedMemes[i]];
            }
            break;
          default:
            loadedMemes = await getMemes();
        }
        
        setMemes(loadedMemes);
      } catch (err) {
        console.error('Failed to load memes:', err);
        setError('Failed to load memes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (!isSearching) {
      loadMemes();
    }
  }, [activeTab, isSearching]);
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setIsSearching(true);
    
    try {
      const results = await searchMemes(searchQuery);
      setMemes(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };
  
  // Handle real-time leaderboard updates
  const handleLeaderboardUpdate = (updatedMemes) => {
    if (activeTab === 'trending' && !isSearching) {
      setMemes(updatedMemes);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            <span className="text-neon-pink">Meme</span>
            <span className="text-white">Hustle</span>
          </h1>
          <div className="text-xl text-neon-green font-mono h-12 mb-6">
            <Typewriter
              options={{
                strings: [
                  'CYBERPUNK MEME MARKETPLACE',
                  'BID, EARN, REPEAT',
                  'DIGITAL HUSTLE IN NIGHT CITY',
                  'GET RICH OR DIE MEMEING'
                ],
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 30,
              }}
            />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Trade cutting-edge memes on the only cyberpunk meme marketplace with AI-generated content and real-time bidding. The future of meme trading is now.
          </p>
        </motion.div>
        
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memes by title, tags, or vibes..."
                className="w-full bg-cyber-dark border-2 border-neon-blue/50 rounded-full p-3 pl-12 font-mono text-white focus:border-neon-blue focus:outline-none"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neon-blue">
                <FaSearch />
              </span>
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neon-pink hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Tabs Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex bg-cyber-dark rounded-xl p-1">
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'trending'
                  ? 'bg-cyber-black text-neon-pink'
                  : 'text-gray-400 hover:text-neon-blue'
              }`}
              onClick={() => { setActiveTab('trending'); setIsSearching(false); }}
            >
              <FaFire className="mr-2" />
              <span>Trending</span>
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'newest'
                  ? 'bg-cyber-black text-neon-green'
                  : 'text-gray-400 hover:text-neon-blue'
              }`}
              onClick={() => { setActiveTab('newest'); setIsSearching(false); }}
            >
              <FaClock className="mr-2" />
              <span>Newest</span>
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'random'
                  ? 'bg-cyber-black text-neon-yellow'
                  : 'text-gray-400 hover:text-neon-blue'
              }`}
              onClick={() => { setActiveTab('random'); setIsSearching(false); }}
            >
              <FaRandom className="mr-2" />
              <span>Random</span>
            </button>
          </div>
        </div>
        
        {/* Search Results Indicator */}
        {isSearching && (
          <div className="mb-6 text-center">
            <p className="text-neon-blue">
              Search results for: <span className="text-neon-pink">"{searchQuery}"</span>
            </p>
          </div>
        )}
        
        {/* Memes Grid */}
        <MemeGrid memes={memes} loading={loading} error={error} />
      </div>
    </Layout>
  );
};

export default HomePage;
