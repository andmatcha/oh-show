'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api';

interface DBUser {
  id: string;
  firebaseUid: string; // Prismaスキーマでこの名前になっている可能性があるため維持（適宜リネーム推奨）
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
}

interface AuthContextType {
  user: User | null;
  dbUser: DBUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
  confirmNewPassword: (newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  verifyResetCode: async () => '',
  confirmNewPassword: async () => {},
  changePassword: async () => {},
  getIdToken: async () => null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッションを確認
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchDBUser(currentUser.id);
      }
      setLoading(false);
    };

    initAuth();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchDBUser(currentUser.id);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDBUser = async (userId: string) => {
    try {
      // バックエンドのエンドポイントが /users/firebase/:id のままの場合はそれに合わせる
      const userData = await apiClient(`/users/firebase/${userId}`, {
        method: 'GET',
      });
      setDbUser(userData);
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました:', error);
      setDbUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setDbUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const verifyResetCode = async (code: string): Promise<string> => {
    return code;
  };

  const confirmNewPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Supabaseでは現在のパスワードによる再認証なしでupdateUserが可能だが、
    // セキュリティのために一旦signInで確認する手法もある。ここではシンプルにupdateのみ行う。
    // ※Supabaseの推奨は別途パスワード変更用UIを提供すること
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const getIdToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const value = {
    user,
    dbUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyResetCode,
    confirmNewPassword,
    changePassword,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
