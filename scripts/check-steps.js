const { Client } = require('pg');

async function checkSteps() {
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

    // Check checklist instances
    const instances = await client.query(`
      SELECT id, template_id, user_id, status, started_at 
      FROM checklist_instances 
      ORDER BY started_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Recent Checklist Instances:');
    instances.rows.forEach((instance, index) => {
      console.log(`${index + 1}. Instance ID: ${instance.id}`);
      console.log(`   Template ID: ${instance.template_id}`);
      console.log(`   Status: ${instance.status}`);
      console.log(`   Started: ${instance.started_at}`);
    });

    // Check instance steps
    if (instances.rows.length > 0) {
      const latestInstanceId = instances.rows[0].id;
      console.log(`\n🔍 Steps for latest instance (${latestInstanceId}):`);
      
      const steps = await client.query(`
        SELECT cis.instance_id, cis.step_id, cis.is_completed, cs.step_text, cs.order_index
        FROM checklist_instance_steps cis
        JOIN checklist_steps cs ON cis.step_id = cs.id
        WHERE cis.instance_id = $1
        ORDER BY cs.order_index
      `, [latestInstanceId]);
      
      steps.rows.forEach((step, index) => {
        console.log(`${index + 1}. Step ID: ${step.step_id}`);
        console.log(`   Text: ${step.step_text}`);
        console.log(`   Order: ${step.order_index}`);
        console.log(`   Completed: ${step.is_completed}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking steps:', error);
  } finally {
    await client.end();
  }
}

checkSteps(); 