const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function updateProdUser() {
  // Use the production database connection
  const databaseUrl = "postgres://postgres.iipchetqlejaqwevnisj:iseMGnucmUjBbsJs@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require";
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Update user credentials - CHANGE THIS PASSWORD
    const testUser = {
      email: 'jugalsheth113@gmail.com',
      password: 'your-actual-password-here', // CHANGE THIS
      name: 'Jugal Sheth'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(testUser.password, 12);

    // Update the user's password
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id',
      [hashedPassword, testUser.email]
    );

    if (result.rows.length > 0) {
      console.log('✅ User password updated successfully!');
      console.log('User ID:', result.rows[0].id);
      console.log('Email:', testUser.email);
      console.log('New Password:', testUser.password);
    } else {
      console.log('❌ User not found');
    }

    console.log('\nYou can now log in with these credentials!');

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await client.end();
  }
}

updateProdUser(); 