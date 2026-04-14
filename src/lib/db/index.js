import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon('postgresql://neondb_owner:npg_9XNPQdgFx8ZV@ep-dark-haze-a1i9o7s8.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
export const db = drizzle(sql);