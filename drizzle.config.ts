import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: "postgresql://postgres:RFaDADzdaiCUdmPojnLBdUaKLTGEwXGa@postgres-973a9ef1.railway.internal:5432/railway"
  },
});