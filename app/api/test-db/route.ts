import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Test a simple query
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: "connected",
      message: "Database connection successful",
      userCount,
      database: process.env.DATABASE_URL?.includes('supabase') ? 'Supabase' : 'Unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Database connection test failed:", error);
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
