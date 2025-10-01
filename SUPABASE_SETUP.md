# Supabase Backend Setup for AgriLink

## 🚀 Quick Setup Guide

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name:** `agrilink-marketplace`
   - **Database Password:** (generate a strong password)
   - **Region:** Choose closest to your users
6. Click "Create new project"

### 2. Get Your Project Credentials
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Update Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### 4. Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables, indexes, and security policies

### 5. Configure Authentication
1. Go to **Authentication** → **Settings**
2. Configure your site URL: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/**`
   - `https://your-domain.com/**` (for production)

### 6. Test the Integration
1. Restart your development server: `npm run dev`
2. The app should now use Supabase instead of localStorage
3. Try creating a new account - it will be stored in Supabase!

## 📊 Database Tables Created

- **users** - User profiles and verification data
- **products** - Agricultural product listings
- **chats** - Chat conversations between buyers and sellers
- **messages** - Individual chat messages
- **saved_products** - Products saved by buyers for price tracking
- **reviews** - User reviews and ratings
- **deals** - Offers and negotiations

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access their own data
- **Authentication** integrated with Supabase Auth
- **Real-time subscriptions** for live chat and updates

## 🚀 Production Deployment

1. Update environment variables with production URLs
2. Configure production authentication settings
3. Set up proper CORS and security headers
4. Monitor usage in Supabase dashboard

## 📈 Monitoring

- **Dashboard** - Monitor database usage and performance
- **Logs** - View authentication and API logs
- **Analytics** - Track user engagement and growth

Your AgriLink marketplace is now powered by a robust, scalable backend! 🌱
