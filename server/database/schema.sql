-- Schema for MemeHustle cyberpunk meme marketplace

-- Users table (for mock authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  credits INT NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memes table
CREATE TABLE memes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0,
  owner_id UUID REFERENCES users(id),
  caption TEXT,
  vibe_analysis TEXT,
  current_bid INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  credits INT NOT NULL CHECK (credits > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  vote_type BOOLEAN NOT NULL, -- TRUE for upvote, FALSE for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(meme_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_memes_tags ON memes USING GIN (tags);
CREATE INDEX idx_memes_upvotes ON memes (upvotes DESC);
CREATE INDEX idx_bids_meme_id ON bids (meme_id);
CREATE INDEX idx_votes_meme_id ON votes (meme_id);

-- Sample data for testing
INSERT INTO users (username) VALUES 
  ('cyberpunk420'),
  ('neon_hacker'),
  ('digital_nomad'),
  ('matrix_runner');
