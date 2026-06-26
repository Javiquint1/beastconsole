import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

async function loadLocalEnv() {
  try {
    const envFile = await readFile(resolve(".env.local"), "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  } catch {
    // Vercel and CI provide DATABASE_URL through the environment.
  }
}

function splitStatements(sql) {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

await loadLocalEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing.");
}

const sql = neon(process.env.DATABASE_URL);
const migrationFiles = (await readdir(resolve("migrations")))
  .filter((file) => /^\d+_hubspot_.*\.sql$/.test(file))
  .sort();

for (const file of migrationFiles) {
  const migration = await readFile(resolve("migrations", file), "utf8");
  for (const statement of splitStatements(migration)) {
    await sql.query(statement);
  }
}

console.log(`HubSpot migrations applied: ${migrationFiles.join(", ")}`);
