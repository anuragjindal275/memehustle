import supabase from '../supabaseClient.js';

// User related functions
export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
};

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateUserCredits = async (userId, creditsAmount) => {
  const { data, error } = await supabase
    .from('users')
    .update({ credits: creditsAmount })
    .eq('id', userId)
    .select();
  if (error) throw error;
  return data;
};

// Meme related functions
export const getAllMemes = async () => {
  const { data, error } = await supabase
    .from('memes')
    .select('*, owner:owner_id(id, username)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getMemeById = async (memeId) => {
  const { data, error } = await supabase
    .from('memes')
    .select('*, owner:owner_id(id, username)')
    .eq('id', memeId)
    .single();
  if (error) throw error;
  return data;
};

export const getTopMemes = async (limit = 10) => {
  const { data, error } = await supabase
    .from('memes')
    .select('*, owner:owner_id(id, username)')
    .order('upvotes', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getMemesByTag = async (tag) => {
  const { data, error } = await supabase
    .from('memes')
    .select('*, owner:owner_id(id, username)')
    .contains('tags', [tag]);
  if (error) throw error;
  return data;
};

export const createMeme = async (memeData) => {
  const { data, error } = await supabase
    .from('memes')
    .insert([memeData])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateMeme = async (memeId, memeData) => {
  const { data, error } = await supabase
    .from('memes')
    .update(memeData)
    .eq('id', memeId)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteMeme = async (memeId) => {
  const { error } = await supabase
    .from('memes')
    .delete()
    .eq('id', memeId);
  if (error) throw error;
  return { success: true };
};

export const updateMemeVotes = async (memeId, upvotes, downvotes) => {
  const { data, error } = await supabase
    .from('memes')
    .update({ upvotes, downvotes, updated_at: new Date() })
    .eq('id', memeId)
    .select();
  if (error) throw error;
  return data[0];
};

// Bid related functions
export const getBidsByMemeId = async (memeId) => {
  const { data, error } = await supabase
    .from('bids')
    .select('*, user:user_id(id, username)')
    .eq('meme_id', memeId)
    .order('credits', { ascending: false });
  if (error) throw error;
  return data;
};

export const createBid = async (bidData) => {
  const { data, error } = await supabase
    .from('bids')
    .insert([bidData])
    .select();
  if (error) throw error;
  
  // Update the current highest bid on the meme
  await supabase
    .from('memes')
    .update({ 
      current_bid: bidData.credits,
      updated_at: new Date()
    })
    .eq('id', bidData.meme_id);
    
  return data[0];
};

// Vote related functions
export const voteOnMeme = async (memeId, userId, voteType) => {
  // Check if the user has already voted on this meme
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('meme_id', memeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingVote) {
    // Update the existing vote if it's different
    if (existingVote.vote_type !== voteType) {
      const { error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
      if (error) throw error;
    } else {
      // Remove the vote if clicking the same button again
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id);
      if (error) throw error;
    }
  } else {
    // Create a new vote
    const { error } = await supabase
      .from('votes')
      .insert([{
        meme_id: memeId,
        user_id: userId,
        vote_type: voteType
      }]);
    if (error) throw error;
  }

  // Count the upvotes and downvotes
  const { data: upvotesData } = await supabase
    .from('votes')
    .select('count')
    .eq('meme_id', memeId)
    .eq('vote_type', true)
    .count();

  const { data: downvotesData } = await supabase
    .from('votes')
    .select('count')
    .eq('meme_id', memeId)
    .eq('vote_type', false)
    .count();

  const upvotesCount = upvotesData[0].count || 0;
  const downvotesCount = downvotesData[0].count || 0;

  // Update the meme with the new vote counts
  return updateMemeVotes(memeId, upvotesCount, downvotesCount);
};

// Leaderboard functions
export const getLeaderboard = async (limit = 10) => {
  // Create a cached leaderboard using upvotes - downvotes
  const { data, error } = await supabase
    .from('memes')
    .select('*, owner:owner_id(id, username)')
    .order('upvotes', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

// Search functions
export const searchMemes = async (query) => {
  const { data, error } = await supabase
    .from('memes')
    .select('*, owner:owner_id(id, username)')
    .or(`title.ilike.%${query}%, tags.cs.{${query}}`);
  if (error) throw error;
  return data;
};
