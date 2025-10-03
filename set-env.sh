#!/bin/bash

# Set environment variables for local development
export VITE_SUPABASE_URL=https://kojgbqlxerixvckiraus.supabase.co
export VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDIxOTIsImV4cCI6MjA3NDkxODE5Mn0.2nAVFSEZK4Je5LqI1H_otibVhpMarVOyiRBXmkxuAWM
export VITE_SUPABASE_PROJECT_ID=kojgbqlxerixvckiraus

echo "✅ Environment variables set for local development"
echo "🚀 Starting development server..."

npm run dev
