// Backend API endpoint for sending verification SMS via Twilio
// This would typically be deployed as a serverless function (Vercel, Netlify, etc.)

const twilio = require('twilio');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, accountSid, authToken, fromNumber } = req.body;

    // Validate required fields
    if (!phoneNumber || !accountSid || !authToken || !fromNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Send SMS
    const message = await client.messages.create({
      body: `Your Agrilink verification code is: ${verificationCode}. This code expires in 10 minutes.`,
      from: fromNumber,
      to: phoneNumber
    });

    // In a real implementation, you would store the verification code
    // in a database with an expiration time for verification

    console.log('✅ SMS sent successfully:', message.sid);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent successfully',
      verificationSid: message.sid
    });

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send verification code',
      details: error.message
    });
  }
}
