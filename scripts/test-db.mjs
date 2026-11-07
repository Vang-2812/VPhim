import pg from "pg";
import { readFile, readdir } from "node:fs/promises";
if (
  !process.env.TEST_DATABASE_URL ||
  process.env.VPHIM_ALLOW_DB_TESTS !== "1"
) {
  console.error(
    "Chưa cấu hình TEST_DATABASE_URL và VPHIM_ALLOW_DB_TESTS=1 cho database TEST riêng. Không chạy SQL trên dữ liệu thật.",
  );
  process.exit(1);
}
const client = new pg.Client({
  connectionString: process.env.TEST_DATABASE_URL,
});
await client.connect();
try {
  for (const file of (await readdir("supabase/tests"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await client.query("BEGIN");
    try {
      await client.query(await readFile("supabase/tests/" + file, "utf8"));
      console.log("PASS " + file);
    } finally {
      await client.query("ROLLBACK");
    }
  }
} finally {
  await client.end();
}
