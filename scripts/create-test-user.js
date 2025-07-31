const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users } = require('../src/lib/schema');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create database connection
    const client = postgres(process.env.POSTGRES_URL);
    const db = drizzle(client);
    
    // Test user credentials
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(testUser.password, 12);

    // Insert the user into the database
    const [newUser] = await db.insert(users).values({
      email: testUser.email,
      password: hashedPassword,
      name: testUser.name,
    }).returning();

    console.log('✅ Test user created successfully!');
    console.log('User ID:', newUser.id);
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    console.log('\nYou can now log in with these credentials!');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser(); 