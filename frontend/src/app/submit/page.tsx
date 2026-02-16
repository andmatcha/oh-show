"use client";

import Calender from "@/components/Calender";
import Layout from "@/components/Layout";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

const Submit = () => {
  const { getIdToken, loading: authLoading } = useAuth();

  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [dates, setDates] = useState<number[]>([]);
  const [originalDates, setOriginalDates] = useState<number[]>([]); // 元の状態を保存
  const [hasSubmitted, setHasSubmitted] = useState(false); // 提出済みかどうか
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OPEN状態のシフト月を取得
  useEffect(() => {
    const fetchCurrentOpenMonth = async () => {
      try {
        const response = await apiClient("/shift-months/current", {
          method: "GET",
        });

        const [y, m] = response.yearMonth.split("-").map(Number);
        setYear(y);
        setMonth(m);
      } catch (err: unknown) {
        console.error("Failed to fetch current open month:", err);
        setError(
          "現在提出可能なシフト月が見つかりませんでした。管理者にお問い合わせください。"
        );
        setLoading(false);
      }
    };

    fetchCurrentOpenMonth();
  }, []);

  // 既存シフトの読み込み（year, monthが確定し、認証状態が確定した後に実行）
  useEffect(() => {
    // 認証状態が確定するまで待機
    if (authLoading) {
      return;
    }

    if (year === null || month === null) {
      return;
    }

    const loadExistingShifts = async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          setError("認証エラー: ログインし直してください");
          setLoading(false);
          return;
        }

        const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;

        const response = await apiClient(
          `/shift-requests?yearMonth=${yearMonth}`,
          {
            method: "GET",
            token,
          }
        );

        const existingDates = response.dates || [];
        setDates(existingDates);
        setOriginalDates(existingDates); // 元の状態を保存
        setHasSubmitted(response.hasSubmitted || false); // 提出済み状態を保存
      } catch (err: unknown) {
        console.error("Failed to load existing shifts:", err);
        // 初回提出の場合は404エラーが返る可能性があるため、エラーは表示しない
        const errorMessage = err instanceof Error ? err.message : "";
        if (!errorMessage.includes("404")) {
          setError("既存のシフト情報の読み込みに失敗しました");
        }
      } finally {
        setLoading(false);
      }
    };

    loadExistingShifts();
  }, [year, month, authLoading, getIdToken]);

  const handleClick = (value: number | undefined) => {
    let newDates: number[] = [];
    if (!value) return;
    if (!dates.includes(value)) {
      newDates = [...dates, value];
    } else {
      newDates = dates.filter((date) => date !== value);
    }
    setDates(newDates);
  };

  // 変更があるかどうかを判定
  const hasChanges = (): boolean => {
    if (dates.length !== originalDates.length) return true;
    const sortedDates = [...dates].sort((a, b) => a - b);
    const sortedOriginal = [...originalDates].sort((a, b) => a - b);
    return !sortedDates.every((date, index) => date === sortedOriginal[index]);
  };

  // 元に戻す
  const handleReset = () => {
    setDates([...originalDates]);
    setError("");
    setSuccessMessage("");
  };

  // 提出期間チェック
  const isSubmissionPeriodOpen = (): boolean => {
    const today = dayjs();
    const currentDate = today.date();
    return currentDate >= 15 && currentDate <= 20;
  };

  const handleSubmit = async (e: React.FormEvent, dates: number[]) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    // バリデーション
    if (year === null || month === null) {
      setError("年月情報の読み込みに失敗しました");
      setSubmitting(false);
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error("認証エラー: ログインし直してください");
      }

      const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;

      await apiClient("/shift-requests", {
        method: "POST",
        token,
        body: JSON.stringify({ yearMonth, dates }),
      });

      setSuccessMessage("シフト希望を提出しました");
      setOriginalDates([...dates]); // 提出成功後、現在の状態を元の状態として保存
      setHasSubmitted(true); // 提出済み状態を更新

      // 成功メッセージを3秒後に消す
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: unknown) {
      console.error("Shift submission error:", err);

      const errorMessage = err instanceof Error ? err.message : "";

      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError("セッションが切れました。再度ログインしてください。");
      } else if (
        errorMessage.includes("403") ||
        errorMessage.includes("Forbidden")
      ) {
        setError("シフト提出期間外です（毎月15日〜20日が提出期間です）");
      } else if (
        errorMessage.includes("fetch") ||
        errorMessage.includes("network")
      ) {
        setError("ネットワークエラー: 接続を確認してください");
      } else {
        setError(errorMessage || "シフトの提出に失敗しました");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="シフト提出">
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>読み込み中...</p>
        </div>
      ) : (
        <form onSubmit={(e) => handleSubmit(e, dates)}>
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

          {/* 提出期間外の警告 */}
          {!isSubmissionPeriodOpen() && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              シフト提出期間外です（毎月15日〜20日が提出期間です）
            </div>
          )}

          <div className="pb-8">
            <Calender
              year={year!}
              month={month!}
              dates={dates}
              setDates={setDates}
              handleClick={handleClick}
            />
          </div>

          <ul className="w-full flex flex-col gap-2 mt-4 mb-8 border border-gray-200 rounded-md p-2">
            <li className="w-full flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-pink-400 bg-pink-200"></div>
              <p className="text-sm">選択中</p>
            </li>
            <li className="w-full flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-sky-200 bg-sky-50"></div>
              <p className="text-sm">未選択（選択可能）</p>
            </li>
            <li className="w-full flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-transparent bg-gray-100"></div>
              <p className="text-sm">選択不可</p>
            </li>
          </ul>

          <div className="px-8">
            {!hasSubmitted ? (
              // 初回提出の場合
              <button
                type="submit"
                disabled={submitting || !isSubmissionPeriodOpen()}
                className={`w-full rounded-lg p-4 text-white transition-all duration-300 ${
                  submitting || !isSubmissionPeriodOpen()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
              >
                {submitting ? "提出中..." : "提出"}
              </button>
            ) : (
              // 提出済みの場合
              <>
                {/* 再提出ボタン: 変更がない場合はグレーアウト */}
                <button
                  type="submit"
                  disabled={
                    submitting || !isSubmissionPeriodOpen() || !hasChanges()
                  }
                  className={`w-full rounded-lg p-4 text-white transition-all duration-300 ${
                    submitting || !isSubmissionPeriodOpen() || !hasChanges()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {submitting ? "提出中..." : "再提出"}
                </button>

                {/* 変更がある場合のみ「元に戻す」ボタンを表示 */}
                {hasChanges() && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full rounded-lg p-4 mt-4 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    元に戻す
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      )}
    </Layout>
  );
};

export default Submit;
