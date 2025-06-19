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
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // If no memes found, return empty array
    if (!data || data.length === 0) return [];
    
    // Manually fetch user info for each meme
    const memesWithOwners = await Promise.all(
      data.map(async (meme) => {
        if (meme.owner_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .eq('id', meme.owner_id)
            .single();
          
          if (!userError && userData) {
            return { ...meme, owner: userData };
          }
        }
        return meme;
      })
    );
    
    return memesWithOwners;
  } catch (error) {
    console.error('Error in getAllMemes:', error);
    return [];
  }
};

export const getMemeById = async (memeId) => {
  try {
    console.log(`Fetching meme with ID ${memeId}`);
    
    // Try fetching the meme with standard approach
    let { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('id', memeId)
      .single();
      
    if (error) {
      console.error(`Error fetching meme by ID ${memeId}:`, error);
      
      // Try a simpler version in case of schema mismatch
      try {
        const { data: retryData, error: retryError } = await supabase
          .from('memes')
          .select('id, title, image_url, tags, owner_id, upvotes, downvotes, current_bid, created_at')
          .eq('id', memeId)
          .single();
          
        if (!retryError && retryData) {
          console.log(`Successfully fetched meme ${memeId} with retry approach`);
          data = retryData;
          error = null;
        }
      } catch (retryError) {
        console.error(`Retry attempt for meme ${memeId} failed:`, retryError);
      }
    }
    
    if (error || !data) {
      console.error(`Failed to fetch meme with ID ${memeId}`);
      return null;
    }
    
    // Get owner info separately if we have an owner_id
    if (data.owner_id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', data.owner_id)
        .single();
      
      if (!userError && userData) {
        data.owner = userData;
      }
    }

    // Add default caption if one doesn't exist
    if (!data.caption) {
      const defaultCaptions = [
        "A wild meme appears!",
        "Worth a thousand words... and maybe some credits.",
        "This meme speaks for itself.",
        "Caption loading... (just kidding, enjoy the meme!)",
        "Sometimes the best caption is no caption."
      ];
      data.caption = defaultCaptions[Math.floor(Math.random() * defaultCaptions.length)];
      console.log(`Added default caption to meme ${memeId}:`, data.caption);
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error fetching meme ${memeId}:`, error);
    return { id: memeId, title: 'Unavailable Meme', caption: 'Could not load meme data', error: true };
  }
}

export const getTopMemes = async (limit = 10) => {
  try {
    // First, get the memes without the join
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // If no memes found, return empty array
    if (!data || data.length === 0) return [];
    
    // Manually fetch user info for each meme
    const memesWithOwners = await Promise.all(
      data.map(async (meme) => {
        if (meme.owner_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .eq('id', meme.owner_id)
            .single();
          
          if (!userError && userData) {
            return { ...meme, owner: userData };
          }
        }
        return meme;
      })
    );
    
    return memesWithOwners;
  } catch (error) {
    console.error('Error in getTopMemes:', error);
    return [];
  }
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
  try {
    console.log(`Getting bids for meme: ${memeId}`);
    let bidsData;
    
    try {
      // Try to fetch bids with standard query
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('meme_id', memeId);
      
      if (error) throw error;
      bidsData = data;
    } catch (e) {
      console.warn('Initial bid fetch failed, trying alternative:', e);
      // If first approach fails, try with a simplified query
      const { data, error } = await supabase
        .from('bids')
        .select()  // Just select all
        .eq('meme_id', memeId);
      
      if (error) {
        console.error('Alternative bid fetch also failed:', error);
        throw error;
      }
      bidsData = data;
    }
    
    if (!bidsData || bidsData.length === 0) {
      console.log(`No bids found for meme ${memeId}`);
      return [];
    }
    
    // Manually fetch user information for each bid
    const bidsWithUsers = await Promise.all(
      bidsData.map(async (bid) => {
        // Handle different column names (user_id or bidder_id)
        const userId = bid.user_id || bid.bidder_id;
        if (userId) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, username')
              .eq('id', userId)
              .single();
            
            if (!userError && userData) {
              return { ...bid, user: userData };
            }
          } catch (userFetchError) {
            console.warn(`Failed to fetch user info for bid user ${userId}:`, userFetchError);
            // Return bid without user info rather than failing
          }
        }
        return bid;
      })
    );
    
    return bidsWithUsers;
  } catch (error) {
    console.error('Error in getBidsByMemeId:', error);
    return [];
  }
};

export const createBid = async (bidData) => {
  try {
    console.log(`Creating bid for meme ${bidData.meme_id} by user ${bidData.user_id} with amount ${bidData.credits}`);
    
    // Figure out which column names are used in the actual DB schema
    let bidAmountField = 'amount'; // Default alternative
    let userIdField = 'user_id'; // Default
    
    try {
      // Check different possible column names
      // First check if credits exists
      const creditsCheckResult = await supabase.from('bids').select('credits').limit(1);
      if (!creditsCheckResult.error) {
        bidAmountField = 'credits';
        console.log('Using credits field for bid amount');
      } else {
        console.log('Credits field not found, trying alternatives');
        // Try amount
        const amountCheckResult = await supabase.from('bids').select('amount').limit(1);
        if (!amountCheckResult.error) {
          bidAmountField = 'amount';
          console.log('Using amount field for bid amount');
        } else {
          // Try bid_amount
          const bidAmountCheckResult = await supabase.from('bids').select('bid_amount').limit(1);
          if (!bidAmountCheckResult.error) {
            bidAmountField = 'bid_amount';
            console.log('Using bid_amount field for bid amount');
          }
        }
      }
      
      // Check user_id vs bidder_id
      const userIdCheckResult = await supabase.from('bids').select('user_id').limit(1);
      if (!userIdCheckResult.error) {
        userIdField = 'user_id';
        console.log('Using user_id field for bidder');
      } else {
        // Try bidder_id
        const bidderIdCheckResult = await supabase.from('bids').select('bidder_id').limit(1);
        if (!bidderIdCheckResult.error) {
          userIdField = 'bidder_id';
          console.log('Using bidder_id field for bidder');
        }
      }
    } catch (schemaError) {
      console.warn('Error checking schema columns:', schemaError);
      // Proceed with defaults
    }
    
    // Create a sanitized bid data object with the correct field names
    const sanitizedBidData = {
      meme_id: bidData.meme_id
    };
    
    // Set the bid amount using the discovered field name
    sanitizedBidData[bidAmountField] = bidData.credits;
    
    // Set the user ID using the discovered field name
    sanitizedBidData[userIdField] = bidData.user_id;
    
    console.log('Inserting bid with data:', JSON.stringify(sanitizedBidData, null, 2));
    
    // Insert the bid
    const { data, error } = await supabase
      .from('bids')
      .insert([sanitizedBidData])
      .select();
    
    if (error) throw error;
    console.log('Bid created successfully:', data[0]);
    
    try {
      // Try to update the highest bid on the meme
      await supabase
        .from('memes')
        .update({ current_bid: bidData.credits })
        .eq('id', bidData.meme_id);
    } catch (updateError) {
      console.warn('Could not update current_bid on meme, but bid was created:', updateError);
    }
    
    return data[0];
  } catch (error) {
    console.error('Error in createBid:', error);
    throw error;
  }
};

// Vote related functions - SIMPLIFIED VERSION that bypasses the votes table
export const voteOnMeme = async (memeId, userId, voteType) => {
  try {
    console.log(`Attempting to vote on meme ${memeId} by user ${userId} with vote type ${voteType}`);
    
    // Get the current meme data first
    const { data: memeData, error: memeError } = await supabase
      .from('memes')
      .select('*')
      .eq('id', memeId)
      .single();
      
    if (memeError) {
      console.error('Error fetching meme to vote on:', memeError);
      throw memeError;
    }
    
    if (!memeData) {
      throw new Error(`Meme with ID ${memeId} not found`);
    }
    
    // Store the current vote counts
    let { upvotes = 0, downvotes = 0 } = memeData;
    
    // Track whether the user has a vote in session storage (simulating a vote table)
    // This is just for UX so votes appear to stick during the session
    // We'll use client-side JS to handle this in the actual app
    
    if (voteType === true) {
      // User is upvoting
      upvotes++;
      console.log(`Incrementing upvotes to ${upvotes}`);
    } else {
      // User is downvoting
      downvotes++;
      console.log(`Incrementing downvotes to ${downvotes}`);
    }
    
    // Update the meme with new vote counts directly
    const { data: updatedMeme, error: updateError } = await supabase
      .from('memes')
      .update({ 
        upvotes, 
        downvotes
      })
      .eq('id', memeId)
      .select();
      
    if (updateError) {
      console.error('Error updating meme votes:', updateError);
      throw updateError;
    }
    
    console.log(`Vote counts updated to: ${upvotes} upvotes, ${downvotes} downvotes`);
    
    return updatedMeme[0] || memeData;
  } catch (error) {
    console.error('Error in voteOnMeme:', error);
    throw error;
  }
};

// Helper function to determine which field name to use for user ID
async function determineUserIdField(tableName) {
  try {
    // Try user_id first
    const { error: userIdError } = await supabase
      .from(tableName)
      .select('user_id')
      .limit(1);
    
    if (!userIdError) return 'user_id';
    
    // Try voter_id next
    const { error: voterIdError } = await supabase
      .from(tableName)
      .select('voter_id')
      .limit(1);
    
    if (!voterIdError) return 'voter_id';
    
    // Default to user_id if nothing else works
    return 'user_id';
  } catch (error) {
    console.error(`Error determining user ID field for ${tableName}:`, error);
    return 'user_id'; // Default fallback
  }
}

// Leaderboard functions
export const getLeaderboard = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('upvotes', { ascending: false })
      .order('current_bid', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // If no memes found, return empty array
    if (!data || data.length === 0) return [];
    
    // Manually fetch user info for each meme
    const memesWithOwners = await Promise.all(
      data.map(async (meme) => {
        if (meme.owner_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .eq('id', meme.owner_id)
            .single();
          
          if (!userError && userData) {
            return { ...meme, owner: userData };
          }
        }
        return meme;
      })
    );
    
    return memesWithOwners;
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
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
