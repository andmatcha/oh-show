#!/bin/bash

# ダミーデータをデータベースに投入するスクリプト

echo "🌱 ダミーデータを投入します..."

# .envファイルからDATABASE_URLを読み込む
if [ -f .env ]; then
  export $(cat .env | grep DATABASE_URL | xargs)
else
  echo "❌ .envファイルが見つかりません"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URLが設定されていません"
  exit 1
fi

# PostgreSQL接続情報を抽出
# 例: postgresql://user:password@host:port/database
DB_URL=$DATABASE_URL

# psqlコマンドでSQLファイルを実行
psql "$DB_URL" -f prisma/seed-dummy-data.sql

if [ $? -eq 0 ]; then
  echo "✅ ダミーデータの投入が完了しました"
  echo ""
  echo "📊 作成されたデータ:"
  echo "   - ダミーユーザー: 10人"
  echo "   - シフト希望: 2026年3月分"
  echo ""
  echo "⚠️  注意: これらのユーザーはログインできません（firebaseUidがダミー値）"
else
  echo "❌ ダミーデータの投入に失敗しました"
  exit 1
fi
