import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { ENV } from "varlock/env";
import path from "node:path";

export const db = drizzle(ENV.DATABASE_URL);

// Run migrations once on application startup
export async function runMigrations() {
  try {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    console.log("🔄 Running database migrations from:", migrationsFolder);
    await migrate(db, { migrationsFolder });
    console.log("✅ Database migrations completed successfully");
  } catch (err) {
    console.error("❌ Failed to run database migrations:", err);
  }
}
