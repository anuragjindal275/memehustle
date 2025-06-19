import React, { useState, useEffect } from 'react';
import { FaTrophy, FaArrowUp, FaArrowDown, FaDollarSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { getTopMemes } from '../services/api';
import { socket, joinLeaderboardRoom } from '../utils/socketClient';

const LeaderboardPage = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Connect to WebSocket for real-time updates
  useEffect(() => {
    socket.connect();
    joinLeaderboardRoom();
    
    
    socket.on('leaderboard_update', handleLeaderboardUpdate);
    
    return () => {
      socket.off('leaderboard_update', handleLeaderboardUpdate);
    };
  }, []);
  
  // Load top memes
  useEffect(() => {
    const loadTopMemes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const topMemes = await getTopMemes(20);
        setMemes(topMemes);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTopMemes();
  }, []);
  
  // Handle real-time leaderboard updates
  const handleLeaderboardUpdate = (updatedMemes) => {
    setMemes(updatedMemes);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  
  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return <span className="text-yellow-400"><FaTrophy /></span>;
      case 1:
        return <span className="text-gray-400"><FaTrophy /></span>;
      case 2:
        return <span className="text-amber-700"><FaTrophy /></span>;
      default:
        return <span className="text-gray-600">{index + 1}</span>;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-neon-yellow">Leaderboard</span>
          </h1>
          <p className="text-gray-400">
            The most popular memes in the cyberpunk wasteland
          </p>
        </motion.div>
        
        {/* Leaderboard Table */}
        {loading ? (
          <div className="bg-cyber-dark border border-neon-blue/30 rounded-lg overflow-hidden animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="border-b border-neon-blue/10 p-4 flex items-center">
                <div className="w-10 h-10 bg-cyber-gray rounded-full mr-4"></div>
                <div className="flex-grow">
                  <div className="h-6 w-64 bg-cyber-gray rounded mb-2"></div>
                  <div className="h-4 w-40 bg-cyber-gray rounded"></div>
                </div>
                <div className="h-8 w-20 bg-cyber-gray rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-neon-pink text-xl mb-4">Error</p>
            <p className="text-gray-400">{error}</p>
            <button 
              className="btn-cyber mt-6"
              onClick={() => window.location.reload()}
            >
              RETRY
            </button>
          </div>
        ) : (
          <motion.div 
            className="bg-cyber-dark border border-neon-blue/30 rounded-lg overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Table Header */}
            <div className="bg-cyber-black p-4 grid grid-cols-12 text-sm text-gray-400">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-2 text-center">Preview</div>
              <div className="col-span-4">Meme</div>
              <div className="col-span-2 text-center">Votes</div>
              <div className="col-span-2 text-center">Bid</div>
              <div className="col-span-1 text-center">Action</div>
            </div>
            
            {/* Table Body */}
            {memes.map((meme, index) => (
              <motion.div 
                key={meme.id}
                className={`border-b border-neon-blue/10 p-2 grid grid-cols-12 items-center ${
                  index < 3 ? 'bg-cyber-black/40' : ''
                }`}
                variants={itemVariants}
              >
                {/* Rank */}
                <div className="col-span-1 text-2xl font-display text-center">
                  {getRankBadge(index)}
                </div>
                
                {/* Preview */}
                <div className="col-span-2 flex justify-center">
                  <div className="w-16 h-16 overflow-hidden rounded">
                    <img 
                      src={meme.image_url} 
                      alt={meme.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://picsum.photos/100/100?random=${meme.id}`;
                      }}
                    />
                  </div>
                </div>
                
                {/* Meme Info */}
                <div className="col-span-4">
                  <div className="font-medium text-white truncate" title={meme.title}>
                    {meme.title}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    by {meme.owner?.username || 'Anonymous'}
                  </div>
                  {meme.vibe_analysis && (
                    <div className="mt-1">
                      <span className="bg-cyber-black px-2 py-0.5 rounded-full text-xs text-neon-yellow">
                        {meme.vibe_analysis}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Vote Count */}
                <div className="col-span-2 flex items-center justify-center space-x-4">
                  <div className="flex items-center text-neon-green">
                    <FaArrowUp className="mr-1" />
                    <span>{meme.upvotes || 0}</span>
                  </div>
                  <div className="flex items-center text-neon-pink">
                    <FaArrowDown className="mr-1" />
                    <span>{meme.downvotes || 0}</span>
                  </div>
                </div>
                
                {/* Bid Amount */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center bg-cyber-black/50 px-3 py-1 rounded">
                    <FaDollarSign className="text-neon-yellow" />
                    <span className="font-mono">{meme.current_bid || 0}</span>
                  </div>
                </div>
                
                {/* Action */}
                <div className="col-span-1 text-center">
                  <Link 
                    to={`/meme/${meme.id}`}
                    className="btn-cyber py-1 px-2 text-xs"
                  >
                    BID
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {!loading && !error && memes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neon-yellow text-xl mb-4">No memes found</p>
            <p className="text-gray-400">Be the first to create a meme!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
