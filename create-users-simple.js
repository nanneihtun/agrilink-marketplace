// Simple script to create users with explicit UUIDs
const SUPABASE_URL = 'https://kojgbqlxerixvckiraus.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvamdicWx4ZXJpeHZja2lyYXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MjE5MiwiZXhwIjoyMDc0OTE4MTkyfQ.1vRnkxy9XWqI5n3KDdFxVcWk_yhwzvfFUqGsnwG_nTE';

// Generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const users = [
  // Farmers
  {
    id: generateUUID(),
    email: "farmer1@example.com",
    name: "Aung Min",
    user_type: "farmer",
    account_type: "individual",
    location: "Mandalay Region, Mandalay",
    region: "Mandalay Region",
    phone: "+959123456789",
    verified: false,
    phone_verified: false,
    verification_status: "not_started",
    verification_submitted: false,
    business_details_completed: false
  },
  {
    id: generateUUID(),
    email: "farmer2@example.com",
    name: "Thida Win",
    user_type: "farmer",
    account_type: "individual",
    location: "Yangon Region, Yangon",
    region: "Yangon Region",
    phone: "+959123456790",
    verified: true,
    phone_verified: true,
    verification_status: "verified",
    verification_submitted: true,
    business_details_completed: false
  },
  {
    id: generateUUID(),
    email: "farmer3@example.com",
    name: "Green Valley Farm",
    user_type: "farmer",
    account_type: "business",
    location: "Sagaing Region, Monywa",
    region: "Sagaing Region",
    phone: "+959123456791",
    business_name: "Green Valley Farm",
    business_description: "Organic farming specializing in rice and vegetables",
    verified: false,
    phone_verified: false,
    verification_status: "not_started",
    verification_submitted: false,
    business_details_completed: true
  },
  {
    id: generateUUID(),
    email: "farmer4@example.com",
    name: "Golden Harvest Co.",
    user_type: "farmer",
    account_type: "business",
    location: "Bago Region, Bago",
    region: "Bago Region",
    phone: "+959123456792",
    business_name: "Golden Harvest Co.",
    business_description: "Large-scale agricultural production and export",
    verified: true,
    phone_verified: true,
    verification_status: "verified",
    verification_submitted: true,
    business_details_completed: true
  },
  
  // Traders
  {
    id: generateUUID(),
    email: "trader1@example.com",
    name: "Ko Myint",
    user_type: "trader",
    account_type: "individual",
    location: "Mandalay Region, Mandalay",
    region: "Mandalay Region",
    phone: "+959123456793",
    verified: false,
    phone_verified: false,
    verification_status: "not_started",
    verification_submitted: false,
    business_details_completed: false
  },
  {
    id: generateUUID(),
    email: "trader2@example.com",
    name: "Daw Hla",
    user_type: "trader",
    account_type: "individual",
    location: "Yangon Region, Yangon",
    region: "Yangon Region",
    phone: "+959123456794",
    verified: true,
    phone_verified: true,
    verification_status: "verified",
    verification_submitted: true,
    business_details_completed: false
  },
  {
    id: generateUUID(),
    email: "trader3@example.com",
    name: "Myanmar Trade Hub",
    user_type: "trader",
    account_type: "business",
    location: "Yangon Region, Yangon",
    region: "Yangon Region",
    phone: "+959123456795",
    business_name: "Myanmar Trade Hub",
    business_description: "Agricultural commodity trading and distribution",
    verified: false,
    phone_verified: false,
    verification_status: "not_started",
    verification_submitted: false,
    business_details_completed: true
  },
  {
    id: generateUUID(),
    email: "trader4@example.com",
    name: "AgriConnect Trading",
    user_type: "trader",
    account_type: "business",
    location: "Mandalay Region, Mandalay",
    region: "Mandalay Region",
    phone: "+959123456796",
    business_name: "AgriConnect Trading",
    business_description: "Premium agricultural products export and import",
    verified: true,
    phone_verified: true,
    verification_status: "verified",
    verification_submitted: true,
    business_details_completed: true
  },
  
  // Buyers
  {
    id: generateUUID(),
    email: "buyer1@example.com",
    name: "Min Ko",
    user_type: "buyer",
    account_type: "individual",
    location: "Yangon Region, Yangon",
    region: "Yangon Region",
    phone: "+959123456797",
    verified: false,
    phone_verified: false,
    verification_status: "not_started",
    verification_submitted: false,
    business_details_completed: false
  },
  {
    id: generateUUID(),
    email: "buyer2@example.com",
    name: "Daw Nwe",
    user_type: "buyer",
    account_type: "individual",
    location: "Mandalay Region, Mandalay",
    region: "Mandalay Region",
    phone: "+959123456798",
    verified: true,
    phone_verified: true,
    verification_status: "verified",
    verification_submitted: true,
    business_details_completed: false
  },
  {
    id: generateUUID(),
    email: "buyer3@example.com",
    name: "Fresh Market Chain",
    user_type: "buyer",
    account_type: "business",
    location: "Yangon Region, Yangon",
    region: "Yangon Region",
    phone: "+959123456799",
    business_name: "Fresh Market Chain",
    business_description: "Retail chain specializing in fresh agricultural products",
    verified: false,
    phone_verified: false,
    verification_status: "not_started",
    verification_submitted: false,
    business_details_completed: true
  },
  {
    id: generateUUID(),
    email: "buyer4@example.com",
    name: "Premium Groceries Ltd",
    user_type: "buyer",
    account_type: "business",
    location: "Mandalay Region, Mandalay",
    region: "Mandalay Region",
    phone: "+959123456800",
    business_name: "Premium Groceries Ltd",
    business_description: "High-end grocery stores and wholesale distribution",
    verified: true,
    phone_verified: true,
    verification_status: "verified",
    verification_submitted: true,
    business_details_completed: true
  }
];

async function createUsers() {
  console.log('🚀 Creating 12 test users...\n');
  
  for (const user of users) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created: ${user.name} (${user.user_type} - ${user.account_type} - ${user.verified ? 'verified' : 'unverified'})`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${user.name} - ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${user.name} - ${error.message}`);
    }
  }
  
  console.log('\n🎉 User creation process completed!');
}

createUsers();
