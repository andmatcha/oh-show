"use client";

import Layout from "@/components/Layout";
import React, { useState } from "react";

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("メールアドレスとパスワードを入力してください");
    }

    const sanitizedData = {
      email: formData.email.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      name: formData.password.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    };
    // ログイン処理
    console.log(sanitizedData);
  };
  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 p-4">
          <h2 className="text-2xl font-bold">ログイン</h2>
          <div>
            <h3>メールアドレス</h3>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
            />
          </div>
          <div>
            <h3>パスワード</h3>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-md p-2"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 rounded-lg p-4 text-white hover:bg-blue-700 transition-all duration-300"
          >
            ログイン
          </button>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </form>
    </Layout>
  );
};

export default Login;
