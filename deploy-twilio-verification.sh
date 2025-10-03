#!/bin/bash

# Deploy Twilio Phone Verification to Supabase
# This script helps you deploy the phone verification system

echo "🚀 Deploying Twilio Phone Verification to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."

echo "  - Deploying send-verification-sms..."
supabase functions deploy send-verification-sms

echo "  - Deploying verify-sms-code..."
supabase functions deploy verify-sms-code

echo "✅ Edge Functions deployed successfully"

# Show next steps
echo ""
echo "🎉 Deployment complete! Next steps:"
echo ""
echo "1. Set up Twilio credentials in Supabase Dashboard:"
echo "   - Go to Settings → Edge Functions → Environment Variables"
echo "   - Add: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
echo ""
echo "2. Run database migrations:"
echo "   - Copy add-phone-verification-fields.sql to Supabase SQL Editor"
echo "   - Copy create-verification-codes-table.sql to Supabase SQL Editor"
echo ""
echo "3. Test the integration:"
echo "   - Start your app: npm run dev"
echo "   - Navigate to phone verification"
echo "   - Test with your phone number"
echo ""
echo "📚 For detailed instructions, see SUPABASE_TWILIO_SETUP.md"
