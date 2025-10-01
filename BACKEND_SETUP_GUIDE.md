# Backend Setup Guide for AgriLink Marketplace

This guide will help you set up the backend for the AgriLink Marketplace application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free tier available)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `agrilink-marketplace`
   - Database Password: (choose a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   VITE_SUPABASE_PROJECT_ID=your-actual-project-id
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

This will create all necessary tables:
- `users` - User profiles and authentication
- `products` - Product listings
- `conversations` - Chat conversations
- `messages` - Chat messages
- `saved_products` - User's saved products
- `reviews` - User reviews and ratings
- `deals` - Offer and transaction management
- `transactions` - Transaction tracking

## Step 5: Configure Row Level Security (RLS)

The schema includes RLS policies, but you may need to enable them:

1. Go to **Authentication** → **Policies**
2. Ensure RLS is enabled for all tables
3. The policies from the schema should be automatically applied

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the browser console and look for:
   - ✅ "Supabase client initialized successfully"
   - ✅ "Backend connected successfully"

3. If you see these messages, your backend is properly configured!

## Step 7: Test User Registration

1. Go to the registration page
2. Create a new account
3. Check your Supabase dashboard → **Authentication** → **Users** to see the new user
4. Check **Table Editor** → **users** to see the user profile

## Troubleshooting

### Common Issues

1. **"Supabase not configured"**
   - Check your `.env.local` file
   - Ensure the URL and key are correct
   - Restart your development server

2. **"Backend connection failed"**
   - Check your internet connection
   - Verify the Supabase URL is correct
   - Check if your Supabase project is active

3. **"Table doesn't exist"**
   - Run the SQL schema in Supabase SQL Editor
   - Check if the table names match exactly

4. **Authentication errors**
   - Check RLS policies in Supabase
   - Ensure the anon key has proper permissions

### Debug Mode

Enable debug mode by adding to your `.env.local`:
```env
VITE_DEBUG_MODE=true
```

This will show detailed logs in the browser console.

## Production Deployment

For production deployment:

1. Update your environment variables with production values
2. Ensure RLS policies are properly configured
3. Test all functionality thoroughly
4. Consider setting up proper error monitoring

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check the Supabase dashboard for any errors
3. Verify your environment variables are correct
4. Ensure all database tables are created properly

## Next Steps

Once your backend is set up:
1. Test user registration and login
2. Test product creation and management
3. Test chat functionality
4. Test offer and transaction features
5. Deploy to production when ready
