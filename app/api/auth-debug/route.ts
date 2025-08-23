import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    trustHost: process.env.AUTH_TRUST_HOST,
    timestamp: new Date().toISOString()
  });
}
