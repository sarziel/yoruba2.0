
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: "postgresql://postgres:RFaDADzdaiCUdmPojnLBdUaKLTGEwXGa@nozomi.proxy.rlwy.net:43010/railway"
  },
});
