/**
 * AetherHub 2049™ - Elev8minds LLC
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * This software is the copyrighted property of Elev8minds LLC.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Trademarks: "AetherHub", "AetherHub 2049", and the AetherHub logo are owned by Elev8minds LLC.
 * For licensing inquiries: legal@elev8minds.com
 */

import { createClient } from '@supabase/supabase-js';

// Initialize database client
const supabaseUrl = 'https://smfjfftzkuesphwbxamr.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhlNjdjYWY5LTY0MDctNGJkYS1iMTE2LWYzMWYxNTZhYjNlYiJ9.eyJwcm9qZWN0SWQiOiJzbWZqZmZ0emt1ZXNwaHdieGFtciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1MjU5NTU3LCJleHAiOjIwODA2MTk1NTcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.msDgn34M8d_Z3pz5xW5NlzahaxTw5QU7wCDJQX_059A';
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
