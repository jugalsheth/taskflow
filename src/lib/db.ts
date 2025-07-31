import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './config';
import * as schema from './schema';

// Create the postgres client
const client = postgres(config.database.url);

// Create the drizzle database instance
export const db = drizzle(client, { schema }); 