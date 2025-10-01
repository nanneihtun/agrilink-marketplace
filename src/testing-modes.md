# AgriConnect Myanmar - Testing Different Modes

## Overview
Our application has a three-tier fallback system that automatically adapts based on available backend services:

## Mode Testing Guide

### 1. Demo Mode (localStorage)
**Purpose:** Complete offline functionality for development and demos

**Setup:**
```bash
# Remove or comment out environment variables
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY= 
# VITE_SUPABASE_PROJECT_ID=
```

**Indicators:**
- Environment status alert: "Running in demo mode"
- Backend status badge: "Demo Mode" (yellow)
- Console log: "Supabase not configured, using fallback mode"

**Features Available:**
- ✅ Product browsing (demo data)
- ✅ Search and filtering  
- ✅ User registration/login (localStorage)
- ✅ Product listings (localStorage)
- ✅ Chat interface (mock)
- ✅ Price comparison (demo data)
- ❌ Real-time features
- ❌ File uploads
- ❌ Data persistence across devices

**Test Scenarios:**
1. Register new user account
2. Add product listing
3. Search and filter products
4. View price comparisons
5. Check data persists after page refresh
6. Clear localStorage and verify data resets

### 2. Development Mode (KV Store)
**Purpose:** Persistent data with Supabase auth but no custom backend

**Setup:**
```bash
# Set environment variables (get from Supabase dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Ensure backend server is NOT running
```

**Indicators:**
- No environment status alert
- Backend status badge: "Demo Mode" (yellow) 
- Console log: "Backend not available, using fallback mode"

**Features Available:**
- ✅ Real Supabase authentication
- ✅ Persistent data storage (KV table)
- ✅ User profiles and sessions
- ✅ Product CRUD operations
- ✅ Cross-device data sync
- ❌ Advanced backend features
- ❌ File storage
- ❌ Real-time notifications

**Test Scenarios:**
1. Register with real email/password
2. Login from different browser/device
3. Add products and verify persistence
4. Test user profile updates
5. Verify data survives app restarts

### 3. Production Mode (Full Backend)
**Purpose:** Complete functionality with all backend services

**Setup:**
```bash
# Set environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Deploy and start backend server
# Server must respond to health endpoint
```

**Indicators:**
- No environment status alert
- Backend status badge: "Backend Connected" (green with checkmark)
- Network tab shows successful API calls

**Features Available:**
- ✅ All development mode features
- ✅ File uploads and storage
- ✅ Advanced search and analytics
- ✅ Real-time chat and notifications
- ✅ Complete API functionality
- ✅ Production-grade performance

**Test Scenarios:**
1. Complete user registration flow
2. Upload product images
3. Test real-time chat functionality
4. Verify advanced search features
5. Test all CRUD operations
6. Check performance and error handling

## Mode Switching Testing

### Automatic Fallback Test
1. Start in Production Mode (all services available)
2. Stop backend server
3. Refresh page - should automatically switch to Development Mode
4. Clear environment variables  
5. Refresh page - should switch to Demo Mode

### Error Handling Test
1. Test invalid environment variables
2. Test network timeouts
3. Test malformed API responses
4. Verify graceful degradation

## Debug Information

### Console Logs to Watch
```
# Demo Mode
"Supabase not configured, using fallback mode"
"Environment variables not available, using defaults"

# Development Mode  
"Backend not available, using fallback mode: [error]"

# Production Mode
"Backend Connected" (no specific logs)
```

### Network Activity
- **Demo Mode:** No external API calls
- **Development Mode:** Supabase auth calls only
- **Production Mode:** Full API endpoint calls

### Browser Storage
- **Demo Mode:** localStorage only
- **Development/Production:** Supabase session storage

## Common Issues & Solutions

### Mode Not Switching
- Clear browser cache and storage
- Check environment variable naming (must start with VITE_)
- Verify Supabase project settings
- Check network connectivity

### Data Not Persisting
- Verify mode indicators are correct
- Check browser developer tools storage tab
- Test with different browsers/incognito mode

### Backend Connection Issues
- Check backend server logs
- Verify health endpoint responds
- Test API endpoints manually
- Check CORS settings