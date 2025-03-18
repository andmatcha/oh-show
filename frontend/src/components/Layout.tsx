import React from "react";
import Header from "./Header";

type Props = {
  children: React.ReactNode;
  title: string;
  hideUsername?: boolean;
};

const Layout = ({ children, title, hideUsername = false }: Props) => {
  return (
    <div>
      <Header />
      <div className="w-full h-16"></div>
      <div className="px-4 py-2">
        {hideUsername || (
          <p className="w-full py-2 flex justify-end text-sm">
            ログイン中：青柳仁
          </p>
        )}
        <h2 className="text-2xl">{title}</h2>
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
