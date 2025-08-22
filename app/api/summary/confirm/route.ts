// app/api/summary/confirm/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getOrCreateUserByEmail } from "@/lib/users";
import { z } from "zod";

const Payload = z.object({
  weekStartISO: z.string(),
  weekEndISO: z.string(),
  scheduledMinutes: z.number(),
  basicMinutes: z.number(),
  overtimeMinutes: z.number(),
  bankedMinutes: z.number(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const user = await getOrCreateUserByEmail(email);

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

  const row = await prisma.weekLedger.upsert({
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

  return NextResponse.json({ ok: true, id: row.id });
}
