import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { env } from "../env.js";

const conn = postgres(env.DB_URL);
export const db = drizzle(conn, { schema });
