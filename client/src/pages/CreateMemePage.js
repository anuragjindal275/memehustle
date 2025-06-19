import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaTag, FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { createMeme } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Typewriter from 'typewriter-effect';

const CreateMemePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generateCaption, setGenerateCaption] = useState(true);
  const [generateVibe, setGenerateVibe] = useState(true);
  const [selectedEffect, setSelectedEffect] = useState('none');
  
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
    
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user.isLoggedIn) {
      navigate('/login', { state: { redirectTo: '/create' } });
      return;
    }
    
   
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!imageFile) {
      setError('Please select an image');
      return;
    }
    
    
    const tagList = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    setLoading(true);
    setError(null);
    
    try {
     
      const base64Image = await getBase64(imageFile);
      
   
      const memeData = {
        title: title.trim(),
        image: base64Image,
        tags: tagList,
        owner_id: user.id,
        generate_caption: generateCaption,
        generate_vibe: generateVibe,
        effect: selectedEffect
      };
      
    
      const newMeme = await createMeme(memeData);
      
    
      navigate(`/meme/${newMeme.id}`);
    } catch (err) {
      console.error('Failed to create meme:', err);
      setError('Failed to create meme. Please try again.');
      setLoading(false);
    }
  };
  
  // Cyberpunk visual effect options
  const effects = [
    { id: 'none', name: 'None' },
    { id: 'glitch', name: 'Glitch' },
    { id: 'neon', name: 'Neon Glow' },
    { id: 'scan', name: 'Scanlines' },
    { id: 'pixelate', name: 'Pixelate' }
  ];
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              <span className="text-neon-green">Create</span> a New Meme
            </h1>
            <div className="h-8 text-neon-blue font-mono">
              <Typewriter
                options={{
                  strings: ['UPLOAD YOUR DANKEST CREATION', 'JOIN THE HUSTLE', 'MAKE IT GLITCH'],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                }}
              />
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-cyber-dark border border-neon-blue/30 rounded-lg p-6 shadow-lg">
            {/* Title Field */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-neon-blue mb-2 font-display">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a catchy title..."
                className="w-full bg-cyber-black border-2 border-neon-blue/50 rounded p-3 font-mono text-white focus:border-neon-blue focus:outline-none"
                required
              />
            </div>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label htmlFor="image" className="block text-neon-blue mb-2 font-display">
                Meme Image
              </label>
              <div 
                className={`border-2 border-dashed ${
                  imagePreview ? 'border-neon-green/50' : 'border-neon-blue/50'
                } rounded-lg p-4 text-center`}
              >
                {imagePreview ? (
                  <div className="mb-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className={`mx-auto max-h-64 ${
                        selectedEffect === 'glitch' ? 'animate-glitch' :
                        selectedEffect === 'neon' ? 'neon-glow' :
                        selectedEffect === 'scan' ? 'crt-screen' :
                        selectedEffect === 'pixelate' ? 'pixelate' : ''
                      }`} 
                    />
                  </div>
                ) : (
                  <div className="py-8">
                    <FaImage className="mx-auto text-4xl text-neon-blue/50 mb-2" />
                    <p className="text-gray-400">Click to select or drop your meme image</p>
                  </div>
                )}
                
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="btn-cyber inline-block cursor-pointer"
                >
                  {imagePreview ? 'CHANGE IMAGE' : 'SELECT IMAGE'}
                </label>
              </div>
            </div>
            
           
            <div className="mb-6">
              <label htmlFor="tags" className="block text-neon-blue mb-2 font-display">
                <FaTag className="inline mr-2" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="cyberpunk, funny, hack, glitch..."
                className="w-full bg-cyber-black border-2 border-neon-blue/50 rounded p-3 font-mono text-white focus:border-neon-blue focus:outline-none"
              />
            </div>
            
          
            <div className="mb-6 p-4 border border-neon-yellow/30 rounded bg-cyber-black/50">
              <h3 className="flex items-center text-neon-yellow mb-3 font-display">
                <FaRobot className="mr-2" />
                AI Enhancements
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="generate_caption"
                    checked={generateCaption}
                    onChange={(e) => setGenerateCaption(e.target.checked)}
                    className="w-4 h-4 bg-cyber-black border-neon-yellow text-neon-yellow rounded focus:ring-neon-yellow"
                  />
                  <label htmlFor="generate_caption" className="ml-2 text-white">
                    Generate AI caption
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="generate_vibe"
                    checked={generateVibe}
                    onChange={(e) => setGenerateVibe(e.target.checked)}
                    className="w-4 h-4 bg-cyber-black border-neon-yellow text-neon-yellow rounded focus:ring-neon-yellow"
                  />
                  <label htmlFor="generate_vibe" className="ml-2 text-white">
                    Generate vibe analysis
                  </label>
                </div>
                
                <div>
                  <label htmlFor="effect" className="block text-white mb-2">
                    Apply cyberpunk effect:
                  </label>
                  <select
                    id="effect"
                    value={selectedEffect}
                    onChange={(e) => setSelectedEffect(e.target.value)}
                    className="w-full bg-cyber-black border-2 border-neon-blue/50 rounded p-2 text-white focus:border-neon-blue focus:outline-none"
                  >
                    {effects.map(effect => (
                      <option key={effect.id} value={effect.id}>
                        {effect.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-6 text-neon-pink">
                {error}
              </div>
            )}
            
      
            <div className="flex justify-center">
              <button
                type="submit"
                className="btn-cyber btn-lg"
                disabled={loading || !user.isLoggedIn}
              >
                {loading ? (
                  <>
                    <span className="animate-pulse">UPLOADING</span>
                    <span className="animate-blink">_</span>
                  </>
                ) : (
                  'CREATE MEME'
                )}
              </button>
            </div>
            
            {!user.isLoggedIn && (
              <div className="mt-4 text-center text-gray-400">
                Please <span className="text-neon-blue">login</span> to create a meme
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CreateMemePage;
