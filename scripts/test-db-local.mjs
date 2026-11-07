import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
const db = new PGlite();
await db.exec(
  `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}',created_at timestamptz default now());create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;grant usage on schema public,auth,storage to anon,authenticated,service_role;grant select,insert,update,delete on storage.objects to authenticated;`,
);
try {
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
  for (const file of (await readdir("supabase/tests"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await db.exec("BEGIN");
    try {
      await db.exec(await readFile("supabase/tests/" + file, "utf8"));
      console.log("PASS " + file);
    } finally {
      await db.exec("ROLLBACK");
    }
  }
} finally {
  await db.close();
}
console.log(
  "Local PostgreSQL/RLS contracts passed; hosted Supabase Auth/Storage integration is not tested by this runner.",
);
