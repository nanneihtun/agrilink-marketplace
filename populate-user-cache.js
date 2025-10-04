// Script to populate localStorage with user data from Supabase
// Run this in the browser console after the app loads

async function populateUserCache() {
  try {
    // Get Supabase client
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
    console.error('Error populating user cache:', error);
  }
}

// Run the function
populateUserCache();
