"use client";

import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
}

const UsersList = () => {
  const { getIdToken, dbUser, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // ユーザーリスト取得
  useEffect(() => {
    if (authLoading) return;
    if (dbUser?.role !== "ADMIN") return;

    const loadUsers = async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          setError("認証エラー: ログインし直してください");
          setLoading(false);
          return;
        }

        const response: User[] = await apiClient("/users", {
          method: "GET",
          token,
        });

        setUsers(response);
      } catch (err: unknown) {
        console.error("Failed to load users:", err);
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
          setError("ユーザーリストの読み込みに失敗しました");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [authLoading, dbUser, getIdToken]);

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          管理者
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
        スタッフ
      </span>
    );
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
      <Layout title="ユーザー一覧">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="ユーザー一覧">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="ユーザー一覧">
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          全{users.length}名のユーザーが登録されています。クリックして詳細を編集できます。
        </p>
      </div>

      {/* ユーザーカードリスト */}
      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/admin/users/${user.id}`}
            className="block p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{user.name}</h3>
                  {getRoleBadge(user.role)}
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-400 mt-2">
                  登録日: {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          登録されているユーザーがいません
        </div>
      )}
    </Layout>
  );
};

export default UsersList;
