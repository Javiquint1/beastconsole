import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  if (sqlClient) return sqlClient;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }
  sqlClient = neon(databaseUrl);
  return sqlClient;
}
