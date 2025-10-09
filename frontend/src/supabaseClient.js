import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wsdjbgviumxgztcspvsc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZGpiZ3ZpdW14Z3p0Y3NwdnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTkzMTMsImV4cCI6MjA3NTU5NTMxM30.4oyPdXx20kHS4hsv6qbkvlhl6_mkZFHI8kMc-rln8No";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
