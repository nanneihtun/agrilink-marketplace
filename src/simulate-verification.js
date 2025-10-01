// Simulation script to create a verification request for testing
// This simulates what happens when a user submits verification through the UI

function simulateVerificationRequest() {
  // Test account details (from fresh-demo-accounts.ts)
  const testUser = {
    id: 'test-001',
    email: 'test@demo.com',
    name: 'Test User',
    userType: 'buyer',
    accountType: 'individual'
  };

  // Create a verification request that matches the AdminVerificationPanel interface
  const verificationRequest = {
    id: `verification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: testUser.id,
    userEmail: testUser.email,
    userName: testUser.name,
    userType: testUser.userType,
    type: 'id', // ID verification for individual buyer
    status: 'pending',
    submittedAt: new Date().toISOString(),
    documents: {
      nationalId: {
        front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', // Mock base64 image
        back: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...', // Mock base64 image
        status: 'pending'
      },
      selfieWithId: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...' // Mock base64 image
    },
    additionalInfo: {
      fullName: 'Test User',
      phoneNumber: '+95 9 123 456 789',
      address: 'Yangon, Myanmar'
    }
  };

  // Get existing requests from localStorage
  const existingRequests = JSON.parse(localStorage.getItem('agriconnect-verification-requests') || '[]');
  
  // Add new request
  existingRequests.push(verificationRequest);
  
  // Save back to localStorage
  localStorage.setItem('agriconnect-verification-requests', JSON.stringify(existingRequests));
  
  console.log('✅ Verification request simulated successfully!');
  console.log('📋 Request details:', {
    id: verificationRequest.id,
    user: verificationRequest.userName,
    email: verificationRequest.userEmail,
    type: verificationRequest.type,
    status: verificationRequest.status
  });
  
  return verificationRequest;
}

// Add multiple test requests for better simulation
function simulateMultipleRequests() {
  // Simulate different types of verification requests
  const requests = [
    // Individual Farmer ID Verification
    {
      id: `verification-${Date.now()}-farmer-id`,
      userId: 'new-farmer-001',
      userEmail: 'farmer.new@test.com',
      userName: 'Kyaw Myint',
      userType: 'farmer',
      type: 'id',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      documents: {
        nationalId: {
          front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
          back: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
          status: 'pending'
        },
        selfieWithId: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
      },
      additionalInfo: {
        fullName: 'Kyaw Myint',
        phoneNumber: '+95 9 987 654 321',
        address: 'Mandalay, Myanmar'
      }
    },

    // Business Trader Verification
    {
      id: `verification-${Date.now()}-trader-business`,
      userId: 'new-trader-001',
      userEmail: 'trader.business@test.com',
      userName: 'Aung Aung Trading',
      userType: 'trader',
      type: 'business',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      documents: {
        nationalId: {
          front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
          back: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
          status: 'pending'
        },
        businessLicense: {
          document: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
          status: 'pending'
        },
        selfieWithId: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
      },
      additionalInfo: {
        fullName: 'Aung Aung',
        phoneNumber: '+95 9 555 666 777',
        address: 'Yangon, Myanmar'
      },
      businessInfo: {
        businessName: 'Aung Aung Trading Co.',
        businessType: 'Agricultural Trading',
        businessDescription: 'Wholesale agricultural products distribution',
        location: 'Yangon Industrial Zone',
        registrationNumber: 'BIZ-YGN-2024-001'
      }
    },

    // Buyer Verification (already submitted)
    {
      id: `verification-${Date.now()}-buyer`,
      userId: 'test-001',
      userEmail: 'test@demo.com',
      userName: 'Test User',
      userType: 'buyer',
      type: 'buyer',
      status: 'pending',
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      documents: {
        nationalId: {
          front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
          back: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
          status: 'pending'
        },
        selfieWithId: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
      },
      additionalInfo: {
        fullName: 'Test User',
        phoneNumber: '+95 9 123 456 789',
        address: 'Yangon, Myanmar'
      }
    }
  ];

  // Get existing requests
  const existingRequests = JSON.parse(localStorage.getItem('agriconnect-verification-requests') || '[]');
  
  // Add all new requests
  requests.forEach(request => {
    existingRequests.push(request);
  });
  
  // Save to localStorage
  localStorage.setItem('agriconnect-verification-requests', JSON.stringify(existingRequests));
  
  console.log('✅ Multiple verification requests simulated successfully!');
  console.log('📋 Total requests:', existingRequests.length);
  console.log('📋 New requests added:', requests.length);
  
  return requests;
}

// Function to clear all verification requests (for testing reset)
function clearVerificationRequests() {
  localStorage.removeItem('agriconnect-verification-requests');
  console.log('🗑️ All verification requests cleared');
}

// Function to check current verification requests
function checkVerificationRequests() {
  const requests = JSON.parse(localStorage.getItem('agriconnect-verification-requests') || '[]');
  console.log('📋 Current verification requests:', requests.length);
  requests.forEach((req, index) => {
    console.log(`${index + 1}. ${req.userName} (${req.userEmail}) - ${req.type} - ${req.status}`);
  });
  return requests;
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.simulateVerificationRequest = simulateVerificationRequest;
  window.simulateMultipleRequests = simulateMultipleRequests;
  window.clearVerificationRequests = clearVerificationRequests;
  window.checkVerificationRequests = checkVerificationRequests;
}

// Auto-run simulation when this script is loaded
if (typeof window !== 'undefined' && window.location.pathname === '/') {
  console.log('🎯 Verification simulation script loaded!');
  console.log('📋 Available functions:');
  console.log('  - simulateVerificationRequest() - Add single test request');
  console.log('  - simulateMultipleRequests() - Add multiple test requests');
  console.log('  - checkVerificationRequests() - View current requests');
  console.log('  - clearVerificationRequests() - Clear all requests');
}