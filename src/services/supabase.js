import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqrctcdobltjvstpbftb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcmN0Y2RvYmx0anZzdHBiZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTczODQsImV4cCI6MjA5NDk3MzM4NH0.Z7gQUIsKpIYC2x4IYULVB5d0wUCsO-5H9nd1JnMO8eo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);