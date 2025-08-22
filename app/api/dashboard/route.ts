import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getOrCreateUserByEmail } from "@/lib/users";
import { currentContractYearStart } from "@/lib/time";
import { computeYearTargetHours } from "@/lib/annualised";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const user = await getOrCreateUserByEmail(email);
    const settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    const tz = settings?.tz || "Europe/London";
    const cyStart = settings?.contractYearStart
      ? settings.contractYearStart
      : currentContractYearStart(tz).toUTC().toJSDate();

    const cyEnd = new Date(new Date(cyStart).getTime());
    cyEnd.setUTCFullYear(cyEnd.getUTCFullYear() + 1);

    const confirmedWeeks = await prisma.weekLedger.findMany({
      where: {
        userId: user.id,
        weekStartUTC: { gte: cyStart, lt: cyEnd },
        confirmed: true,
      },
    });

    const basicMin = confirmedWeeks.reduce((a, r) => a + r.basicMin, 0);
    const overtimeMin = confirmedWeeks.reduce((a, r) => a + r.overtimeMin, 0);
    const bankedMin = confirmedWeeks.reduce((a, r) => a + r.bankedMin, 0);

    const targetHours = computeYearTargetHours(
      (settings?.employmentStart ?? cyStart).toISOString(),
      cyStart.toISOString()
    );

    return NextResponse.json({
      tz,
      contractYearStartISO: cyStart.toISOString(),
      targetHours,
      basicHours: +(basicMin / 60).toFixed(1),
      overtimeHours: +(overtimeMin / 60).toFixed(1),
      bankedHours: +(bankedMin / 60).toFixed(1),
      balanceHours: +(targetHours - bankedMin / 60).toFixed(1),
      confirmedWeeks: confirmedWeeks.length,
    });
  } catch (error) {
    console.error("Error in dashboard route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
