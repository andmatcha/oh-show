"use client";

import Layout from "@/components/Layout";
import Url from "@/constants/url";
import Link from "next/link";

const Top = () => {
  const handleClick = () => {
    // ログアウト処理
  };
  return (
    <Layout title="メニュー">
      <div className="py-2 flex flex-col gap-2 mb-4">
        <Link
          href={Url.submit}
          className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
        >
          シフト登録
        </Link>
      </div>
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
