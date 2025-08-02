require('dotenv').config({ path: '.env.local' });
const { db } = require('../src/lib/db.ts');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection and new tables...');
    
    // Test connection by querying the new tables
    const teamTemplates = await db.select().from(require('../src/lib/schema').teamTemplates).limit(1);
    console.log('✅ team_templates table exists and is accessible');
    
    const templateFeedback = await db.select().from(require('../src/lib/schema').templateFeedback).limit(1);
    console.log('✅ template_feedback table exists and is accessible');
    
    const templateFavorites = await db.select().from(require('../src/lib/schema').templateFavorites).limit(1);
    console.log('✅ template_favorites table exists and is accessible');
    
    console.log('🎉 All new tables are successfully created and accessible!');
    console.log('📊 Migration status: COMPLETE');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase(); 