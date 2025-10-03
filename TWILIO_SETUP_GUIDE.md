# Twilio Phone Verification Setup Guide

This guide will help you set up Twilio for phone verification in the Agrilink marketplace.

## Prerequisites

1. A Twilio account (sign up at [twilio.com](https://www.twilio.com))
2. A phone number with SMS capabilities
3. Your Agrilink marketplace project

## Step 1: Create a Twilio Account

1. Go to [console.twilio.com](https://console.twilio.com)
2. Sign up for a free account (includes $15 credit)
3. Verify your phone number and email

## Step 2: Get Your Twilio Credentials

1. In the Twilio Console, go to **Account** → **API Keys & Tokens**
2. Copy your **Account SID** and **Auth Token**
3. Go to **Phone Numbers** → **Manage** → **Active Numbers**
4. Copy your Twilio phone number (format: +1234567890)

## Step 3: Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Add your Twilio credentials to `.env.local`:
   ```env
   # Twilio Configuration for Phone Verification
   VITE_TWILIO_ACCOUNT_SID=your-account-sid-here
   VITE_TWILIO_AUTH_TOKEN=your-auth-token-here
   VITE_TWILIO_PHONE_NUMBER=+1234567890
   ```

## Step 4: Set Up Database Schema

Run the SQL script to add phone verification fields:

```sql
-- Run this in your Supabase SQL editor
\i add-phone-verification-fields.sql
```

Or copy and paste the contents of `add-phone-verification-fields.sql` into your Supabase SQL editor.

## Step 5: Deploy Backend API (Optional)

For production use, you'll need to deploy the API endpoints:

### Option A: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy the API:
   ```bash
   vercel --prod
   ```

3. Update the API URLs in `src/services/twilio.ts` to point to your deployed endpoints.

### Option B: Netlify Functions

1. Create a `netlify/functions/` directory
2. Move the API files there
3. Deploy to Netlify

### Option C: Local Development

For local development, the app will automatically fall back to demo mode if Twilio is not configured.

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the phone verification page
3. Enter a phone number (use your own for testing)
4. Check if you receive the SMS
5. Enter the verification code

## Demo Mode

If Twilio is not configured, the app automatically falls back to demo mode:
- Use any phone number format
- Use `123456` or any code ending in `00` for verification
- No actual SMS will be sent

## Troubleshooting

### Common Issues

1. **"Twilio not configured" message**
   - Check that your environment variables are set correctly
   - Restart your development server after adding environment variables

2. **SMS not received**
   - Verify your Twilio phone number is correct
   - Check that you have sufficient Twilio credits
   - Ensure the phone number format includes country code (+1 for US)

3. **Verification code not working**
   - Check that the code is 6 digits
   - Ensure you're using the code from the most recent SMS
   - In demo mode, use `123456` or codes ending in `00`

### Debug Mode

Enable debug logging by opening browser console. You'll see detailed logs for:
- Twilio service initialization
- SMS sending attempts
- Verification attempts
- Database updates

## Production Considerations

1. **Security**: Never expose your Auth Token in client-side code
2. **Rate Limiting**: Implement rate limiting for verification attempts
3. **Cost Management**: Monitor your Twilio usage and set up billing alerts
4. **Phone Number Validation**: Implement proper phone number validation
5. **Error Handling**: Add comprehensive error handling for production

## Twilio Verify Service (Advanced)

For production, consider using Twilio's Verify service instead of direct SMS:

1. Create a Verify service in Twilio Console
2. Update the API endpoints to use Verify service
3. This provides better security and rate limiting

## Support

- Twilio Documentation: [twilio.com/docs](https://www.twilio.com/docs)
- Twilio Support: [support.twilio.com](https://support.twilio.com)
- Agrilink Issues: Create an issue in your project repository
