const { Client } = require('pg');

async function migrateProduction() {
  // Get the production database URL from environment
  const databaseUrl = process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.error('❌ POSTGRES_URL environment variable not found');
    console.log('Please set your production database URL and run again');
    return;
  }

  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Create checklist_instances table
    console.log('Creating checklist_instances table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        template_id UUID NOT NULL,
        user_id UUID NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
        started_at TIMESTAMP DEFAULT now() NOT NULL,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        CONSTRAINT checklist_instances_template_id_checklist_templates_id_fk 
          FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE,
        CONSTRAINT checklist_instances_user_id_users_id_fk 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create checklist_instance_steps table
    console.log('Creating checklist_instance_steps table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_instance_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        instance_id UUID NOT NULL,
        step_id UUID NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        CONSTRAINT checklist_instance_steps_instance_id_checklist_instances_id_fk 
          FOREIGN KEY (instance_id) REFERENCES checklist_instances(id) ON DELETE CASCADE,
        CONSTRAINT checklist_instance_steps_step_id_checklist_steps_id_fk 
          FOREIGN KEY (step_id) REFERENCES checklist_steps(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ Migration completed successfully!');
    console.log('The new tables have been created in your production database.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

migrateProduction(); 