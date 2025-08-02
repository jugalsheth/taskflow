require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error('❌ No database URL found');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: false });

const fixSQL = `
-- Fix template_feedback table to allow nullable team_id
ALTER TABLE template_feedback ALTER COLUMN team_id DROP NOT NULL;
`;

async function fixFeedbackTable() {
  try {
    console.log('🔄 Fixing template_feedback table...');
    
    await sql.unsafe(fixSQL);
    
    console.log('✅ template_feedback table fixed successfully!');
    
    // Verify the fix
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'template_feedback' AND column_name = 'team_id';
    `;
    
    console.log('Verification - team_id column:');
    console.log(`  ${columns[0].column_name}: ${columns[0].data_type} (nullable: ${columns[0].is_nullable})`);
    
  } catch (error) {
    console.error('❌ Error fixing feedback table:', error);
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

fixFeedbackTable(); 