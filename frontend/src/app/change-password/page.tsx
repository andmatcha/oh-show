"use client";

import Layout from "@/components/Layout";
import React, { useState } from "react";

interface FormData {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

const ChangePassword = () => {
  const [formData, setFormData] = useState<FormData>({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.current_password.trim() ||
      !formData.new_password.trim() ||
      !formData.new_password_confirm.trim()
    ) {
      setError("すべての項目を入力してください");
      return;
    } else if (
      formData.current_password.length < 8 ||
      formData.current_password.length > 32 ||
      formData.new_password.length < 8 ||
      formData.new_password.length > 32 ||
      formData.new_password_confirm.length < 8 ||
      formData.new_password_confirm.length > 32
    ) {
      setError("パスワードは8文字以上32文字以下で入力してください");
      return;
    } else if (formData.new_password !== formData.new_password_confirm) {
      setError("パスワードが一致しません");
      return;
    } else if (formData.current_password === formData.new_password) {
      setError("同じパスワードは使用できません");
      return;
    }
    setError("");
    const sanitizedData: FormData = {
      current_password: formData.current_password
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;"),
      new_password: formData.new_password
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;"),
      new_password_confirm: formData.new_password_confirm
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;"),
    };
    // 更新処理
    console.log(sanitizedData);
  };

  return (
    <Layout title="パスワード変更">
      <form onSubmit={handleSubmit}>
        <div className="mt-4 mb-8 flex flex-col gap-2">
          <div>
            <h3>現在のパスワード</h3>
            <input
              name="current_password"
              type="password"
              required
              minLength={8}
              maxLength={32}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
            />
          </div>
          <div>
            <h3>新しいパスワード</h3>
            <input
              name="new_password"
              type="password"
              required
              minLength={8}
              maxLength={32}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
            />
          </div>
          <div>
            <h3>新しいパスワード(再入力)</h3>
            <input
              name="new_password_confirm"
              type="password"
              required
              minLength={8}
              maxLength={32}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
            />
          </div>
        </div>
        <div className="px-8 mb-4">
          <button
            type="submit"
            className="w-full bg-blue-600 rounded-lg p-4 text-white hover:bg-blue-700 transition-all duration-300 cursor-pointer"
          >
            変更
          </button>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </form>
    </Layout>
  );
};

export default ChangePassword;
