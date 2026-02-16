'use client';

import React, { useState } from 'react';

interface PasswordSetupFormProps {
  onSubmit: (password: string) => Promise<void>;
  title: string;
  buttonText: string;
}

const PasswordSetupForm = ({ onSubmit, title, buttonText }: PasswordSetupFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!password.trim() || !confirmPassword.trim()) {
      setError('パスワードを入力してください');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    if (password.length > 32) {
      setError('パスワードは32文字以下で入力してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(password);
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl mb-4">{title}</h2>

        <div>
          <h3>パスワード</h3>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={32}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-2"
            disabled={loading}
          />
        </div>

        <div>
          <h3>パスワード（確認）</h3>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            maxLength={32}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-2"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 rounded-lg p-4 text-white transition-all duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {loading ? '処理中...' : buttonText}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
};

export default PasswordSetupForm;
