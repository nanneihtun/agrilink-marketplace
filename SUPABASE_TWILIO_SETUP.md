# Supabase + Twilio Phone Verification Setup

This guide will help you set up phone verification using Supabase Edge Functions and Twilio.

## Prerequisites

1. A Supabase project
2. A Twilio account (sign up at [twilio.com](https://www.twilio.com))
3. Supabase CLI installed

## Step 1: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref
```

## Step 2: Set Up Twilio Account

1. Go to [console.twilio.com](https://console.twilio.com)
2. Sign up for a free account (includes $15 credit)
3. Get your credentials:
   - **Account SID**: Go to Account → API Keys & Tokens
   - **Auth Token**: Same page as Account SID
   - **Phone Number**: Go to Phone Numbers → Manage → Active Numbers

## Step 3: Configure Supabase Environment Variables

In your Supabase dashboard, go to **Settings** → **Edge Functions** → **Environment Variables** and add:

```
TWILIO_ACCOUNT_SID=your-account-sid-here
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 4: Deploy Edge Functions

```bash
# Deploy the Edge Functions
supabase functions deploy send-verification-sms
supabase functions deploy verify-sms-code
```

## Step 5: Set Up Database Schema

Run these SQL scripts in your Supabase SQL Editor:

### 1. Add phone verification fields to users table:
```sql
-- Copy and paste the contents of add-phone-verification-fields.sql
```

### 2. Create verification codes table:
```sql
-- Copy and paste the contents of create-verification-codes-table.sql
```

## Step 6: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test phone verification**:
   - Navigate to phone verification in your app
   - Enter your phone number (with country code)
   - You should receive a real SMS
   - Enter the verification code

## Step 7: Monitor and Debug

### Check Edge Function Logs
```bash
# View logs for send-verification-sms
supabase functions logs send-verification-sms

# View logs for verify-sms-code
supabase functions logs verify-sms-code
```

### Check Database
- Go to Supabase Dashboard → Table Editor
- Check `verification_codes` table for stored codes
- Check `users` table for updated verification status

## Environment Variables Reference

### Supabase Edge Functions Environment Variables
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend Environment Variables (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

## How It Works

1. **User enters phone number** → Frontend calls `TwilioService.sendVerificationSMS()`
2. **TwilioService** → Calls Supabase Edge Function `send-verification-sms`
3. **Edge Function** → Sends SMS via Twilio API and stores code in database
4. **User enters code** → Frontend calls `TwilioService.verifySMSCode()`
5. **TwilioService** → Calls Supabase Edge Function `verify-sms-code`
6. **Edge Function** → Verifies code against database and marks as used
7. **Success** → User's phone verification status is updated

## Security Features

- **Row Level Security (RLS)** enabled on verification_codes table
- **Code expiration** (10 minutes)
- **One-time use** codes (marked as used after verification)
- **Automatic cleanup** of expired codes
- **Environment variables** stored securely in Supabase

## Troubleshooting

### Common Issues

1. **"Function not found" error**
   - Make sure Edge Functions are deployed: `supabase functions deploy`
   - Check function names match exactly

2. **"Twilio credentials not configured"**
   - Verify environment variables are set in Supabase dashboard
   - Check variable names match exactly (case-sensitive)

3. **SMS not received**
   - Verify Twilio phone number format (+1234567890)
   - Check Twilio account has sufficient credits
   - Verify phone number format includes country code

4. **Database errors**
   - Run the SQL schema scripts
   - Check RLS policies are correct
   - Verify table permissions

### Debug Mode

The system automatically falls back to demo mode if:
- Twilio credentials are not configured
- Edge Functions fail
- Network errors occur

In demo mode:
- Use `123456` or any code ending in `00`
- No real SMS is sent
- Verification still works for testing

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for verification attempts
2. **Monitoring**: Set up alerts for failed verification attempts
3. **Cost Management**: Monitor Twilio usage and set billing alerts
4. **Security**: Regularly rotate Twilio credentials
5. **Cleanup**: Set up automated cleanup of expired verification codes

## File Structure

```
supabase/
├── functions/
│   ├── send-verification-sms/
│   │   └── index.ts
│   └── verify-sms-code/
│       └── index.ts
└── migrations/
    ├── add-phone-verification-fields.sql
    └── create-verification-codes-table.sql
```

## Support

- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Twilio Documentation: [twilio.com/docs](https://www.twilio.com/docs)
- Edge Functions: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
