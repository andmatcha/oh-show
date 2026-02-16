# 認証機能テストガイド

## 実装された機能

### 1. ユーザー招待フロー
- 管理者が招待リンクを生成
- ユーザーがリンクからパスワードを設定
- 初回ログイン

### 2. ログイン機能
- メール・パスワードでログイン
- ログイン状態の維持
- 認証トークンの自動取得

### 3. パスワード再設定
- パスワード忘れた場合の再設定フロー

## テスト手順

### セットアップ

1. **サーバーを起動**
   ```bash
   # ルートディレクトリで
   make start

   # または個別に
   cd backend && npm run start:dev
   cd frontend && npm run dev
   ```

2. **Firebase設定の確認**
   - バックエンド: `backend/.env` の Firebase 設定
   - フロントエンド: `frontend/.env.local` の Firebase 設定

### テスト1: ユーザー招待

#### API経由でユーザーを招待

```bash
curl -X POST http://localhost:5050/api/users/invite \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "テストユーザー",
    "role": "STAFF"
  }'
```

**期待される結果:**
```json
{
  "inviteLink": "http://localhost:3000/signup?oobCode=...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "テストユーザー",
    "role": "STAFF"
  }
}
```

#### 招待リンクの確認

1. レスポンスの `inviteLink` をコピー
2. ブラウザで開く
3. サインアップ画面が表示される
4. メールアドレスが表示されている

#### パスワード設定

1. パスワードを入力（8-32文字）
2. パスワード（確認）に同じパスワードを入力
3. 「アカウントを作成」ボタンをクリック

**期待される動作:**
- パスワードが設定される
- ログイン画面へリダイレクト
- 「アカウントが作成されました」メッセージが表示

### テスト2: ログイン

1. http://localhost:3000/login にアクセス
2. 招待したメールアドレスを入力
3. 設定したパスワードを入力
4. 「ログイン」ボタンをクリック

**期待される動作:**
- ログインが成功
- ホーム画面（`/`）へリダイレクト
- AuthContext の `user` にユーザー情報がセット

#### ログイン状態の確認

ブラウザの開発者ツール → Consoleで確認:

```javascript
// Firebaseの現在のユーザーを確認
firebase.auth().currentUser

// または
// AuthContext の user を確認（Reactコンポーネント内で）
const { user } = useAuth();
console.log(user);
```

### テスト3: パスワード再設定

#### Firebase Consoleから再設定リンクを送信

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. Authentication → Users タブ
3. テストユーザーの右側の「...」メニュー
4. 「パスワードをリセット」を選択
5. メールが送信される

#### または、プログラムで送信

```bash
# バックエンドでFirebaseService.generatePasswordResetLinkを使用
# （今後、フロントエンドに「パスワードを忘れた」リンクを追加する予定）
```

#### 再設定フロー

1. メールのリンクをクリック
2. `/reset-password?oobCode=xxx` が開く
3. 新しいパスワードを2回入力
4. 「パスワードを変更」ボタンをクリック

**期待される動作:**
- パスワードが変更される
- ログイン画面へリダイレクト
- 「パスワードが再設定されました」メッセージが表示

### テスト4: API認証

#### 認証付きAPIの呼び出し

```javascript
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

const { getIdToken } = useAuth();

// 認証トークンを取得
const token = await getIdToken();

// 認証付きAPIを呼び出し
const users = await apiClient('/users', {
  method: 'GET',
  token
});
```

## よくある問題と解決方法

### 問題1: 招待リンクが「無効または期限切れ」

**原因:**
- リンクは1時間で期限切れ
- すでに使用済み

**解決方法:**
- 新しい招待リンクを生成

### 問題2: パスワード設定後もログインできない

**確認事項:**
1. Firebase Consoleでユーザーが作成されているか確認
2. データベースでユーザーが作成されているか確認
   ```bash
   cd backend
   npm run prisma:studio
   ```
3. パスワードが正しいか確認

### 問題3: CORS エラー

**解決方法:**
1. バックエンドの`.env`で`FRONTEND_URL`を確認
   ```
   FRONTEND_URL="http://localhost:3000"
   ```
2. main.tsのCORS設定を確認

### 問題4: Firebase 認証エラー

**確認事項:**
1. フロントエンドの`.env.local`のFirebase設定
2. バックエンドの`.env`のFirebase設定
3. Firebase Consoleで Authentication が有効か確認

## 次のステップ

### 実装推奨機能

1. **パスワード忘れたリンク**
   - ログイン画面に「パスワードを忘れた」リンク追加
   - メールアドレス入力フォーム
   - Firebase の `sendPasswordResetEmail` 使用

2. **管理画面**
   - ユーザー一覧表示
   - 招待リンク生成UI
   - ユーザー編集・削除

3. **保護されたルート**
   - 認証が必要なページの実装
   - 未ログイン時のリダイレクト

4. **権限チェック**
   - ADMIN権限のチェック
   - STAFF権限のチェック

### 実装例: 保護されたページ

```typescript
// app/protected/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>保護されたページ</h1>
      <p>ようこそ、{user.email}さん</p>
    </div>
  );
}
```

## デバッグのヒント

### Firebase Authのデバッグ

```javascript
// フロントエンド - 認証状態の監視
import { auth } from '@/lib/firebase';

auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user);
});
```

### バックエンドのデバッグ

```typescript
// firebase.service.ts にログ追加
async verifyToken(token: string) {
  console.log('Verifying token:', token.substring(0, 20) + '...');
  const decoded = await this.app.auth().verifyIdToken(token);
  console.log('Decoded token:', decoded);
  return decoded;
}
```

## まとめ

認証フローの実装が完了しました。以下の機能が動作します：

✅ ユーザー招待（管理者機能）
✅ パスワード設定（初回登録）
✅ ログイン
✅ パスワード再設定
✅ 認証状態の管理
✅ 認証付きAPI呼び出し

次は、これらの機能を使って実際のアプリケーション機能（シフト管理など）を実装していきましょう！
