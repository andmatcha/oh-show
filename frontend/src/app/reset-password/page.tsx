'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import PasswordSetupForm from '@/components/PasswordSetupForm';

function ResetPasswordContent() {
  const router = useRouter();
  const { confirmNewPassword } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SupabaseはURLハッシュ(#)にアクセストークンを含めてリダイレクトする
    // セッションが確立されているか確認
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('無効なリンクまたは期限切れのセッションです。もう一度パスワード再設定をリクエストしてください。');
        setLoading(false);
        return;
      }

      setEmail(session.user.email ?? 'ユーザー');
      setLoading(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (password: string) => {
    try {
      await confirmNewPassword(password);
      // パスワード再設定完了後、ログイン画面へリダイレクト
      router.push('/login?reset=true');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'パスワードの更新に失敗しました';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <Layout title="パスワード再設定" hideUsername>
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="パスワード再設定" hideUsername>
        <div className="flex flex-col gap-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 rounded-lg p-4 text-white hover:bg-blue-700 transition-all duration-300 cursor-pointer"
          >
            ログイン画面へ
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="パスワード再設定" hideUsername>
      <div className="mb-4">
        {email && (
          <p className="text-gray-600">
            メールアドレス: <span className="font-bold">{email}</span>
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          新しいパスワードを設定してください
        </p>
      </div>
      <PasswordSetupForm
        onSubmit={handleSubmit}
        title="新しいパスワード"
        buttonText="パスワードを変更"
      />
    </Layout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
