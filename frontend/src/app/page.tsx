"use client";

import Layout from "@/components/Layout";
import Url from "@/constants/url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Top = () => {
  const router = useRouter();
  const { signOut, dbUser, user, loading } = useAuth();

  // ログインチェック
  useEffect(() => {
    if (!loading && !user) {
      router.push(Url.login);
    }
  }, [loading, user, router]);

  const isAdmin = dbUser?.role === 'ADMIN';

  const handleClick = async () => {
    try {
      // Firebase認証からサインアウト
      await signOut();
      // ログイン画面に遷移
      router.push(Url.login);
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  // ローディング中またはログインしていない場合
  if (loading) {
    return (
      <Layout title="ホーム">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // リダイレクト中は何も表示しない
  }

  return (
    <Layout title="ホーム">
      <div className="py-2 flex flex-col gap-2 mb-4">
        <Link
          href={Url.submit}
          className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
        >
          シフト提出
        </Link>
        <Link
          href={Url.changePassword}
          className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
        >
          パスワード変更
        </Link>
      </div>
      {isAdmin && (
        <div className="py-2 flex flex-col gap-2 mb-4">
          <h3 className="text-lg">管理者メニュー</h3>
          <Link
            href={Url.admin.shiftRequests}
            className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
          >
            シフト提出状況確認
          </Link>
          <Link
            href={Url.admin.users}
            className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
          >
            ユーザーリスト
          </Link>
          <Link
            href={Url.admin.createUser}
            className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
          >
            新規ユーザー追加
          </Link>
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        className="border border-gray-400 p-1 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
      >
        ログアウト
      </button>
    </Layout>
  );
};

export default Top;
