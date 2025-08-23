import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

// Function to create a new Prisma client
function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

// Function to reset the Prisma client
async function resetPrismaClient() {
  try {
    if (globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect();
    }
  } catch (error) {
    console.log('Error disconnecting Prisma client:', error);
  }
  
  try {
    globalForPrisma.prisma = createPrismaClient();
    // Test the connection
    await globalForPrisma.prisma.$connect();
    // Update the exported prisma variable
    prisma = globalForPrisma.prisma;
    console.log('Prisma client reset successfully');
    return globalForPrisma.prisma;
  } catch (error) {
    console.error('Error creating new Prisma client:', error);
    throw error;
  }
}

// Initialize the Prisma client
export let prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Update the exported prisma variable when resetting
export function updatePrismaInstance() {
  prisma = globalForPrisma.prisma!;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle SIGINT and SIGTERM for proper cleanup
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Function to check database connection health
async function checkConnectionHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection health check failed:', error);
    return false;
  }
}

// Export the reset function for use in API routes
export { resetPrismaClient, checkConnectionHealth };

// For serverless environments, ensure proper connection handling
if (process.env.NODE_ENV === "production") {
  // Ensure connection is established
  await prisma.$connect();
}
