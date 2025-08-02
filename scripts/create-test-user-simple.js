const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5432/taskflow'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Test user credentials - Secure version
    const testUser = {
      email: 'admin@taskflow.dev',
      password: 'TaskFlow2024!@#',
      name: 'TaskFlow Admin'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(testUser.password, 12);

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [testUser.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Test user already exists!');
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
    } else {
      // Insert the user
      const result = await client.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
        [testUser.email, hashedPassword, testUser.name]
      );

      console.log('✅ Test user created successfully!');
      console.log('User ID:', result.rows[0].id);
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
    }

    console.log('\nYou can now log in with these credentials!');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await client.end();
  }
}

createTestUser(); 