/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cyberpunk color palette
        'neon-pink': '#FF2A6D',
        'neon-blue': '#01C5FC',
        'neon-green': '#05FFA1',
        'neon-yellow': '#FFFC59',
        'neon-purple': '#C11AFF',
        'cyber-black': '#0D0221',
        'cyber-dark': '#1A1A2E',
        'cyber-gray': '#16213E',
        'cyber-light': '#0F3460',
      },
      fontFamily: {
        'cyber': ['"Share Tech Mono"', 'monospace'],
        'display': ['"Orbitron"', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'flicker': 'flicker 0.5s infinite alternate',
        'terminal-cursor': 'blink 1s steps(2) infinite',
        'neon-pulse': 'neon-pulse 2s infinite',
        'scanline': 'scanlines 1s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-3px, 3px)' },
          '40%': { transform: 'translate(-3px, -3px)' },
          '60%': { transform: 'translate(3px, 3px)' },
          '80%': { transform: 'translate(3px, -3px)' },
          '100%': { transform: 'translate(0)' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '0.99' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        },
        blink: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
        'neon-pulse': {
          '0%': { boxShadow: '0 0 5px #01C5FC, 0 0 10px #01C5FC, 0 0 15px #01C5FC, 0 0 20px #01C5FC' },
          '50%': { boxShadow: '0 0 10px #FF2A6D, 0 0 20px #FF2A6D, 0 0 30px #FF2A6D, 0 0 40px #FF2A6D' },
          '100%': { boxShadow: '0 0 5px #01C5FC, 0 0 10px #01C5FC, 0 0 15px #01C5FC, 0 0 20px #01C5FC' },
        },
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' }
        }
      },
    },
  },
  plugins: [],
};
