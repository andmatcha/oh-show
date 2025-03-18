"use client";

import Layout from "@/components/Layout";
import React, { useState } from "react";

interface FormData {
  name: string;
  email: string;
  role: "clerk" | "leader" | "admin";
}

const CreateUser = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "clerk",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.role.trim()
    ) {
      setError("すべての項目を入力してください");
      return;
    } else if (formData.name.length > 20) {
      setError("名前は20文字以下で入力してください");
      return;
    } else if (formData.email.length > 254) {
      setError("メールアドレスは254文字以下で入力してください");
      return;
    }
    setError("");
    const sanitizedData: FormData = {
      name: formData.name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      email: formData.email.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      role: formData.role,
    };
    // 追加処理
    console.log(sanitizedData);
  };
  return (
    <Layout title="新規ユーザー追加">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* 名前 */}
          <div>
            <h3>名前</h3>
            <input
              name="name"
              type="text"
              required
              minLength={1}
              maxLength={20}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
            />
          </div>
          {/* メールアドレス */}
          <div>
            <h3>メールアドレス</h3>
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
            />
          </div>
          {/* 権限選択(ラジオボタン) */}
          <div>
            <h3>権限</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <input
                  type="radio"
                  name="role"
                  id="clerk"
                  value="clerk"
                  required
                  onChange={handleChange}
                />
                <label htmlFor="clerk">バイト</label>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="radio"
                  name="role"
                  id="leader"
                  value="leader"
                  required
                  onChange={handleChange}
                />
                <label htmlFor="leader">バイトリーダー</label>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="radio"
                  name="role"
                  id="admin"
                  value="admin"
                  required
                  onChange={handleChange}
                />
                <label htmlFor="admin">管理者</label>
              </div>
            </div>
          </div>
          {/* 追加ボタン */}
          <div className="px-8">
            <button
              type="submit"
              className="w-full bg-blue-600 rounded-lg p-4 text-white hover:bg-blue-700 transition-all duration-300 cursor-pointer"
            >
              追加
            </button>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </form>
    </Layout>
  );
};

export default CreateUser;
