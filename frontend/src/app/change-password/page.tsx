"use client";

import Layout from "@/components/Layout";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface FormData {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // バリデーション
    if (
      !formData.current_password.trim() ||
      !formData.new_password.trim() ||
      !formData.new_password_confirm.trim()
    ) {
      setError("すべての項目を入力してください");
      return;
    }

    if (
      formData.current_password.length < 8 ||
      formData.current_password.length > 32 ||
      formData.new_password.length < 8 ||
      formData.new_password.length > 32 ||
      formData.new_password_confirm.length < 8 ||
      formData.new_password_confirm.length > 32
    ) {
      setError("パスワードは8文字以上32文字以下で入力してください");
      return;
    }

    if (formData.new_password !== formData.new_password_confirm) {
      setError("パスワードが一致しません");
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError("同じパスワードは使用できません");
      return;
    }

    // パスワード変更処理
    setIsSubmitting(true);
    try {
      await changePassword(formData.current_password, formData.new_password);
      setSuccessMessage("パスワードを変更しました。3秒後にトップページに戻ります。");

      // フォームをクリア
      setFormData({
        current_password: "",
        new_password: "",
        new_password_confirm: "",
      });

      // 3秒後にトップページにリダイレクト
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: unknown) {
      console.error("Password change error:", err);
      const errorMessage = err instanceof Error ? err.message : "";

      if (errorMessage.includes("auth/wrong-password") || errorMessage.includes("invalid-credential")) {
        setError("現在のパスワードが正しくありません");
      } else if (errorMessage.includes("auth/weak-password")) {
        setError("新しいパスワードが弱すぎます");
      } else if (errorMessage.includes("auth/requires-recent-login")) {
        setError("セキュリティのため、再度ログインしてからパスワードを変更してください");
      } else {
        setError("パスワードの変更に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
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
        {/* 成功メッセージ */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="px-8 mb-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-lg p-4 text-white transition-all duration-300 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {isSubmitting ? "変更中..." : "変更"}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default ChangePassword;
