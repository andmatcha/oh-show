"use client";

import Layout from "@/components/Layout";
import Url from "@/constants/url";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Top = () => {
  const router = useRouter();

  const isAdmin = true; // 管理者判定

  const handleClick = () => {
    // ログアウト処理
    router.push(Url.login);
  };
  return (
    <Layout title="ホーム">
      <div className="py-2 flex flex-col gap-2 mb-4">
        <Link
          href={Url.submit}
          className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
        >
          シフト登録
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
            ユーザー一覧
          </Link>
          <Link
            href={Url.admin.createUser}
            className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
          >
            ユーザー追加
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
