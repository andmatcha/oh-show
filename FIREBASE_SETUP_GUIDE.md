# Firebase連携セットアップガイド

## 完了した作業

✅ Firebase Admin SDK インストール
✅ Firebase SDK インストール
✅ バックエンド実装（PrismaService, FirebaseService, UserService, Auth Guard）
✅ フロントエンド実装（Firebase設定, AuthContext, APIクライアント）

## 次のステップ

### 1. Firebase Console から Web SDK 設定を取得

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト設定（歯車アイコン）→「全般」タブ
3. 「マイアプリ」セクションで作成したウェブアプリを選択
4. 「SDK の設定と構成」の「構成」を選択
5. 表示される `firebaseConfig` オブジェクトの値をコピー

### 2. フロントエンドの環境変数を更新

`frontend/.env.local` ファイルを編集して、以下の項目を Firebase Console から取得した値に置き換えてください：

```env
# Firebase設定（Firebase Consoleから取得した値に置き換えてください）
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."  # ← 更新
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="oh-show.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="oh-show"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="oh-show.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."  # ← 更新
NEXT_PUBLIC_FIREBASE_APP_ID="1:123..."  # ← 更新
```

### 3. サーバーを起動して動作確認

```bash
# ルートディレクトリから両方のサーバーを起動
make start

# または個別に起動
# バックエンド
cd backend && npm run start:dev

# フロントエンド（別のターミナル）
cd frontend && npm run dev
```

### 4. 動作確認

#### バックエンドの確認
```bash
# ヘルスチェック
curl http://localhost:5050/api

# ユーザー一覧取得（認証なし）
curl http://localhost:5050/api/users
```

#### フロントエンドの確認
1. ブラウザで http://localhost:3000 を開く
2. 開発者ツールのコンソールを開いて、エラーがないか確認

## 実装されたAPI エンドポイント

### ユーザー管理（`/api/users`）

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|-----|
| GET | `/api/users` | 全ユーザー取得 | 不要 |
| GET | `/api/users/:id` | ユーザー詳細取得 | 不要 |
| POST | `/api/users` | ユーザー作成 | 不要 |
| PATCH | `/api/users/:id` | ユーザー更新 | 不要 |
| DELETE | `/api/users/:id` | ユーザー削除（論理削除） | 不要 |

※ 今後、必要に応じて `@UseGuards(FirebaseAuthGuard)` を追加して認証を必須にできます。

## 認証の使い方

### フロントエンドで認証を使用する

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <button onClick={() => signIn('test@example.com', 'password')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### バックエンドで認証が必要なエンドポイントを作成

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('protected')
@UseGuards(FirebaseAuthGuard)  // この行で認証必須にする
export class ProtectedController {
  @Get()
  getProtectedData() {
    return { message: 'This is protected data' };
  }
}
```

### フロントエンドから認証付きAPIを呼び出す

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

const { getIdToken } = useAuth();

const token = await getIdToken();
const data = await apiClient('/users', {
  token,
  method: 'GET'
});
```

## トラブルシューティング

### バックエンドが起動しない

1. PostgreSQL が起動しているか確認
   ```bash
   docker ps | grep postgres
   ```

2. 環境変数が正しく設定されているか確認
   ```bash
   cd backend
   cat .env
   ```

3. Firebase設定が正しいか確認（特に PRIVATE_KEY の改行）

### フロントエンドで Firebase エラーが出る

1. `.env.local` の設定を確認
2. ブラウザのコンソールでエラーメッセージを確認
3. Firebase Console で Authentication が有効になっているか確認

### CORS エラーが出る

バックエンドの `main.ts` で CORS が有効になっているか確認してください。
既に設定されているはずですが、念のため確認：

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

## 次の実装タスク

Firebase連携の基本実装が完了しました。次は以下の機能を実装できます：

1. **ログイン画面の実装** - `/login` ページの作成
2. **サインアップ画面の実装** - `/signup` ページの作成
3. **管理者によるユーザー招待機能** - メール送信
4. **保護されたルートの実装** - 認証必須ページ
5. **シフト管理機能** - ShiftRequest, Shift の CRUD API

どの機能から実装しますか？
