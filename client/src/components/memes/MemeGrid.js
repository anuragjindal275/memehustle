import React from 'react';
import MemeCard from './MemeCard';
import { motion } from 'framer-motion';

const MemeGrid = ({ memes, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-cyber-dark border border-neon-blue/30 rounded-md overflow-hidden shadow-lg animate-pulse">
            <div className="p-3 flex justify-between items-center border-b border-neon-blue/20">
              <div className="h-6 w-36 bg-cyber-gray rounded"></div>
              <div className="h-4 w-8 bg-cyber-gray rounded"></div>
            </div>
            <div className="aspect-square bg-cyber-gray"></div>
            <div className="p-3 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-12 bg-cyber-gray rounded"></div>
                <div className="h-6 w-12 bg-cyber-gray rounded"></div>
              </div>
              <div className="h-6 w-16 bg-cyber-gray rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-neon-pink text-xl mb-4">Error loading memes</p>
        <p className="text-gray-400">{error}</p>
        <div className="mt-6 inline-block">
          <button 
            className="btn-cyber"
            onClick={() => window.location.reload()}
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  // No memes state
  if (!memes || memes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neon-yellow text-xl mb-4">No memes found</p>
        <p className="text-gray-400">Be the first to create a meme!</p>
      </div>
    );
  }

  // Container animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {memes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </motion.div>
  );
};

export default MemeGrid;
