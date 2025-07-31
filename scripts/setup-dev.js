const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TaskFlow development environment...\n');

// Step 1: Start PostgreSQL with Docker
console.log('1. Starting PostgreSQL database with Docker...');
try {
  execSync('docker-compose up -d postgres', { stdio: 'inherit' });
  console.log('✅ PostgreSQL started successfully');
} catch (error) {
  console.log('❌ Failed to start PostgreSQL. Make sure Docker is running.');
  process.exit(1);
}

// Step 2: Wait for database to be ready
console.log('\n2. Waiting for database to be ready...');
setTimeout(() => {
  console.log('✅ Database should be ready now');
}, 3000);

// Step 3: Create .env.local if it doesn't exist
console.log('\n3. Setting up environment variables...');
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = `# Database Configuration (Local Docker)
POSTGRES_URL="postgresql://postgres:password@localhost:5432/taskflow"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this-in-production"
AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with local database configuration');
} else {
  console.log('✅ .env.local already exists');
}

// Step 4: Instructions
console.log('\n4. Next steps:');
console.log('   - Run: npm run db:push (to create database tables)');
console.log('   - Run: npm run dev (to start the development server)');
console.log('   - Visit: http://localhost:3000');
console.log('   - Sign up with a new account or use the test credentials:');
console.log('     Email: test@example.com');
console.log('     Password: password123');

console.log('\n🎉 Setup complete! Follow the next steps above to get started.'); 