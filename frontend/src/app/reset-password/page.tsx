'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import PasswordSetupForm from '@/components/PasswordSetupForm';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyResetCode, confirmNewPassword } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setError('無効なリンクです');
      setLoading(false);
      return;
    }

    // トークンを検証してメールアドレスを取得
    verifyResetCode(oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setLoading(false);
      })
      .catch(() => {
        setError('リンクが無効または期限切れです');
        setLoading(false);
      });
  }, [searchParams, verifyResetCode]);

  const handleSubmit = async (password: string) => {
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      throw new Error('無効なリンクです');
    }

    await confirmNewPassword(oobCode, password);

    // パスワード再設定完了後、ログイン画面へリダイレクト
    router.push('/login?reset=true');
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
        <p className="text-gray-600">
          メールアドレス: <span className="font-bold">{email}</span>
        </p>
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
