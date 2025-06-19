import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaDollarSign, FaTag } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { voteOnMeme } from '../../services/api';

const MemeCard = ({ meme, showBidButton = true }) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState({
    upvotes: meme.upvotes || 0,
    downvotes: meme.downvotes || 0
  });
  const [isVoting, setIsVoting] = useState(false);
  const [glitching, setGlitching] = useState(false);

 
  const triggerGlitch = () => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 1000);
  };


  const handleVote = async (voteType) => {
    if (!user.isLoggedIn) return;
    
    setIsVoting(true);
    try {
      const updatedMeme = await voteOnMeme(meme.id, user.id, voteType);
      
      // Update local vote counts
      setVotes({
        upvotes: updatedMeme.upvotes,
        downvotes: updatedMeme.downvotes
      });
      
      
      triggerGlitch();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div 
      className="bg-cyber-dark border border-neon-blue/30 rounded-md overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => Math.random() > 0.7 && triggerGlitch()}
    >
      
      <div className="p-3 flex justify-between items-center border-b border-neon-blue/20">
        <h3 className={`font-display text-lg ${glitching ? 'animate-glitch' : ''}`}>
          {meme.title}
        </h3>
        <div className="flex items-center text-xs">
          <span className="text-neon-yellow mr-1">
            <FaDollarSign className="inline" />
          </span>
          <span>{meme.current_bid || 0}</span>
        </div>
      </div>
      
 
      <Link to={`/meme/${meme.id}`} className="block relative">
        <div 
          className={`aspect-square overflow-hidden crt-screen ${glitching ? 'animate-glitch' : ''}`}
          style={{ background: '#121212' }}
        >
          <img 
            src={meme.image_url} 
            alt={meme.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://picsum.photos/500/500?random=' + meme.id;
            }}
          />
        </div>
        
     
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyber-black/90 to-transparent p-3">
          <p className="text-xs text-neon-pink font-mono">
            {meme.caption || "Loading caption..."}
          </p>
        </div>
      </Link>
      
     
      <div className="p-3 flex justify-between items-center">
      
        <div className="flex items-center space-x-3">
          <button 
            className={`flex items-center space-x-1 ${isVoting ? 'opacity-50' : 'hover:text-neon-green'}`}
            onClick={() => handleVote(true)}
            disabled={isVoting || !user.isLoggedIn}
          >
            <FaArrowUp />
            <span>{votes.upvotes}</span>
          </button>
          <button
            className={`flex items-center space-x-1 ${isVoting ? 'opacity-50' : 'hover:text-neon-pink'}`}
            onClick={() => handleVote(false)}
            disabled={isVoting || !user.isLoggedIn}
          >
            <FaArrowDown />
            <span>{votes.downvotes}</span>
          </button>
        </div>
        
   
        <div className="flex items-center">
          {showBidButton && (
            <Link 
              to={`/meme/${meme.id}`}
              className="btn-cyber py-1 px-3 text-xs"
            >
              BID NOW
            </Link>
          )}
        </div>
      </div>

      <div className="px-3 pb-3 flex flex-wrap gap-1">
        {meme.tags && meme.tags.map((tag, index) => (
          <Link 
            key={index}
            to={`/tags/${tag}`}
            className="inline-flex items-center bg-cyber-black px-2 py-0.5 rounded text-xs text-neon-blue hover:bg-neon-blue hover:text-cyber-black transition-colors"
          >
            <FaTag className="mr-1 text-[0.6rem]" />
            {tag}
          </Link>
        ))}
        {meme.vibe_analysis && (
          <span className="inline-flex items-center bg-cyber-black/50 px-2 py-0.5 rounded text-xs text-neon-yellow">
            {meme.vibe_analysis}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MemeCard;
