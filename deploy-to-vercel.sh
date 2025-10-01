#!/bin/bash

# AgriLink Marketplace - Quick Deploy to Vercel
# This script helps you deploy your marketplace to Vercel

echo "🚀 AgriLink Marketplace Deployment Script"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

echo "🏗️  Building the application..."
npm run build

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your marketplace is now live!"
echo ""
echo "Next steps:"
echo "1. Set up Supabase backend (see SUPABASE_SETUP.md)"
echo "2. Add environment variables in Vercel dashboard"
echo "3. Test your live marketplace"
echo "4. Share with users!"
