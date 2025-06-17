import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables are not set.');
  console.error('Please set SUPABASE_URL and SUPABASE_KEY in your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
