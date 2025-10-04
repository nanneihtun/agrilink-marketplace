# Fix Verification Status Display

## The Problem
All users are showing as "Unverified" because the `getSellerVerificationStatus` function only looks in localStorage, but our users are stored in Supabase.

## Quick Fix
Run this script in your browser console after the app loads:

```javascript
// Copy and paste this into your browser console
async function fixVerificationStatus() {
  try {
    // Get Supabase client from the app
    const { createClient } = window.supabase;
    const supabase = createClient();
    
    // Fetch all users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, user_type, account_type, verified, phone_verified, verification_status, business_name, location, region')
      .like('email', '%@example.com');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    if (users && users.length > 0) {
      // Transform users to match localStorage format
      const transformedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.business_name,
        userType: user.user_type,
        accountType: user.account_type,
        verified: user.verified,
        phoneVerified: user.phone_verified,
        verificationStatus: user.verification_status,
        businessVerified: user.verified && user.account_type === 'business',
        location: user.location,
        region: user.region
      }));
      
      // Store in localStorage
      localStorage.setItem('agriconnect-myanmar-users', JSON.stringify(transformedUsers));
      
      console.log('✅ Successfully populated user cache with', transformedUsers.length, 'users');
      console.log('Users:', transformedUsers);
      
      // Reload the page to see the verification statuses
      window.location.reload();
    } else {
      console.log('No users found');
    }
  } catch (error) {
    console.error('Error fixing verification status:', error);
  }
}

// Run the function
fixVerificationStatus();
```

## What This Does
1. Fetches all users from Supabase database
2. Transforms them to match the localStorage format
3. Stores them in localStorage so the verification status function can find them
4. Reloads the page to show the correct verification statuses

## Expected Result
After running this script, you should see:
- **6 Verified users** with green "Verified" or "Business ✓" badges
- **6 Unverified users** with red "Unverified" badges

## Alternative: Manual Fix
If the script doesn't work, you can also manually add the user data to localStorage:

1. Open browser DevTools (F12)
2. Go to Application tab > Local Storage
3. Find the key `agriconnect-myanmar-users`
4. Replace the value with the user data from the script output
