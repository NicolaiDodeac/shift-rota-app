import { prisma } from "./db";

export async function getOrCreateUserByEmail(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}
