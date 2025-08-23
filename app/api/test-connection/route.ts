import { NextResponse } from "next/server";
import { prisma, checkConnectionHealth, resetPrismaClient } from "@/lib/db";

export async function GET() {
  try {
    // Test basic connection
    const isHealthy = await checkConnectionHealth();
    
    if (!isHealthy) {
      // Try to reset the connection
      console.log('Connection unhealthy, attempting reset...');
      await resetPrismaClient();
      
      // Test again after reset
      const isHealthyAfterReset = await checkConnectionHealth();
      
      return NextResponse.json({
        status: isHealthyAfterReset ? 'recovered' : 'failed',
        message: isHealthyAfterReset 
          ? 'Connection recovered after reset' 
          : 'Connection failed even after reset',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Database connection is working properly',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Connection test failed',
      error: error?.message || String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
