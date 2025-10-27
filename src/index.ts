import { env } from "./env.js";
import app from "./server.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";

const migrationClient = postgres(env.DB_URL, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
// Start the server
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
