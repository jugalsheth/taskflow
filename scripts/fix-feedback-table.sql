-- Fix template_feedback table to allow nullable team_id
ALTER TABLE template_feedback ALTER COLUMN team_id DROP NOT NULL; 