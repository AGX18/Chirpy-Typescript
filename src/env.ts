import { config } from "dotenv";
import { z } from "zod";

// Determine application stage
process.env.APP_STAGE = process.env.APP_STAGE || "dev";

const isProduction = process.env.APP_STAGE === "production";
const isDevelopment = process.env.APP_STAGE === "dev";
const isTesting = process.env.APP_STAGE === "test";

if (isDevelopment) {
  config({ path: ".env" }); // or .env.local
} else if (isTesting) {
  config({ path: ".env.test" });
}

// Define validation schema with Zod
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  APP_STAGE: z.enum(["dev", "production", "test"]).default("dev"),

  // Server configuration
  PORT: z.coerce.number().positive().default(3000),
  HOST: z.string().default("localhost"),

  // Database
  DB_URL: z.string().startsWith("postgresql://"),
  DB_POOL_MIN: z.coerce.number().min(0).default(2),
  DB_POOL_MAX: z.coerce.number().positive().default(10),

  // JWT & Authentication
  //   JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  //   JWT_EXPIRES_IN: z.string().default('7d'),
  //   REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
  //   REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

  // Security
  //   BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),

  // CORS configuration
  //   CORS_ORIGIN: z
  //     .string()
  //     .or(z.array(z.string()))
  //     .transform((val) => {
  //       if (typeof val === 'string') {
  //         return val.split(',').map((origin) => origin.trim())
  //       }
  //       return val
  //     })
  //     .default([]),

  // Logging
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug", "trace"])
    .default(isProduction ? "info" : "debug"),
});

// Type inference from schema
export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log("Invalid env var");
    console.error(JSON.stringify(z.treeifyError(e).errors, null, 2));

    e.issues.forEach((err) => {
      const path = err.path.join(".");
      console.log(`${path}: ${err.message}`);
    });

    process.exit(1);
  }

  throw e;
}

export const isProd = () => env.APP_STAGE === "production";
export const isDev = () => env.APP_STAGE === "dev";
export const isTest = () => env.APP_STAGE === "test";

export { env };
export default env;
