// ─── Supabase Configuration ──────────────────────────────────────────────────
const SUPABASE_URL = 'https://ioupmkzhoqndbbkltevc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdXBta3pob3FuZGJia2x0ZXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDY1NTcsImV4cCI6MjA4NDkyMjU1N30.wP-UPJ4i28xBLIoEnbexwSeLIehnfLmrnkpTm9br4DA';

// Initialize Supabase client (using `sb` to avoid conflict with window.supabase CDN object)
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
