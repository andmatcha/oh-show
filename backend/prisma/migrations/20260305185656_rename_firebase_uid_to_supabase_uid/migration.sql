/*
  Warnings:
  - You are about to rename the column `firebase_uid` to `supabase_uid` on the `users` table. 
  - All existing data will be preserved.
*/

-- 1. カラム名を変更
ALTER TABLE "users" RENAME COLUMN "firebase_uid" TO "supabase_uid";

-- 2. インデックス名を変更
ALTER INDEX "users_firebase_uid_key" RENAME TO "users_supabase_uid_key";
