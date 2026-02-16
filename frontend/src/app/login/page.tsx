"use client";

import Layout from "@/components/Layout";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface FormData {
  email: string;
  password: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // すでにログイン済みの場合はホームへリダイレクト
    if (user) {
      router.push('/');
    }

    // サインアップ完了メッセージ
    if (searchParams.get('registered') === 'true') {
      setSuccess('アカウントが作成されました。ログインしてください。');
    }

    // パスワード再設定完了メッセージ
    if (searchParams.get('reset') === 'true') {
      setSuccess('パスワードが再設定されました。ログインしてください。');
    }
  }, [user, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    } else if (formData.email.length > 254) {
      setError("メールアドレスは254文字以下で入力してください");
      return;
    }

    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      // ログイン成功後、ホーム画面へリダイレクト
      router.push('/');
    } catch {
      setError('メールアドレスまたはパスワードが間違っています');
      setLoading(false);
    }
  };

  return (
    <Layout title="ログイン" hideUsername>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <h3>メールアドレス</h3>
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
              disabled={loading}
            />
          </div>
          <div>
            <h3>パスワード</h3>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={32}
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 rounded-lg p-4 text-white transition-all duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>
    </Layout>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
