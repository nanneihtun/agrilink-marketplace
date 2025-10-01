# Supabase Email Confirmation Setup

## Configure Email Confirmation Redirect

To make email confirmation work properly with your Vercel app:

### 1. Update Supabase Settings

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**

2. Set these values:
   - **Site URL**: `https://agrilink-marketplace-d7yg.vercel.app`
   - **Redirect URLs**: 
     ```
     https://agrilink-marketplace-d7yg.vercel.app/**
     https://agrilink-marketplace-d7yg.vercel.app/?email_confirmed=true
     ```

3. **Save changes**

### 2. Email Confirmation Flow

Now the flow will be:

1. **User registers** → Gets success message: "Registration successful! Please check your email and click the confirmation link to activate your account."

2. **User clicks email link** → Redirects to: `https://agrilink-marketplace-d7yg.vercel.app/?email_confirmed=true`

3. **App shows confirmation message** → "Email confirmed successfully! You can now sign in to your account."

4. **User goes to login** → Can sign in normally

5. **User signs in** → Gets success message: "Login successful! Welcome to AgriLink Marketplace!"

### 3. Alternative: Disable Email Confirmation (for testing)

If you want to skip email confirmation for testing:

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Turn OFF **"Enable email confirmations"**
3. Save changes
4. Users can sign in immediately after registration

## Testing the Flow

1. Register a new account
2. Check your email for confirmation link
3. Click the confirmation link
4. You should see the confirmation success message
5. Go to login and sign in
6. You should be redirected to the marketplace

## Troubleshooting

- **"This site can't be reached"**: Check that Site URL is set correctly
- **No confirmation email**: Check spam folder, wait a few minutes
- **Confirmation link doesn't work**: Make sure Redirect URLs include your Vercel URL
