const bcrypt = require('bcryptjs');

// This script can be used to create a test user when the database is available
// Run with: node scripts/setup-test-user.js

async function createTestUser() {
  try {
    // Test user credentials
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(testUser.password, 12);

    console.log('Test user credentials:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    console.log('Hashed password:', hashedPassword);
    console.log('\nYou can use these credentials to test the login functionality.');
    console.log('Make sure to insert this user into your database when it\'s available.');

  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser(); 