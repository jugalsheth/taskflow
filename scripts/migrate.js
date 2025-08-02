require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

console.log('🔄 Running database migration...');

// Get the database URL and modify it to disable SSL verification for migration
const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
const migrationUrl = dbUrl.replace('sslmode=require', 'sslmode=no-verify');

console.log('Using database URL for migration...');

try {
  // Run the migration with modified environment
  execSync('npx drizzle-kit migrate', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      POSTGRES_URL: migrationUrl,
      POSTGRES_URL_NON_POOLING: migrationUrl
    }
  });
  console.log('✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} 