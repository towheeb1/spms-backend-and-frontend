// backend/src/utils/migrations.js
import fs from "fs/promises";
import path from "path";
import { pool } from "../db.js";

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(200) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_schema_migrations_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function isApplied(filename) {
  const [rows] = await pool.query(`SELECT 1 FROM schema_migrations WHERE filename=? LIMIT 1`, [filename]);
  return rows.length > 0;
}

function splitSql(sql) {
  // naive splitter on ';' at EOL; ignores semicolons inside strings for simplicity of our migrations
  return sql
    .split(/;\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function runMigrationsSequential(filepaths) {
  await ensureMigrationsTable();
  for (const fp of filepaths) {
    const filename = path.basename(fp);
    if (await isApplied(filename)) continue;
    try {
      const sql = await fs.readFile(fp, "utf8");
      const statements = splitSql(sql);
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        for (const stmt of statements) {
          try {
            if (stmt) await conn.query(stmt);
          } catch (e) {
            // ignore benign migration errors to keep idempotency (e.g., duplicate column)
            const msg = String(e?.message || "");
            if (/duplicate|exists|unknown collation/i.test(msg)) continue;
            throw e;
          }
        }
        await conn.query(`INSERT INTO schema_migrations (filename) VALUES (?)`, [filename]);
        await conn.commit();
        console.log(`✅ Migration applied: ${filename}`);
      } catch (e) {
        await conn.rollback();
        console.error(`❌ Migration failed: ${filename}`, e.message);
        throw e;
      } finally {
        conn.release();
      }
    } catch (e) {
      // bubble up to stop boot to avoid inconsistent schema
      throw e;
    }
  }
}
