require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error('❌ No database URL found');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: false });

async function testFeedback() {
  try {
    console.log('🔄 Testing template_feedback table...');
    
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'template_feedback'
      );
    `;
    
    console.log('Table exists:', tableExists[0].exists);
    
    if (!tableExists[0].exists) {
      console.log('❌ template_feedback table does not exist');
      return;
    }
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'template_feedback'
      ORDER BY ordinal_position;
    `;
    
    console.log('Table columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if we can insert a test record
    console.log('🔄 Testing insert...');
    
    const testData = {
      templateId: '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      teamId: null,
      comment: 'Test comment',
      rating: 5
    };
    
    console.log('Test data:', testData);
    
    const result = await sql`
      INSERT INTO template_feedback (template_id, user_id, team_id, comment, rating)
      VALUES (${testData.templateId}, ${testData.userId}, ${testData.teamId}, ${testData.comment}, ${testData.rating})
      RETURNING *;
    `;
    
    console.log('✅ Insert successful:', result[0]);
    
    // Clean up test data
    await sql`
      DELETE FROM template_feedback 
      WHERE template_id = ${testData.templateId} AND user_id = ${testData.userId};
    `;
    
    console.log('✅ Test cleanup completed');
    
  } catch (error) {
    console.error('❌ Error testing feedback:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    await sql.end();
  }
}

testFeedback(); 