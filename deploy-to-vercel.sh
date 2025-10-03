#!/bin/bash

# AgriLink Marketplace - Vercel Deployment Script
echo "🚀 Deploying AgriLink Marketplace to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your marketplace is now live!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - VITE_SUPABASE_URL=https://kojgbqlxerixvckiraus.supabase.co"
echo "   - VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDIxOTIsImV4cCI6MjA3NDkxODE5Mn0.2nAVFSEZK4Je5LqI1H_otibVhpMarVOyiRBXmkxuAWM"
echo "   - VITE_SUPABASE_PROJECT_ID=kojgbqlxerixvckiraus"
echo "2. Redeploy after setting environment variables"
echo "3. Test all features on your live site"