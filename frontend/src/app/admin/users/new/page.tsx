"use client";

import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

const NewUser = () => {
  const { getIdToken, dbUser, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // 管理者権限チェック
  useEffect(() => {
    if (authLoading) return;

    if (!dbUser) {
      setError("認証エラー: ログインし直してください");
      return;
    }

    if (dbUser.role !== "ADMIN") {
      setError("管理者権限が必要です");
    }
  }, [authLoading, dbUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setInvitationUrl("");
    setExpiresAt("");
    setCopied(false);

    // バリデーション
    if (!email.trim() || !name.trim()) {
      setError("メールアドレスと名前を入力してください");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    if (name.length > 50) {
      setError("名前は50文字以内で入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error("認証エラー: ログインし直してください");
      }

      const response = await apiClient("/invitations", {
        method: "POST",
        token,
        body: JSON.stringify({ email, name, role }),
      });

      setInvitationUrl(response.invitationUrl);
      setExpiresAt(new Date(response.expiresAt).toLocaleString("ja-JP"));
      setSuccessMessage("招待リンクを生成しました");

      // フォームをクリア
      setEmail("");
      setName("");
      setRole("STAFF");
    } catch (err: unknown) {
      console.error("Invitation creation error:", err);
      const errorMessage = err instanceof Error ? err.message : "";

      if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        setError("管理者権限が必要です");
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        setError("セッションが切れました。再度ログインしてください。");
      } else if (errorMessage.includes("既に登録されています")) {
        setError("このメールアドレスは既に登録されています");
      } else {
        setError(errorMessage || "招待リンクの生成に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("コピーに失敗しました");
    }
  };

  if (authLoading) {
    return (
      <Layout title="新規ユーザー追加">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (dbUser?.role !== "ADMIN") {
    return (
      <Layout title="新規ユーザー追加">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "管理者権限が必要です"}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="新規ユーザー追加">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-gray-600 mb-6">
          新しいユーザーの情報を入力して招待リンクを生成します。生成された招待リンクを対象のユーザーに送信してください。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col gap-4">
            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium mb-2">
                メールアドレス <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@example.com"
                className="w-full border border-gray-400 rounded-md p-2"
              />
            </div>

            {/* 名前 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                名前 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
                placeholder="山田太郎"
                className="w-full border border-gray-400 rounded-md p-2"
              />
            </div>

            {/* 権限 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                権限 <span className="text-red-600">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "STAFF" | "ADMIN")}
                className="w-full border border-gray-400 rounded-md p-2"
              >
                <option value="STAFF">スタッフ</option>
                <option value="ADMIN">管理者</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                スタッフ: シフト提出のみ可能 / 管理者: 全機能が利用可能
              </p>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* 成功メッセージと招待リンク */}
          {successMessage && invitationUrl && (
            <div className="mb-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-bold text-sm mb-2">招待リンク</h3>
                <p className="text-xs text-gray-600 mb-2">
                  有効期限: {expiresAt}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invitationUrl}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
                      copied
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {copied ? "コピー完了!" : "コピー"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <div className="px-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-lg p-4 text-white transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {isSubmitting ? "生成中..." : "招待リンクを生成"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewUser;
