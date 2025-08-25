import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DateTime } from "luxon";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        shiftInstances: {
          orderBy: { startUTC: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const shifts = user.shiftInstances;
    
    // Group shifts by day and time to find duplicates
    const shiftGroups: Record<string, any[]> = {};
    
    shifts.forEach(shift => {
      const startDate = DateTime.fromJSDate(shift.startUTC).setZone('Europe/London');
      const endDate = DateTime.fromJSDate(shift.endUTC).setZone('Europe/London');
      
      // Create a key based on start time and duration to identify duplicates
      const key = `${startDate.toFormat('yyyy-MM-dd HH:mm')}-${shift.scheduledMin}`;
      
      if (!shiftGroups[key]) {
        shiftGroups[key] = [];
      }
      shiftGroups[key].push(shift);
    });

    // Find duplicates (shifts with the same start time and duration)
    const duplicates = Object.entries(shiftGroups)
      .filter(([key, group]) => group.length > 1)
      .map(([key, group]) => ({
        key,
        shifts: group,
        count: group.length
      }));

    // Keep the first shift from each duplicate group, delete the rest
    let deletedCount = 0;
    for (const duplicate of duplicates) {
      // Keep the first shift, delete the rest
      const shiftsToDelete = duplicate.shifts.slice(1);
      
      for (const shift of shiftsToDelete) {
        await prisma.shiftInstance.delete({
          where: { id: shift.id }
        });
        deletedCount++;
      }
    }

    return NextResponse.json({
      message: `Cleanup completed`,
      totalShiftsBefore: shifts.length,
      totalShiftsAfter: shifts.length - deletedCount,
      duplicatesFound: duplicates.length,
      shiftsDeleted: deletedCount,
      duplicates: duplicates.map(d => ({
        key: d.key,
        count: d.count,
        shifts: d.shifts.map(s => ({
          id: s.id,
          startUTC: s.startUTC,
          scheduledMin: s.scheduledMin
        }))
      }))
    });

  } catch (error) {
    console.error('Cleanup shifts error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
