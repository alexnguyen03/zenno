import "dotenv/config"
import pg from "pg"

const url = process.env.DATABASE_URL!
console.log("Testing:", url.replace(/:([^:@]+)@/, ":***@"))

const client = new pg.Client({ connectionString: url })
try {
  await client.connect()
  const r = await client.query("SELECT version()")
  console.log("✓ Connected:", r.rows[0].version.split(" ").slice(0, 2).join(" "))
  await client.end()
} catch (e: any) {
  console.error("✗ Failed:", e.message)
  process.exit(1)
}
