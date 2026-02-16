"use client";

import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

interface UserShiftData {
  id: string;
  name: string;
  email: string;
  hasSubmitted: boolean;
  dates: number[];
}

interface ShiftStatusResponse {
  yearMonth: string;
  users: UserShiftData[];
}

const ShiftStatus = () => {
  const { getIdToken, dbUser, loading: authLoading } = useAuth();

  const [yearMonth, setYearMonth] = useState<string>("");
  const [users, setUsers] = useState<UserShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

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
      return;
    }
  }, [authLoading, dbUser]);

  // OPEN状態のシフト月を取得
  useEffect(() => {
    const fetchCurrentOpenMonth = async () => {
      try {
        const response = await apiClient("/shift-months/current", {
          method: "GET",
        });
        setYearMonth(response.yearMonth);
      } catch (err: unknown) {
        console.error("Failed to fetch current open month:", err);
        setError(
          "現在提出可能なシフト月が見つかりませんでした。管理者にお問い合わせください。"
        );
        setLoading(false);
      }
    };

    if (dbUser?.role === "ADMIN") {
      fetchCurrentOpenMonth();
    }
  }, [dbUser]);

  // 全ユーザーのシフト状況を取得
  useEffect(() => {
    if (authLoading) return;
    if (!yearMonth) return;
    if (dbUser?.role !== "ADMIN") return;

    const loadAllShiftRequests = async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          setError("認証エラー: ログインし直してください");
          setLoading(false);
          return;
        }

        const response: ShiftStatusResponse = await apiClient(
          `/shift-requests/all?yearMonth=${yearMonth}`,
          {
            method: "GET",
            token,
          }
        );

        setUsers(response.users);
      } catch (err: unknown) {
        console.error("Failed to load shift status:", err);
        const errorMessage = err instanceof Error ? err.message : "";

        if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
          setError("管理者権限が必要です");
        } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
          setError("セッションが切れました。再度ログインしてください。");
        } else {
          setError("シフト提出状況の読み込みに失敗しました");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllShiftRequests();
  }, [yearMonth, authLoading, dbUser, getIdToken]);

  // 日付の配列を読みやすく整形（例: "1, 3, 5, 10"）
  const formatDates = (dates: number[]): string => {
    if (dates.length === 0) return "なし";
    return dates.sort((a, b) => a - b).join(", ");
  };

  // 年月を表示用にフォーマット（例: "2026-03" → "2026年3月"）
  const formatYearMonth = (ym: string): string => {
    const [year, month] = ym.split("-");
    return `${year}年${parseInt(month)}月`;
  };

  // CSVダウンロード
  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const token = await getIdToken();
      if (!token) {
        setError("認証エラー: ログインし直してください");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      const response = await fetch(
        `${API_URL}/shift-requests/export-csv?yearMonth=${yearMonth}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("CSVのダウンロードに失敗しました");
      }

      // Blobとしてダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shift-requests-${yearMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      console.error("CSV download error:", err);
      setError(
        err instanceof Error ? err.message : "CSVのダウンロードに失敗しました"
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="シフト提出状況">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="シフト提出状況">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="シフト提出状況">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">
          {formatYearMonth(yearMonth)} のシフト提出状況
        </h2>
        <p className="text-sm text-gray-600">
          全{users.length}名のスタッフのシフト提出状況を確認できます
        </p>
      </div>

      {/* 提出状況サマリー */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm">
          <span className="font-bold text-blue-700">
            提出済み: {users.filter((u) => u.hasSubmitted).length}名
          </span>
          {" / "}
          <span className="text-gray-600">
            未提出: {users.filter((u) => !u.hasSubmitted).length}名
          </span>
        </p>
      </div>

      {/* CSVダウンロードボタン */}
      <div className="mb-6">
        <button
          onClick={handleDownloadCsv}
          disabled={downloading || users.length === 0}
          className={`px-6 py-3 rounded-lg text-white transition-all duration-300 ${
            downloading || users.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 cursor-pointer"
          }`}
        >
          {downloading ? "ダウンロード中..." : "📥 CSVダウンロード"}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          日付ごとの出勤希望をCSV形式でダウンロードします
        </p>
      </div>

      {/* ユーザー一覧テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                名前
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                メールアドレス
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                提出状況
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                希望日
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={user.hasSubmitted ? "bg-white" : "bg-yellow-50"}
              >
                <td className="border border-gray-300 px-4 py-2">
                  {user.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {user.hasSubmitted ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      提出済み
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      未提出
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm">
                  {formatDates(user.dates)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          登録されているスタッフがいません
        </div>
      )}
    </Layout>
  );
};

export default ShiftStatus;
