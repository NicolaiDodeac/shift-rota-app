#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Migrating to Supabase Database\n');

// Check if environment variables are set
const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these variables in your .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables found');

try {
  // Generate Prisma client
  console.log('\n📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema to Supabase
  console.log('\n🗄️  Pushing schema to Supabase...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Verify connection
  console.log('\n🔍 Verifying database connection...');
  execSync('npx prisma db pull', { stdio: 'inherit' });
  
  console.log('\n✅ Migration completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Test your application locally: npm run dev');
  console.log('2. Deploy to Vercel with the same environment variables');
  console.log('3. Monitor your Supabase dashboard for database activity');
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
