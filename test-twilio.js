// Simple test script to verify Twilio credentials
// Run this with: node test-twilio.js

const https = require('https');

// Replace these with your actual Twilio credentials
const ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
const AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN';
const FROM_NUMBER = 'YOUR_TWILIO_PHONE_NUMBER';
const TO_NUMBER = '+1234567890'; // Replace with your test phone number

const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');

const postData = new URLSearchParams({
  From: FROM_NUMBER,
  To: TO_NUMBER,
  Body: 'Test message from Agrilink - Twilio is working!'
});

const options = {
  hostname: 'api.twilio.com',
  port: 443,
  path: `/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

console.log('🧪 Testing Twilio credentials...');
console.log('Account SID:', ACCOUNT_SID);
console.log('From Number:', FROM_NUMBER);
console.log('To Number:', TO_NUMBER);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    console.log('📄 Response Body:', data);
    
    if (res.statusCode === 201) {
      console.log('✅ Twilio is working! Check your phone for the test message.');
    } else {
      console.log('❌ Twilio error. Check your credentials and phone number format.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(postData);
req.end();
