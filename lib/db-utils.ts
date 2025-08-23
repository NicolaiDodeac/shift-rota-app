import { prisma, resetPrismaClient } from './db';

// Wrapper function for database operations that handles connection errors
export async function withConnectionRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection error
      const isConnectionError = 
        error?.message?.includes('prepared statement') || 
        error?.code === '26000' ||
        error?.code === '42P05' ||
        error?.name === 'PrismaClientKnownRequestError' ||
        error?.name === 'PrismaClientUnknownRequestError';
      
      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error on attempt ${attempt + 1}, resetting connection...`);
        try {
          await resetPrismaClient();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (resetError) {
          console.error('Failed to reset connection:', resetError);
          break;
        }
      } else {
        break;
      }
    }
  }
  
  throw lastError;
}

// Specific wrapper for findMany operations
export async function findManyWithRetry<T>(
  model: any,
  options: any,
  maxRetries: number = 1
): Promise<T[]> {
  return withConnectionRetry(() => model.findMany(options), maxRetries);
}

// Specific wrapper for findUnique operations
export async function findUniqueWithRetry<T>(
  model: any,
  options: any,
  maxRetries: number = 1
): Promise<T | null> {
  return withConnectionRetry(() => model.findUnique(options), maxRetries);
}

// Specific wrapper for upsert operations
export async function upsertWithRetry<T>(
  model: any,
  options: any,
  maxRetries: number = 1
): Promise<T> {
  return withConnectionRetry(() => model.upsert(options), maxRetries);
}

// Specific wrapper for create operations
export async function createWithRetry<T>(
  model: any,
  options: any,
  maxRetries: number = 1
): Promise<T> {
  return withConnectionRetry(() => model.create(options), maxRetries);
}

// Specific wrapper for update operations
export async function updateWithRetry<T>(
  model: any,
  options: any,
  maxRetries: number = 1
): Promise<T> {
  return withConnectionRetry(() => model.update(options), maxRetries);
}
