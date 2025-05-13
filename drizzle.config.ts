import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: "mysql://256oyNM9CDrup8u.root:PASSWORD@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/test"
  },
});