"use client";

import React from "react";
import Header from "./Header";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: React.ReactNode;
  title: string;
  hideUsername?: boolean;
};

const Layout = ({ children, title, hideUsername = false }: Props) => {
  const { dbUser } = useAuth();

  return (
    <div>
      <Header />
      <div className="w-full h-16"></div>
      <div className="px-4 py-2">
        {hideUsername || (
          <p className="w-full py-2 flex justify-end text-sm">
            ログイン中：{dbUser?.name || "読み込み中..."}
          </p>
        )}
        <h2 className="text-2xl">{title}</h2>
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
