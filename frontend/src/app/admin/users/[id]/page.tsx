"use client";

import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
  updatedAt: string;
}

const UserEdit = () => {
  const { getIdToken, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 管理者権限チェック
  useEffect(() => {
    if (authLoading) return;

    if (!dbUser) {
      setError("認証エラー: ログインし直してください");
      setLoading(false);
      return;
    }

    if (dbUser.role !== "ADMIN") {
      setError("管理者権限が必要です");
      setLoading(false);
    }
  }, [authLoading, dbUser]);

  // ユーザー情報取得
  useEffect(() => {
    if (authLoading) return;
    if (dbUser?.role !== "ADMIN") return;

    const loadUser = async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          setError("認証エラー: ログインし直してください");
          setLoading(false);
          return;
        }

        const response: User = await apiClient(`/users/${userId}`, {
          method: "GET",
          token,
        });

        setUser(response);
        setName(response.name);
        setRole(response.role);
      } catch (err: unknown) {
        console.error("Failed to load user:", err);
        const errorMessage = err instanceof Error ? err.message : "";

        if (errorMessage.includes("404")) {
          setError("ユーザーが見つかりませんでした");
        } else if (
          errorMessage.includes("403") ||
          errorMessage.includes("Forbidden")
        ) {
          setError("管理者権限が必要です");
        } else if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized")
        ) {
          setError("セッションが切れました。再度ログインしてください。");
        } else {
          setError("ユーザー情報の読み込みに失敗しました");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, authLoading, dbUser, getIdToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // バリデーション
    if (!name.trim()) {
      setError("名前を入力してください");
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

      await apiClient(`/users/${userId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ name, role }),
      });

      setSuccessMessage("ユーザー情報を更新しました");

      // 成功メッセージを2秒表示してからリストへ戻る
      setTimeout(() => {
        router.push("/admin/users");
      }, 2000);
    } catch (err: unknown) {
      console.error("User update error:", err);
      const errorMessage = err instanceof Error ? err.message : "";

      if (
        errorMessage.includes("403") ||
        errorMessage.includes("Forbidden")
      ) {
        setError("管理者権限が必要です");
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        setError("セッションが切れました。再度ログインしてください。");
      } else {
        setError(errorMessage || "ユーザー情報の更新に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当にこのユーザーを削除しますか？")) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error("認証エラー: ログインし直してください");
      }

      await apiClient(`/users/${userId}`, {
        method: "DELETE",
        token,
      });

      alert("ユーザーを削除しました");
      router.push("/admin/users");
    } catch (err: unknown) {
      console.error("User delete error:", err);
      const errorMessage = err instanceof Error ? err.message : "";

      if (
        errorMessage.includes("403") ||
        errorMessage.includes("Forbidden")
      ) {
        setError("管理者権限が必要です");
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        setError("セッションが切れました。再度ログインしてください。");
      } else {
        setError(errorMessage || "ユーザーの削除に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Layout title="ユーザー編集">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error && !user) {
    return (
      <Layout title="ユーザー編集">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push("/admin/users")}
          className="bg-blue-600 rounded-lg p-4 text-white hover:bg-blue-700 transition-all duration-300 cursor-pointer"
        >
          ユーザーリストへ戻る
        </button>
      </Layout>
    );
  }

  return (
    <Layout title="ユーザー編集">
      <div className="max-w-2xl mx-auto">
        {/* ユーザー情報表示 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            メールアドレス:{" "}
            <span className="font-bold text-gray-800">{user?.email}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            登録日: {user && formatDate(user.createdAt)}
          </p>
          <p className="text-xs text-gray-500">
            最終更新: {user && formatDate(user.updatedAt)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col gap-4">
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

          {/* 成功メッセージ */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* ボタン */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-lg p-4 text-white transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {isSubmitting ? "更新中..." : "更新"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="w-full rounded-lg p-4 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              戻る
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className={`w-full rounded-lg p-4 text-white transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 cursor-pointer"
              }`}
            >
              ユーザーを削除
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UserEdit;
