'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Layout from '@/components/Layout';
import PasswordSetupForm from '@/components/PasswordSetupForm';

interface InvitationData {
  email: string;
  name: string;
  role: string;
}

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('無効な招待リンクです');
      setLoading(false);
      return;
    }

    // トークンを検証して招待情報を取得
    apiClient(`/users/invitation/${token}`, {
      method: 'GET',
    })
      .then((data) => {
        setInvitationData({
          email: data.email,
          name: data.name,
          role: data.role,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || '招待リンクが無効または期限切れです');
        setLoading(false);
      });
  }, [searchParams]);

  const handleSubmit = async (password: string) => {
    const token = searchParams.get('token');
    if (!token) {
      throw new Error('無効な招待リンクです');
    }

    await apiClient('/users/signup', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    // サインアップ完了後、ログイン画面へリダイレクト
    router.push('/login?registered=true');
  };

  if (loading) {
    return (
      <Layout title="サインアップ" hideUsername>
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="サインアップ" hideUsername>
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
    <Layout title="サインアップ" hideUsername>
      <div className="mb-4">
        <p className="text-gray-600">
          招待されたメールアドレス: <span className="font-bold">{invitationData?.email}</span>
        </p>
        <p className="text-gray-600 mt-1">
          名前: <span className="font-bold">{invitationData?.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          パスワードを設定してアカウントを有効化してください
        </p>
      </div>
      <PasswordSetupForm
        onSubmit={handleSubmit}
        title="パスワード設定"
        buttonText="アカウントを作成"
      />
    </Layout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
