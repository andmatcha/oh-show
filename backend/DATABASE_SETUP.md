# データベースセットアップガイド

## 1. PostgreSQLのインストール

### macOSの場合
```bash
# Homebrewでインストール
brew install postgresql@15

# PostgreSQLの起動
brew services start postgresql@15
```

### Dockerを使う場合（推奨）
```bash
# PostgreSQLコンテナを起動
docker run --name oh-show-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=oh_show \
  -p 5432:5432 \
  -d postgres:15-alpine

# コンテナの起動確認
docker ps
```

## 2. 環境変数の設定

`.env`ファイルが作成されていることを確認し、必要に応じて編集してください。

```bash
# .envファイルの確認
cat .env

# データベースURLの例
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oh_show?schema=public"
```

## 3. Prisma Clientの生成

```bash
npm run prisma:generate
```

このコマンドで `src/generated/prisma` に Prisma Client が生成されます。

## 4. マイグレーションの実行

### 初回マイグレーション
```bash
npm run prisma:migrate
# マイグレーション名を入力: init
```

これにより以下のテーブルが作成されます：
- `users` - ユーザー情報
- `shift_months` - 月ごとのシフト管理
- `shift_requirements` - 日ごとの必要人数
- `shift_requests` - ユーザーの希望シフト
- `shifts` - 確定シフト

### マイグレーションステータスの確認
```bash
npx prisma migrate status
```

## 5. Prisma Studioでデータ確認（オプション）

```bash
npm run prisma:studio
```

ブラウザで `http://localhost:5555` が開き、データベースの内容をGUIで確認・編集できます。

## トラブルシューティング

### データベースに接続できない場合

1. PostgreSQLが起動しているか確認
```bash
# macOSの場合
brew services list | grep postgresql

# Dockerの場合
docker ps | grep oh-show-postgres
```

2. データベースURLが正しいか確認
```bash
# 接続テスト
psql postgresql://postgres:postgres@localhost:5432/oh_show
```

3. データベースが存在しない場合は作成
```bash
# PostgreSQLに接続
psql -U postgres

# データベースを作成
CREATE DATABASE oh_show;

# 確認
\l

# 終了
\q
```

### マイグレーションをリセットしたい場合

```bash
# すべてのテーブルを削除してマイグレーションを再実行
npx prisma migrate reset
```

⚠️ **注意**: このコマンドはすべてのデータを削除します！

## 次のステップ

データベースのセットアップが完了したら、以下を実行してください：

1. Prisma Clientを生成: `npm run prisma:generate`
2. マイグレーションを実行: `npm run prisma:migrate`
3. バックエンドサーバーを起動: `npm run start:dev`
