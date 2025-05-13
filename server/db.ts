
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: "mysql://256oyNM9CDrup8u.root:PASSWORD@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/test"
});

export const db = drizzle(pool, { schema });
