import type { MigrationConfig } from "drizzle-orm/migrator";
import { env } from "./env.js";
type DBConfig = {
  migrationConfig: MigrationConfig;
  DB_URL: String;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/database/migrations",
};

type APIConfig = {
  fileserverHits: number;
  db: DBConfig;
};

export let config: APIConfig = {
  fileserverHits: 0,
  db: {
    migrationConfig: migrationConfig,
    DB_URL: env.DB_URL,
  },
};
