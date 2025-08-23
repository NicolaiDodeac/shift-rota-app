// app/api/summary/confirm/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, resetPrismaClient } from "@/lib/db";
import { getOrCreateUserByEmail } from "@/lib/users";
import { z } from "zod";

const Payload = z.object({
  weekStartISO: z.string(),
  weekEndISO: z.string(),
  scheduledMinutes: z.number(),
  basicMinutes: z.number(),
  overtimeMinutes: z.number(),
  bankedMinutes: z.number(),
  isManualOverride: z.boolean().optional(),
});

// Helper function to handle Prisma connection errors
async function withConnectionRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // If it's a connection error, try resetting the connection
    if (error?.message?.includes('prepared statement') || error?.code === '26000') {
      console.log('Resetting Prisma client due to connection error...');
      await resetPrismaClient();
      return await operation();
    } else {
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const email = session.user.email;
    
    // Try to get user with connection reset on error
    let user;
    try {
      user = await getOrCreateUserByEmail(email);
    } catch (dbError: any) {
      // If it's a connection error, try resetting the connection
      if (dbError?.message?.includes('prepared statement') || dbError?.code === '26000') {
        console.log('Resetting Prisma client due to connection error...');
        await resetPrismaClient();
        user = await getOrCreateUserByEmail(email);
      } else {
        throw dbError;
      }
    }

    const body = await req.json().catch(() => null);
    const parsed = Payload.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

    const {
      weekStartISO,
      weekEndISO,
      scheduledMinutes,
      basicMinutes,
      overtimeMinutes,
      bankedMinutes,
    } = parsed.data;

    // Use connection retry for the upsert operation
    const row = await withConnectionRetry(async () => {
      return await prisma.weekLedger.upsert({
        where: {
          userId_weekStartUTC: {
            userId: user.id,
            weekStartUTC: new Date(weekStartISO),
          },
        },
        create: {
          userId: user.id,
          weekStartUTC: new Date(weekStartISO),
          weekEndUTC: new Date(weekEndISO),
          scheduledMin: scheduledMinutes,
          basicMin: basicMinutes,
          overtimeMin: overtimeMinutes,
          bankedMin: bankedMinutes,
          confirmed: true,
        },
        update: {
          scheduledMin: scheduledMinutes,
          basicMin: basicMinutes,
          overtimeMin: overtimeMinutes,
          bankedMin: bankedMinutes,
          confirmed: true,
        },
      });
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (error: any) {
    console.error("Error in summary confirm route:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      name: error?.name
    });
    return NextResponse.json(
      { 
        message: "Internal server error",
        details: String(error?.message || error),
        errorType: error?.name,
        errorCode: error?.code
      },
      { status: 500 }
    );
  }
}
