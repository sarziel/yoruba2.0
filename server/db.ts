
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: "postgresql://postgres:RFaDADzdaiCUdmPojnLBdUaKLTGEwXGa@postgres-973a9ef1.railway.internal:5432/railway"
});

export const db = drizzle(pool, { schema });
