# 🚀 Deployment Guide - Shift Rota App

## 🚨 **QUICK SETUP (If you're getting 500 errors)**

If your app is deployed but getting database errors, follow these steps:

### 1. Create Supabase Project (5 minutes)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your connection strings

### 2. Add Environment Variables to Vercel
In your Vercel dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_URL=https://shift-rota-app-fnp7.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here
```

### 3. Push Schema (Run this locally)
```bash
# Set your production environment variables locally
export DATABASE_URL="your-supabase-connection-string"
export DIRECT_URL="your-supabase-direct-connection-string"

# Push schema to Supabase
npx prisma db push
```

### 4. Redeploy
```bash
git commit --allow-empty -m "Trigger redeploy with database"
git push origin main
```

---

## 📋 Prerequisites
- ✅ Vercel account
- ✅ Supabase account
- ✅ Google Cloud Console project with OAuth and Calendar API enabled

## 🗄️ Step 1: Set up Supabase Database

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `shift-rota-app`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Database Connection Details
Once your project is created:
1. Go to **Settings** → **Database**
2. Copy the connection strings:
   - **Connection string (pooled)**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres`
   - **Connection string (direct)**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## 🔧 Step 2: Set up Google OAuth & Calendar API

### 1. Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Google+ API
   - Google Calendar API

### 2. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://shift-rota-app-fnp7.vercel.app/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

### 3. Create API Key (for Calendar API)
1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "API Key"
3. Copy the API Key

## 🌐 Step 3: Configure Vercel Environment Variables

### 1. Go to Vercel Dashboard
1. Open your project in Vercel
2. Go to **Settings** → **Environment Variables**

### 2. Add Environment Variables
Add these variables:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_URL=https://shift-rota-app-fnp7.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALENDAR_API_KEY=your-google-calendar-api-key
```

### 3. Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 🗄️ Step 4: Set up Database Schema

### 1. Push Schema to Supabase
```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

### 2. Verify Database
```bash
# Open Prisma Studio to verify
npx prisma studio
```

## 🚀 Step 5: Deploy to Vercel

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Vercel will automatically deploy when you push to GitHub
2. Or manually trigger deployment from Vercel dashboard

### 3. Verify Deployment
1. Check your app URL: `https://shift-rota-app-fnp7.vercel.app`
2. Test authentication
3. Test shift generation and confirmation

## 🔍 Step 6: Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify DATABASE_URL and DIRECT_URL are correct
   - Check if Supabase project is active
   - Ensure password is correct

2. **Google OAuth Error**
   - Verify redirect URIs include your production domain
   - Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Ensure Google+ API is enabled

3. **Calendar API Error**
   - Verify GOOGLE_CALENDAR_API_KEY is correct
   - Ensure Google Calendar API is enabled
   - Check API quotas

### Debug Commands:
```bash
# Check Prisma connection
npx prisma db pull

# View database in browser
npx prisma studio

# Check environment variables
echo $DATABASE_URL
```

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Verify all environment variables are set correctly
4. Test locally with production environment variables

## 🎯 Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure monitoring and analytics
3. Set up backup strategies
4. Consider setting up staging environment
