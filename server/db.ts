
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

const pool = new Pool({
  connectionString: "postgresql://postgres:BRIHfNrYSvhUDVayulkxWVMreiRJgCMJ@trolley.proxy.rlwy.net:57071/railway"
});

export const db = drizzle(pool, { schema });
