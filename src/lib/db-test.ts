import { db } from './db';

// Simple database connectivity test
export async function testDatabaseConnection() {
  try {
    // Test the connection with a simple query
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
} 