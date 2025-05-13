
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: "postgresql://postgres:RFaDADzdaiCUdmPojnLBdUaKLTGEwXGa@nozomi.proxy.rlwy.net:43010/railway"
});

export const db = drizzle(pool, { schema });
