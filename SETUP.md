# Shift Rota App - Setup Guide

## Prerequisites
- Node.js 18.17 or higher
- PostgreSQL database
- Google Cloud Console access

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/shift_rota"
DIRECT_URL="postgresql://username:password@localhost:5432/shift_rota"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App Configuration
NEXT_PUBLIC_DEFAULT_TZ="Europe/London"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Go to Credentials → Create OAuth Client ID (Web)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to your `.env.local`

## Database Setup

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` and `DIRECT_URL` in your `.env.local`
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Features

- ✅ 4-on-4-off shift pattern generation
- ✅ Google Calendar integration
- ✅ ICS feed generation
- ✅ User authentication with NextAuth
- ✅ Database persistence with Prisma
- ✅ Rate limiting and error handling
- ✅ TypeScript support
- ✅ Responsive UI

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- Ensure PostgreSQL database is accessible
- Set all environment variables
- Build and deploy using platform-specific instructions
