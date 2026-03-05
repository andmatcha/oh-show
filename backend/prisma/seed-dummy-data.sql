-- ダミーユーザー10人と2026年3月のシフト希望を作成するSQL
-- このスクリプトは開発環境でのテスト用です

-- 10人のダミーユーザーを作成（firebaseUidはダミー値なのでログイン不可）
INSERT INTO users (id, firebase_uid, email, name, role, created_at, updated_at, is_deleted) VALUES
('dummy_user_01', 'dummy_firebase_uid_01', 'dummy01@example.com', '山田太郎', 'STAFF', NOW(), NOW(), false),
('dummy_user_02', 'dummy_firebase_uid_02', 'dummy02@example.com', '佐藤花子', 'STAFF', NOW(), NOW(), false),
('dummy_user_03', 'dummy_firebase_uid_03', 'dummy03@example.com', '鈴木一郎', 'STAFF', NOW(), NOW(), false),
('dummy_user_04', 'dummy_firebase_uid_04', 'dummy04@example.com', '田中美咲', 'STAFF', NOW(), NOW(), false),
('dummy_user_05', 'dummy_firebase_uid_05', 'dummy05@example.com', '伊藤健太', 'STAFF', NOW(), NOW(), false),
('dummy_user_06', 'dummy_firebase_uid_06', 'dummy06@example.com', '渡辺さくら', 'STAFF', NOW(), NOW(), false),
('dummy_user_07', 'dummy_firebase_uid_07', 'dummy07@example.com', '中村翔太', 'STAFF', NOW(), NOW(), false),
('dummy_user_08', 'dummy_firebase_uid_08', 'dummy08@example.com', '小林美優', 'STAFF', NOW(), NOW(), false),
('dummy_user_09', 'dummy_firebase_uid_09', 'dummy09@example.com', '加藤大輔', 'STAFF', NOW(), NOW(), false),
('dummy_user_10', 'dummy_firebase_uid_10', 'dummy10@example.com', '吉田愛美', 'STAFF', NOW(), NOW(), false);

-- 2026年3月のシフト希望を作成（月曜日を除く）
-- 各ユーザーごとに5〜15日の希望をランダムに設定

-- 山田太郎の希望（土日中心）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_01_01', 'dummy_user_01', '2026-03-01', NOW(), NOW()), -- 日
('req_01_02', 'dummy_user_01', '2026-03-06', NOW(), NOW()), -- 金
('req_01_03', 'dummy_user_01', '2026-03-07', NOW(), NOW()), -- 土
('req_01_04', 'dummy_user_01', '2026-03-08', NOW(), NOW()), -- 日
('req_01_05', 'dummy_user_01', '2026-03-13', NOW(), NOW()), -- 金
('req_01_06', 'dummy_user_01', '2026-03-14', NOW(), NOW()), -- 土
('req_01_07', 'dummy_user_01', '2026-03-15', NOW(), NOW()), -- 日
('req_01_08', 'dummy_user_01', '2026-03-20', NOW(), NOW()), -- 金
('req_01_09', 'dummy_user_01', '2026-03-21', NOW(), NOW()), -- 土
('req_01_10', 'dummy_user_01', '2026-03-22', NOW(), NOW()); -- 日

-- 佐藤花子の希望（平日中心）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_02_01', 'dummy_user_02', '2026-03-03', NOW(), NOW()), -- 火
('req_02_02', 'dummy_user_02', '2026-03-04', NOW(), NOW()), -- 水
('req_02_03', 'dummy_user_02', '2026-03-05', NOW(), NOW()), -- 木
('req_02_04', 'dummy_user_02', '2026-03-10', NOW(), NOW()), -- 火
('req_02_05', 'dummy_user_02', '2026-03-11', NOW(), NOW()), -- 水
('req_02_06', 'dummy_user_02', '2026-03-12', NOW(), NOW()), -- 木
('req_02_07', 'dummy_user_02', '2026-03-17', NOW(), NOW()), -- 火
('req_02_08', 'dummy_user_02', '2026-03-18', NOW(), NOW()), -- 水
('req_02_09', 'dummy_user_02', '2026-03-19', NOW(), NOW()), -- 木
('req_02_10', 'dummy_user_02', '2026-03-24', NOW(), NOW()), -- 火
('req_02_11', 'dummy_user_02', '2026-03-25', NOW(), NOW()), -- 水
('req_02_12', 'dummy_user_02', '2026-03-26', NOW(), NOW()); -- 木

-- 鈴木一郎の希望（バランス型）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_03_01', 'dummy_user_03', '2026-03-03', NOW(), NOW()),
('req_03_02', 'dummy_user_03', '2026-03-05', NOW(), NOW()),
('req_03_03', 'dummy_user_03', '2026-03-07', NOW(), NOW()),
('req_03_04', 'dummy_user_03', '2026-03-10', NOW(), NOW()),
('req_03_05', 'dummy_user_03', '2026-03-12', NOW(), NOW()),
('req_03_06', 'dummy_user_03', '2026-03-14', NOW(), NOW()),
('req_03_07', 'dummy_user_03', '2026-03-17', NOW(), NOW()),
('req_03_08', 'dummy_user_03', '2026-03-19', NOW(), NOW()),
('req_03_09', 'dummy_user_03', '2026-03-21', NOW(), NOW());

-- 田中美咲の希望（週末多め）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_04_01', 'dummy_user_04', '2026-03-01', NOW(), NOW()),
('req_04_02', 'dummy_user_04', '2026-03-06', NOW(), NOW()),
('req_04_03', 'dummy_user_04', '2026-03-07', NOW(), NOW()),
('req_04_04', 'dummy_user_04', '2026-03-08', NOW(), NOW()),
('req_04_05', 'dummy_user_04', '2026-03-13', NOW(), NOW()),
('req_04_06', 'dummy_user_04', '2026-03-14', NOW(), NOW()),
('req_04_07', 'dummy_user_04', '2026-03-15', NOW(), NOW()),
('req_04_08', 'dummy_user_04', '2026-03-20', NOW(), NOW()),
('req_04_09', 'dummy_user_04', '2026-03-21', NOW(), NOW()),
('req_04_10', 'dummy_user_04', '2026-03-22', NOW(), NOW()),
('req_04_11', 'dummy_user_04', '2026-03-27', NOW(), NOW()),
('req_04_12', 'dummy_user_04', '2026-03-28', NOW(), NOW());

-- 伊藤健太の希望（少なめ）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_05_01', 'dummy_user_05', '2026-03-04', NOW(), NOW()),
('req_05_02', 'dummy_user_05', '2026-03-11', NOW(), NOW()),
('req_05_03', 'dummy_user_05', '2026-03-18', NOW(), NOW()),
('req_05_04', 'dummy_user_05', '2026-03-25', NOW(), NOW()),
('req_05_05', 'dummy_user_05', '2026-03-28', NOW(), NOW());

-- 渡辺さくらの希望（多め）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_06_01', 'dummy_user_06', '2026-03-03', NOW(), NOW()),
('req_06_02', 'dummy_user_06', '2026-03-04', NOW(), NOW()),
('req_06_03', 'dummy_user_06', '2026-03-05', NOW(), NOW()),
('req_06_04', 'dummy_user_06', '2026-03-06', NOW(), NOW()),
('req_06_05', 'dummy_user_06', '2026-03-07', NOW(), NOW()),
('req_06_06', 'dummy_user_06', '2026-03-08', NOW(), NOW()),
('req_06_07', 'dummy_user_06', '2026-03-10', NOW(), NOW()),
('req_06_08', 'dummy_user_06', '2026-03-11', NOW(), NOW()),
('req_06_09', 'dummy_user_06', '2026-03-12', NOW(), NOW()),
('req_06_10', 'dummy_user_06', '2026-03-13', NOW(), NOW()),
('req_06_11', 'dummy_user_06', '2026-03-14', NOW(), NOW()),
('req_06_12', 'dummy_user_06', '2026-03-15', NOW(), NOW()),
('req_06_13', 'dummy_user_06', '2026-03-17', NOW(), NOW()),
('req_06_14', 'dummy_user_06', '2026-03-18', NOW(), NOW()),
('req_06_15', 'dummy_user_06', '2026-03-19', NOW(), NOW());

-- 中村翔太の希望（平日のみ）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_07_01', 'dummy_user_07', '2026-03-03', NOW(), NOW()),
('req_07_02', 'dummy_user_07', '2026-03-04', NOW(), NOW()),
('req_07_03', 'dummy_user_07', '2026-03-05', NOW(), NOW()),
('req_07_04', 'dummy_user_07', '2026-03-10', NOW(), NOW()),
('req_07_05', 'dummy_user_07', '2026-03-11', NOW(), NOW()),
('req_07_06', 'dummy_user_07', '2026-03-12', NOW(), NOW()),
('req_07_07', 'dummy_user_07', '2026-03-17', NOW(), NOW()),
('req_07_08', 'dummy_user_07', '2026-03-18', NOW(), NOW()),
('req_07_09', 'dummy_user_07', '2026-03-19', NOW(), NOW()),
('req_07_10', 'dummy_user_07', '2026-03-24', NOW(), NOW()),
('req_07_11', 'dummy_user_07', '2026-03-25', NOW(), NOW());

-- 小林美優の希望（バランス型）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_08_01', 'dummy_user_08', '2026-03-01', NOW(), NOW()),
('req_08_02', 'dummy_user_08', '2026-03-05', NOW(), NOW()),
('req_08_03', 'dummy_user_08', '2026-03-08', NOW(), NOW()),
('req_08_04', 'dummy_user_08', '2026-03-11', NOW(), NOW()),
('req_08_05', 'dummy_user_08', '2026-03-14', NOW(), NOW()),
('req_08_06', 'dummy_user_08', '2026-03-15', NOW(), NOW()),
('req_08_07', 'dummy_user_08', '2026-03-19', NOW(), NOW()),
('req_08_08', 'dummy_user_08', '2026-03-22', NOW(), NOW()),
('req_08_09', 'dummy_user_08', '2026-03-25', NOW(), NOW()),
('req_08_10', 'dummy_user_08', '2026-03-28', NOW(), NOW()),
('req_08_11', 'dummy_user_08', '2026-03-29', NOW(), NOW()), -- 日
('req_08_12', 'dummy_user_08', '2026-03-31', NOW(), NOW()); -- 火

-- 加藤大輔の希望（週末のみ）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_09_01', 'dummy_user_09', '2026-03-06', NOW(), NOW()),
('req_09_02', 'dummy_user_09', '2026-03-07', NOW(), NOW()),
('req_09_03', 'dummy_user_09', '2026-03-13', NOW(), NOW()),
('req_09_04', 'dummy_user_09', '2026-03-14', NOW(), NOW()),
('req_09_05', 'dummy_user_09', '2026-03-20', NOW(), NOW()),
('req_09_06', 'dummy_user_09', '2026-03-21', NOW(), NOW()),
('req_09_07', 'dummy_user_09', '2026-03-27', NOW(), NOW()),
('req_09_08', 'dummy_user_09', '2026-03-28', NOW(), NOW());

-- 吉田愛美の希望（バランス型）
INSERT INTO shift_requests (id, user_id, date, created_at, updated_at) VALUES
('req_10_01', 'dummy_user_10', '2026-03-04', NOW(), NOW()),
('req_10_02', 'dummy_user_10', '2026-03-06', NOW(), NOW()),
('req_10_03', 'dummy_user_10', '2026-03-08', NOW(), NOW()),
('req_10_04', 'dummy_user_10', '2026-03-11', NOW(), NOW()),
('req_10_05', 'dummy_user_10', '2026-03-13', NOW(), NOW()),
('req_10_06', 'dummy_user_10', '2026-03-15', NOW(), NOW()),
('req_10_07', 'dummy_user_10', '2026-03-18', NOW(), NOW()),
('req_10_08', 'dummy_user_10', '2026-03-20', NOW(), NOW()),
('req_10_09', 'dummy_user_10', '2026-03-22', NOW(), NOW()),
('req_10_10', 'dummy_user_10', '2026-03-25', NOW(), NOW()),
('req_10_11', 'dummy_user_10', '2026-03-27', NOW(), NOW()),
('req_10_12', 'dummy_user_10', '2026-03-29', NOW(), NOW()), -- 日
('req_10_13', 'dummy_user_10', '2026-03-31', NOW(), NOW()); -- 火

-- 完了メッセージ
SELECT 'ダミーデータの作成が完了しました' as message;
SELECT '- 10人のダミーユーザー' as info;
SELECT '- 各ユーザーの2026年3月のシフト希望' as info;
SELECT '注意: これらのユーザーはfirebaseUidがダミー値のためログインできません' as warning;
