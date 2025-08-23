import { prisma } from "./db";

export async function getOrCreateUserByEmail(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}

export async function getOrCreateUserSettings(userId: string) {
  return prisma.settings.upsert({
    where: { userId },
    update: {},
    create: { 
      userId,
      tz: "Europe/London",
      contractYearStart: new Date(),
      employmentStart: new Date(),
    },
  });
}
