import React from 'react';
import { FaGithub, FaCode } from 'react-icons/fa';
import { GiCircuitry } from 'react-icons/gi';

const Footer = () => {
  return (
    <footer className="bg-cyber-dark mt-auto py-6 border-t border-neon-blue/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <GiCircuitry className="text-neon-blue text-xl mr-2" />
            <span className="text-neon-pink font-display">Meme</span>
            <span className="text-neon-blue font-display">Hustle</span>
          </div>
          
          <div className="text-xs text-center md:text-right">
            <p className="text-gray-400">
              <span className="text-neon-green">&lt;/&gt;</span> with 
              <span className="text-neon-pink"> hackathon chaos</span> in 
              <span className="text-neon-yellow"> Night City</span>
            </p>
            <div className="flex items-center justify-center md:justify-end space-x-4 mt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-neon-blue"
              >
                <FaGithub className="inline mr-1" /> Repository
              </a>
              <a 
                href="/" 
                className="text-gray-400 hover:text-neon-pink"
              >
                <FaCode className="inline mr-1" /> API Docs
              </a>
            </div>
          </div>
        </div>
        
        {/* Fake binary code for cyberpunk aesthetics */}
        <div className="mt-4 overflow-hidden h-6">
          <div className="text-[8px] font-mono text-green-500/20 animate-marquee whitespace-nowrap">
            01001101 01100101 01101101 01100101 01001000 01110101 01110011 01110100 01101100 01100101 00100000 01000011 01111001 01100010 01100101 01110010 01110000 01110101 01101110 01101011 00100000 01001101 01100101 01101101 01100101 00100000 01001101 01100001 01110010 01101011 01100101 01110100 01110000 01101100 01100001 01100011 01100101 00100000 00110010 00110000 00110010 00110101
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
