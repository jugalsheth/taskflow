require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

// Get database URL from environment
const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('❌ No database URL found in environment variables');
  process.exit(1);
}

// Create postgres client
const sql = postgres(databaseUrl, {
  ssl: false
});

const createTablesSQL = `
-- Create missing tables for team template sharing functionality

-- 1. Create team_templates table
CREATE TABLE IF NOT EXISTS "team_templates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "team_id" uuid NOT NULL,
    "template_id" uuid NOT NULL,
    "shared_by" uuid NOT NULL,
    "shared_at" timestamp NOT NULL,
    "is_official" boolean DEFAULT false NOT NULL,
    "status" varchar(50) DEFAULT 'active' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 2. Create template_favorites table
CREATE TABLE IF NOT EXISTS "template_favorites" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "template_id" uuid NOT NULL,
    "team_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- 3. Create template_feedback table
CREATE TABLE IF NOT EXISTS "template_feedback" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "template_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "team_id" uuid NOT NULL,
    "comment" text NOT NULL,
    "rating" integer,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- 4. Add foreign key constraints
ALTER TABLE "team_templates" ADD CONSTRAINT "team_templates_team_id_teams_id_fk" 
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "team_templates" ADD CONSTRAINT "team_templates_template_id_checklist_templates_id_fk" 
    FOREIGN KEY ("template_id") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "team_templates" ADD CONSTRAINT "team_templates_shared_by_users_id_fk" 
    FOREIGN KEY ("shared_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "template_favorites" ADD CONSTRAINT "template_favorites_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "template_favorites" ADD CONSTRAINT "template_favorites_template_id_checklist_templates_id_fk" 
    FOREIGN KEY ("template_id") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "template_favorites" ADD CONSTRAINT "template_favorites_team_id_teams_id_fk" 
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "template_feedback" ADD CONSTRAINT "template_feedback_template_id_checklist_templates_id_fk" 
    FOREIGN KEY ("template_id") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "template_feedback" ADD CONSTRAINT "template_feedback_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "template_feedback" ADD CONSTRAINT "template_feedback_team_id_teams_id_fk" 
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 5. Add unique constraints
ALTER TABLE "template_favorites" ADD CONSTRAINT "template_favorites_user_template_unique" 
    UNIQUE ("user_id", "template_id");

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS "team_templates_team_id_idx" ON "team_templates" ("team_id");
CREATE INDEX IF NOT EXISTS "team_templates_template_id_idx" ON "team_templates" ("template_id");
CREATE INDEX IF NOT EXISTS "template_favorites_user_id_idx" ON "template_favorites" ("user_id");
CREATE INDEX IF NOT EXISTS "template_favorites_template_id_idx" ON "template_favorites" ("template_id");
CREATE INDEX IF NOT EXISTS "template_feedback_template_id_idx" ON "template_feedback" ("template_id");
CREATE INDEX IF NOT EXISTS "template_feedback_user_id_idx" ON "template_feedback" ("user_id");
`;

async function createTables() {
  try {
    console.log('🔄 Creating missing tables...');
    console.log('📡 Connecting to database...');
    
    // Execute the SQL
    await sql.unsafe(createTablesSQL);
    
    console.log('✅ Tables created successfully!');
    console.log('📊 Created tables:');
    console.log('   - team_templates');
    console.log('   - template_favorites');
    console.log('   - template_feedback');
    console.log('   - All foreign key constraints');
    console.log('   - All indexes');
    
    // Close the connection
    await sql.end();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    await sql.end();
    process.exit(1);
  }
}

createTables(); 