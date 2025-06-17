import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaGavel, FaTag, FaUser, FaDollarSign, FaHistory } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { socket, joinMemeRoom } from '../../utils/socketClient';
import { getMemeById, getBidsByMemeId, createBid, voteOnMeme } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Typewriter from 'typewriter-effect';

const MemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserCredits } = useAuth();
  
  const [meme, setMeme] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidError, setBidError] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  
  // Connect to WebSocket and join meme room for real-time updates
  useEffect(() => {
    if (!id) return;
    
    socket.connect();
    joinMemeRoom(id);
    
    // Listen for bid updates
    socket.on('bid_placed', handleBidUpdate);
    socket.on('vote_update', handleVoteUpdate);
    
    return () => {
      socket.off('bid_placed', handleBidUpdate);
      socket.off('vote_update', handleVoteUpdate);
    };
  }, [id]);
  
  // Load meme data
  useEffect(() => {
    const loadMeme = async () => {
      try {
        setLoading(true);
        const memeData = await getMemeById(id);
        setMeme(memeData);
        
        // Also load bids
        const bidsData = await getBidsByMemeId(id);
        setBids(bidsData);
      } catch (err) {
        console.error('Failed to load meme:', err);
        setError('Failed to load meme data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMeme();
  }, [id]);
  
  // Handle real-time bid updates
  const handleBidUpdate = (newBid) => {
    if (newBid.meme_id === id) {
      setBids(prevBids => [newBid, ...prevBids]);
      setMeme(prevMeme => ({
        ...prevMeme,
        current_bid: newBid.credits
      }));
      triggerGlitch();
    }
  };
  
  // Handle real-time vote updates
  const handleVoteUpdate = (voteData) => {
    if (voteData.id === id) {
      setMeme(prevMeme => ({
        ...prevMeme,
        upvotes: voteData.upvotes,
        downvotes: voteData.downvotes
      }));
      triggerGlitch();
    }
  };
  
  // Trigger glitch effect
  const triggerGlitch = () => {
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 1000);
  };
  
  // Handle bidding
  const handleBid = async (e) => {
    e.preventDefault();
    
    if (!user.isLoggedIn) {
      navigate('/login', { state: { redirectTo: `/meme/${id}` } });
      return;
    }
    
    const bidValue = parseInt(bidAmount);
    setBidError('');
    
    // Validate bid
    if (isNaN(bidValue) || bidValue <= 0) {
      setBidError('Please enter a valid bid amount');
      return;
    }
    
    if (bidValue > user.credits) {
      setBidError('Insufficient credits');
      return;
    }
    
    if (meme.current_bid && bidValue <= meme.current_bid) {
      setBidError('Bid must be higher than current bid');
      return;
    }
    
    // Submit bid
    try {
      setSubmittingBid(true);
      const newBid = await createBid({
        meme_id: id,
        user_id: user.id,
        credits: bidValue
      });
      
      // Update user credits
      updateUserCredits(user.credits - bidValue);
      
      // Clear bid input
      setBidAmount('');
      triggerGlitch();
    } catch (err) {
      console.error('Failed to place bid:', err);
      setBidError('Failed to place bid. Please try again.');
    } finally {
      setSubmittingBid(false);
    }
  };
  
  // Handle voting
  const handleVote = async (voteType) => {
    if (!user.isLoggedIn) {
      navigate('/login', { state: { redirectTo: `/meme/${id}` } });
      return;
    }
    
    try {
      const updatedMeme = await voteOnMeme(id, user.id, voteType);
      setMeme(prevMeme => ({
        ...prevMeme,
        upvotes: updatedMeme.upvotes,
        downvotes: updatedMeme.downvotes
      }));
      triggerGlitch();
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-cyber-dark border border-neon-blue/30 rounded-md shadow-lg p-6 animate-pulse">
          <div className="h-8 w-64 bg-cyber-gray rounded mb-4"></div>
          <div className="aspect-video w-full bg-cyber-gray rounded mb-4"></div>
          <div className="h-6 w-full bg-cyber-gray rounded mb-4"></div>
          <div className="h-24 w-full bg-cyber-gray rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !meme) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-neon-pink text-2xl mb-4">Error</h2>
        <p className="text-gray-400 mb-6">{error || "Failed to load meme"}</p>
        <Link to="/" className="btn-cyber">
          BACK TO HOME
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`bg-cyber-dark border border-neon-blue/30 rounded-md shadow-lg overflow-hidden ${glitchEffect ? 'animate-glitch' : ''}`}>
        {/* Meme Header */}
        <div className="p-6 border-b border-neon-blue/20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              {meme.title}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  className="flex items-center space-x-1 hover:text-neon-green transition-colors"
                  onClick={() => handleVote(true)}
                >
                  <FaArrowUp className="text-xl" />
                  <span>{meme.upvotes}</span>
                </button>
                <button 
                  className="flex items-center space-x-1 hover:text-neon-pink transition-colors"
                  onClick={() => handleVote(false)}
                >
                  <FaArrowDown className="text-xl" />
                  <span>{meme.downvotes}</span>
                </button>
              </div>
              <div className="bg-cyber-gray px-3 py-1 rounded flex items-center">
                <span className="text-neon-yellow">
                  <FaDollarSign className="inline mr-1" />
                </span>
                <span className="font-mono">{meme.current_bid || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Creator info */}
          <div className="mt-2 flex items-center text-sm text-gray-400">
            <FaUser className="mr-1" />
            <span>Created by {meme.owner?.username || 'Anonymous'}</span>
          </div>
          
          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {meme.tags && meme.tags.map((tag, index) => (
              <Link 
                key={index}
                to={`/tags/${tag}`}
                className="inline-flex items-center bg-cyber-black px-2 py-1 rounded text-sm text-neon-blue hover:bg-neon-blue hover:text-cyber-black transition-colors"
              >
                <FaTag className="mr-1 text-xs" />
                {tag}
              </Link>
            ))}
            {meme.vibe_analysis && (
              <span className="inline-flex items-center bg-cyber-black/50 px-2 py-1 rounded text-sm text-neon-yellow">
                {meme.vibe_analysis}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Meme Image */}
          <div className="lg:w-2/3 relative">
            <div className="crt-screen h-full">
              <img 
                src={meme.image_url} 
                alt={meme.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://picsum.photos/800/600?random=${meme.id}`;
                }}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyber-black/90 to-transparent p-4">
              <div className="text-neon-pink font-mono h-10 overflow-hidden">
                <Typewriter
                  options={{
                    strings: [meme.caption || "Error: Caption not found.exe"],
                    autoStart: true,
                    loop: true,
                    delay: 40,
                    deleteSpeed: 20,
                    pauseFor: 3000,
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Bidding Panel */}
          <div className="lg:w-1/3 border-t lg:border-l lg:border-t-0 border-neon-blue/20 bg-cyber-black/30">
            <div className="p-6">
              <h3 className="font-display text-xl mb-4 flex items-center">
                <FaGavel className="mr-2 text-neon-green" />
                <span>Place your bid</span>
              </h3>
              
              {/* Bid form */}
              <form onSubmit={handleBid} className="mb-6">
                <div className="flex items-center">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min bid: ${(meme.current_bid || 0) + 1}`}
                      className="w-full bg-cyber-dark border-2 border-neon-blue/50 rounded p-2 pl-8 font-mono text-neon-yellow focus:border-neon-blue focus:outline-none"
                      min={(meme.current_bid || 0) + 1}
                      disabled={!user.isLoggedIn || submittingBid}
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neon-yellow">
                      <FaDollarSign />
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="btn-cyber ml-2"
                    disabled={!user.isLoggedIn || submittingBid}
                  >
                    {submittingBid ? 'BIDDING...' : 'BID'}
                  </button>
                </div>
                
                {bidError && (
                  <div className="mt-2 text-neon-pink text-sm">{bidError}</div>
                )}
                
                {user.isLoggedIn && (
                  <div className="mt-2 text-gray-400 text-sm">
                    Your credits: <span className="text-neon-yellow">{user.credits}</span>
                  </div>
                )}
                
                {!user.isLoggedIn && (
                  <div className="mt-2 text-gray-400 text-sm">
                    <Link to="/login" className="text-neon-blue hover:underline">
                      Login to place a bid
                    </Link>
                  </div>
                )}
              </form>
              
              {/* Bid history */}
              <div>
                <h4 className="font-display text-lg mb-3 flex items-center">
                  <FaHistory className="mr-2 text-neon-blue" />
                  <span>Bid History</span>
                </h4>
                
                {bids.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {bids.map((bid, index) => (
                      <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-cyber-dark border border-neon-blue/20 rounded p-2 flex justify-between items-center"
                      >
                        <div className="text-sm">
                          <span className="text-neon-green">{bid.user?.username || 'Anonymous'}</span>
                        </div>
                        <div className="font-mono text-neon-yellow">
                          <FaDollarSign className="inline mr-0.5" />
                          {bid.credits}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No bids yet. Be the first to bid!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeDetail;
