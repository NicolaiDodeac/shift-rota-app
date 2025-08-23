import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      authenticated: !!session?.user,
      user: session?.user ? {
        email: session.user.email,
        name: session.user.name,
        hasAccessToken: !!(session as any).accessToken,
        hasRefreshToken: !!(session as any).refreshToken,
        expiresAt: (session as any).expiresAt,
        error: (session as any).error
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      authenticated: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
