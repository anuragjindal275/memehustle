import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// These would typically be in a .env file, but we're hard-coding for this assignment
const supabaseUrl = 'https://utolrcrvafjgcukummwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b2xyY3J2YWZqZ2N1a3VtbXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzUyOTUsImV4cCI6MjA2NTc1MTI5NX0.VwnjilNCEQA0Ws-KWo0QlJOsl-0ixNOkRijI_CTBBxE';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
