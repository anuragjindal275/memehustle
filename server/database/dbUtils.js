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
  // Implement retry logic
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Attempting to fetch meme ${memeId} (attempt ${retryCount + 1})`);
      
      // Get meme data
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('id', memeId)
        .single();
      
      if (error) {
        console.warn(`Error fetching meme ${memeId}:`, error);
        throw error;
      }
      
      if (!data) {
        console.warn(`No meme found with id ${memeId}`);
        return null;
      }
      
      // Only try to fetch owner if we successfully got the meme
      if (data.owner_id) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .eq('id', data.owner_id)
            .single();
          
          if (!userError && userData) {
            return { ...data, owner: userData };
          } else if (userError) {
            console.warn(`Could not fetch owner for meme ${memeId}:`, userError);
          }
        } catch (userFetchError) {
          console.warn(`Exception fetching user for meme ${memeId}:`, userFetchError);
          // Continue with the meme data we have
        }
      }
      
      return data;
    } catch (error) {
      retryCount++;
      console.error(`Attempt ${retryCount} failed for getMemeById(${memeId}):`, error);
      
      if (retryCount >= maxRetries) {
        console.error(`All ${maxRetries} attempts failed for getMemeById(${memeId})`);
        // Return a basic object with the ID so the app doesn't completely break
        return { id: memeId, title: 'Unavailable Meme', error: 'Could not fetch meme data' };
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
    }
  }
};

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

// Vote related functions
export const voteOnMeme = async (memeId, userId, voteType) => {
  try {
    console.log(`Attempting to vote on meme ${memeId} by user ${userId} with vote type ${voteType}`);
    
    // First, determine the correct vote_type value format based on schema
    const voteTypeValue = await determineVoteTypeFormat(voteType);
    console.log(`Using vote type value: ${voteTypeValue} for ${voteType ? 'upvote' : 'downvote'}`);
    
    // Determine if the votes table uses user_id or voter_id
    const userIdField = await determineUserIdField('votes');
    console.log(`Using ${userIdField} as the user ID field in votes table`);
    
    // Check if the user has already voted on this meme
    let existingVoteQuery = supabase
      .from('votes')
      .select('*')
      .eq('meme_id', memeId);
      
    existingVoteQuery = existingVoteQuery.eq(userIdField, userId);
    const { data: existingVote, error: existingVoteError } = await existingVoteQuery.maybeSingle();
    
    if (existingVoteError) {
      console.error('Error checking for existing vote:', existingVoteError);
      throw existingVoteError;
    }

    if (existingVote) {
      // Update the existing vote if it's different
      // For comparison, need to standardize existing vote value
      const existingVoteValue = typeof existingVote.vote_type === 'string' ? 
        existingVote.vote_type.toLowerCase() === 'upvote' || existingVote.vote_type === '1' : 
        !!existingVote.vote_type;
        
      if (existingVoteValue !== !!voteType) {
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteTypeValue })
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
      // Create a new vote - use the determined userIdField
      const voteData = {
        meme_id: memeId,
        vote_type: voteTypeValue
      };
      voteData[userIdField] = userId;
      
      console.log('Inserting vote with data:', JSON.stringify(voteData));
      
      const { error } = await supabase
        .from('votes')
        .insert([voteData]);
        
      if (error) {
        console.error('Error creating vote:', error);
        throw error;
      }
    }

    // Count the upvotes and downvotes using the appropriate vote_type values
    let upvotesCount = 0;
    let downvotesCount = 0;
    
    try {
      // Get all votes for this meme
      const { data: allVotes, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('meme_id', memeId);
        
      if (!votesError && allVotes) {
        // Count manually based on vote_type
        allVotes.forEach(vote => {
          // Normalize vote type for comparison
          let voteValue;
          if (typeof vote.vote_type === 'boolean') {
            voteValue = vote.vote_type;
          } else if (typeof vote.vote_type === 'number') {
            voteValue = vote.vote_type > 0;
          } else if (typeof vote.vote_type === 'string') {
            voteValue = vote.vote_type.toLowerCase() === 'upvote' || 
                      vote.vote_type === '1' ||
                      vote.vote_type.toLowerCase() === 'true';
          }
          
          if (voteValue) {
            upvotesCount++;
          } else {
            downvotesCount++;
          }
        });
      }
    } catch (countError) {
      console.error('Error counting votes:', countError);
      // Continue with update anyway
    }
    
    console.log(`Vote counts updated: ${upvotesCount} upvotes, ${downvotesCount} downvotes`);

    // Update the meme with the new vote counts
    return updateMemeVotes(memeId, upvotesCount, downvotesCount);
  } catch (error) {
    console.error('Error in voteOnMeme:', error);
    throw error;
  }
};

// Helper function to determine the correct format for vote_type values
async function determineVoteTypeFormat(voteType) {
  // According to the schema.sql, vote_type should be a boolean
  // The constraint error suggests we need to use a proper boolean value
  console.log(`Using boolean value ${Boolean(voteType)} for vote_type`);
  return Boolean(voteType);
}

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
