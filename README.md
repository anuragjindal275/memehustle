# MemeHustle – SDE1 Assignment | CityMall

**Live Site**: [https://memehustle-1.onrender.com](https://memehustle-1.onrender.com)

MemeHustle is a cyberpunk-style meme marketplace where users can upload memes, bid on them using virtual credits, and upvote/downvote their favorites. Each meme gets an AI-generated caption and a unique vibe tag using Google’s Gemini API.

---

## How I Built It

I built this project in ~9–10 hours. Here's how I divided my time:

### First 2 hours
- Set up the MERN stack (React, Node, Express, Supabase)
- Created folder structure and connected the database

### Next 2 hours
- Developed backend routes for meme upload, voting, and bidding
- Integrated Socket.io for real-time updates on bids and votes

### Then 2 more hours
- Integrated Gemini API for generating captions and vibe analysis
- Added caching and fallback logic to handle API timeouts or failures

### Last 3–4 hours
- Built frontend with React and Tailwind CSS
- Designed the cyberpunk UI with glitch effects and terminal-style animations
- Connected everything and tested key flows: upload, bid, vote, leaderboard

---

## Windsurf Experience

I used Windsurf to move faster and stay focused on the creative parts of the project.

Instead of writing everything from scratch, I used Windsurf to:

- Generate Express routes with WebSocket logic
- Fix vote-counting logic and Supabase schema mismatches
- Style components with glitchy, cyberpunk-inspired UI
- Handle Gemini API errors with smart fallback utilities

It helped keep my flow intact and made the overall process feel like fast, vibe-based coding exactly what you'd want during a hackathon.

---

## Features I Built

- Meme creation form (image URL + title + tags)
- AI-generated captions and vibe tags using Gemini
- Real-time bidding with virtual credits (via WebSocket)
- Upvote/downvote system with live leaderboard
- Neon/glitch-themed responsive UI (works on mobile & desktop)

---

## Challenges I Faced

- **Gemini API timeouts**  
  → Solved using in-memory caching and fallback captions

- **WebSocket connection drops**  
  → Handled with reconnect logic and state sync

- **Supabase schema mismatches**  
  → Adjusted frontend to work with flexible fields

- **Frontend bugs in vote rendering**  
  → Debugged JSX issues and cleaned up component logic

---

## What I'd Add With More Time

- Proper login/signup with user accounts  
- Auction-style bidding with countdown timers  
- AI-generated meme images  
- Advanced glitch and animation effects

---

## Final Thoughts

I had a lot of fun building MemeHustle. It genuinely felt like coding in a neon-lit alleyway with synthwave music in the background, running on 5 cups of coffee and adrenaline.

**Built with ❤️ in Gurgaon (and 5 cups of coffee) haha.**
