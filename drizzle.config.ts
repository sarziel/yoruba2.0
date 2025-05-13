
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: "postgresql://postgres:BRIHfNrYSvhUDVayulkxWVMreiRJgCMJ@trolley.proxy.rlwy.net:57071/railway"
  },
});
